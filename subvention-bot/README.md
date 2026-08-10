# Tunisia Subvention Bot (Telegram)

Personal Telegram bot that scans Tunisian funding sources **once every 24 hours** and notifies you about **new or updated** opportunities for:

- **IT / digital / startup** projects
- **Textile / embroidery / artisanat** projects

## Setup

### 1. Create a Telegram bot

1. Open [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot` and follow the steps
3. Copy the token

### 2. Configure

```bash
cd subvention-bot
cp .env.example .env
```

Edit `.env`:

```env
TELEGRAM_BOT_TOKEN=123456:ABC...
TELEGRAM_CHAT_ID=
```

`TELEGRAM_CHAT_ID` is optional — send `/start` to your bot and it will save your chat ID automatically.

### 3. Install and run

```bash
npm install
npm start
```

Send `/start` to your bot on Telegram, then `/search` to run the first scan.

## Commands

| Command | Description |
|---------|-------------|
| `/start` | Register your chat and show welcome |
| `/search` | Run a search now |
| `/status` | Last run statistics |
| `/help` | List monitored sources |

## Schedule

By default the bot runs **every day at 08:00 Tunisia time** (`CRON_SCHEDULE=0 7 * * *` in UTC during standard time).

Change it in `.env`:

```env
CRON_SCHEDULE=0 7 * * *
TZ=Africa/Tunis
```

## Sources

| Source | What it covers |
|--------|----------------|
| [financini.org.tn](https://www.financini.org.tn) | TIC, Innovation, Artisanat (FONAPRA/FONAPRAM), Industrie |
| [startup.gov.tn](https://startup.gov.tn) | AIR, AIR², DEAL, Startup Act |
| [openculture.gov.tn](https://www.openculture.gov.tn) | Open data on cultural/artisanat subventions |

## How updates work

1. Fetch all sources
2. Filter by IT + textile/embroidery keywords
3. Compare with local SQLite database
4. Send Telegram message **only for new or changed** items

On the **first run**, everything is stored as baseline — you won't get flooded. From the second run onward, only deltas are notified.

## Manual test (no Telegram)

```bash
npm run search
```

## Deploy (VPS)

Run with a process manager so it stays online:

```bash
npm install -g pm2
pm2 start src/index.js --name subvention-bot
pm2 save
```

## Data

SQLite database: `data/subventions.db`
