import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import { Telegraf, Markup } from 'telegraf';

const {
  TELEGRAM_BOT_TOKEN,
  CRYPTOBOT_API_TOKEN,
  PRICE_LEGEND = '5',
  PRICE_GRAIL = '20',
  CRYPTO_ASSET = 'USDC',
  SOL_RECIPIENT = '',
  SOL_AMOUNT_LEGEND = '0.10',
  SOL_AMOUNT_GRAIL  = '0.40',
} = process.env;

if(!TELEGRAM_BOT_TOKEN){ console.error('Missing TELEGRAM_BOT_TOKEN'); process.exit(1); }

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);
const app = express();
app.get('/', (_,res)=> res.send('Nova Vybes bot is running.'));
const port = process.env.PORT || 3000;
app.listen(port, ()=> console.log('Web server on', port));

function solanaPayLink(amount, note){
  if(!SOL_RECIPIENT) return null;
  const params = new URLSearchParams({ amount, label: 'Nova Vybes', message: note });
  return `solana:${SOL_RECIPIENT}?${params.toString()}`;
}

async function createInvoice(amount, desc, payload){
  if(!CRYPTOBOT_API_TOKEN) return null;
  const r = await axios.post('https://pay.crypt.bot/api/createInvoice', {
    asset: CRYPTO_ASSET, amount: String(amount),
    description: desc, hidden_message: "Nova Vybes — thank you for supporting the movement.",
    paid_btn_name: "callback", payload, allow_comments: false, expires_in: 900
  }, { headers: { 'Crypto-Pay-API-Token': CRYPTOBOT_API_TOKEN }});
  return r.data?.result;
}

bot.start((ctx)=> ctx.reply('👑 Grand Rising! Welcome to Nova Vybes.\nUse /legend or /grail to join.'));

function legendKeyboard(){
  const rows = [];
  rows.push([ Markup.button.callback(`💵 Pay ${PRICE_LEGEND} USDC (CryptoBot)`, 'pay_legend') ]);
  const sol = solanaPayLink(SOL_AMOUNT_LEGEND, 'Legend');
  if(sol) rows.push([ Markup.button.url(`🪙 Pay ${SOL_AMOUNT_LEGEND} SOL (Solana Pay)`, sol) ]);
  rows.push([ Markup.button.callback('🎯 Redeem 10,000 pts', 'redeem_legend') ]);
  rows.push([ Markup.button.callback('🕒 Join Waitlist', 'wait_legend') ]);
  return Markup.inlineKeyboard(rows);
}
function grailKeyboard(){
  const rows = [];
  rows.push([ Markup.button.callback(`💵 Pay ${PRICE_GRAIL} USDC (CryptoBot)`, 'pay_grail') ]);
  const sol = solanaPayLink(SOL_AMOUNT_GRAIL, 'Grail');
  if(sol) rows.push([ Markup.button.url(`🪙 Pay ${SOL_AMOUNT_GRAIL} SOL (Solana Pay)`, sol) ]);
  rows.push([ Markup.button.callback('🎯 Redeem 50,000 pts', 'redeem_grail') ]);
  rows.push([ Markup.button.callback('🕒 Join Waitlist', 'wait_grail') ]);
  return Markup.inlineKeyboard(rows);
}

bot.command('legend', (ctx)=> ctx.reply('Choose your option for Legend (lifetime):', legendKeyboard()));
bot.command('grail',  (ctx)=> ctx.reply('Choose your option for Grail (investor, lifetime):', grailKeyboard()));

bot.on('callback_query', async (ctx)=>{
  const data = ctx.callbackQuery.data;
  if(data === 'pay_legend' || data === 'pay_grail'){
    if(!CRYPTOBOT_API_TOKEN){
      return ctx.answerCbQuery('Payments not configured (admin must set CRYPTOBOT_API_TOKEN).', { show_alert: true });
    }
    const isLegend = data === 'pay_legend';
    const amount = isLegend ? PRICE_LEGEND : PRICE_GRAIL;
    const rank   = isLegend ? 'Legend' : 'Grail';
    try{
      const inv = await createInvoice(amount, `Nova Vybes — ${rank} (Lifetime)`, `${ctx.from.id}|${rank}`);
      if(!inv) throw new Error('No invoice');
      const btn = Markup.inlineKeyboard([ [Markup.button.url(`Pay ${amount} ${CRYPTO_ASSET}`, inv.pay_url)] ]);
      await ctx.reply(`🧾 Invoice #${inv.invoice_id} — ${rank}\nTap to pay in Telegram (CryptoBot).`, btn);
      await ctx.answerCbQuery();
    }catch(e){
      console.error(e);
      await ctx.answerCbQuery('Payment error — try again later.', { show_alert: true });
    }
  } else if (data === 'redeem_legend' || data === 'redeem_grail'){
    await ctx.answerCbQuery('Points redeem placeholder — coming next.', { show_alert: true });
  } else if (data === 'wait_legend' || data === 'wait_grail'){
    await ctx.answerCbQuery('Added to waitlist (placeholder).', { show_alert: true });
  } else {
    await ctx.answerCbQuery();
  }
});

bot.launch().then(()=> console.log('Nova Vybes bot launched.'));
process.once('SIGINT', ()=> bot.stop('SIGINT'));
process.once('SIGTERM',()=> bot.stop('SIGTERM'));
