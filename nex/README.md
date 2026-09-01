# Nex

Find businesses and social pages without websites, generate landing pages from their assets, and draft outreach messages — all in one app.

## Features

- **Maps** — Search nearby active businesses on Google Maps that have no website
- **Social** — Find high-follower Facebook & Instagram pages without websites
- **Sites** — Generate landing pages using profile photos, covers, bios, and post images
- **Chat** — AI assistant to draft outreach messages and answer questions

## Quick Start

```bash
cd nex
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Keys (optional)

Copy `.env.example` to `.env.local`:

| Variable | Purpose |
|---|---|
| `GOOGLE_PLACES_API_KEY` | Real nearby business search via Google Places API |
| `META_ACCESS_TOKEN` | Live Facebook page search via Meta Graph API |
| `OPENAI_API_KEY` | Smarter chat responses |

Without API keys, the app runs in **demo mode** with sample data so you can try all features.

## How It Works

1. **Discover** — Use Maps or Social tabs to find leads without websites
2. **Generate** — Click one button to build a landing page from their existing assets
3. **Preview** — Open the generated site and share the link with the owner
4. **Outreach** — Use Chat to draft a personalized pitch message
