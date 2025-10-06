# Nova Vybes — Replit Mobile Kit (SOL + USDC)

This project runs 100% from your phone (Replit app or browser).

## Quick Start
1) Upload this folder to Replit (Create Repl → Import From Zip).
2) Create a `.env` file (copy `.env.sample`) and paste your real values:
   TELEGRAM_BOT_TOKEN=...
   CRYPTOBOT_API_TOKEN=...
   PRICE_LEGEND=5
   PRICE_GRAIL=20
   CRYPTO_ASSET=USDC
   SOL_RECIPIENT=5Toej82ouu1rSCNAF334fSfC7tBZF5DmwrzpVPoiMK4d
   SOL_AMOUNT_LEGEND=0.10
   SOL_AMOUNT_GRAIL=0.40
3) Click **Run**. Copy the web URL for status. The bot runs immediately.

## Telegram
- DM @BotFather → /newbot → copy token
- Add your bot to your group and make it **Admin** (you already did this 👍).

## Payments
- USDC: handled by CryptoBot (in Telegram). The bot creates invoices automatically.
- SOL: button opens Solana Pay to your wallet with exact amount.
  - For automatic SOL verification we can add a webhook later; for now, manual verify is fine.

## Commands
- /start — welcome
- /legend — shows USDC + SOL buttons + redeem/waitlist
- /grail  — same for Grail

## Notes
- This starter keeps data in memory (no DB) for simplicity. We can add Airtable or Mongo next.
- The static page at / shows that the service is alive and links for quick tests.
