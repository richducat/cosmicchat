# cosmicchat

Cosmic Coach / CosmicChat app.

## Local dev

```bash
npm install
OPENAI_API_KEY=... npm run dev
```

## Deploy (same as labstudio-app)

Deploy on Vercel as a Next.js app.

Environment variables:
- `OPENAI_API_KEY` (required)

API:
- `POST /api/chat` → server-side OpenAI proxy (keeps key off the client)
