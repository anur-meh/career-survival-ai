# Career Survival AI — Business Stream Prototype

## What this is
A working prototype of the Career Relevance Score platform — Business stream (BBA/BBM/BMS/BCom).
23 questions → AI-generated score + roadmap powered by Claude.

## Run locally

```bash
npm install

# Create a .env.local file with your Anthropic API key:
echo "ANTHROPIC_API_KEY=your_key_here" > .env.local

npm run dev
# Open http://localhost:3000
```

## Deploy to Vercel (free — runs on mobile, no installations needed)

1. Push this folder to a GitHub repo
2. Go to vercel.com → New Project → Import your repo
3. Add environment variable: ANTHROPIC_API_KEY = your key
4. Deploy → get a public URL that works on any phone, any browser

## Structure
- pages/index.js     — full questionnaire + results UI
- pages/api/score.js — API route that calls Anthropic (keeps key server-side)

## The free vs paid line
- Week 1 and Week 2-3 roadmap steps: shown to all users
- Month 2 and Month 3 steps: locked with "Premium" badge
- Upgrade flow to be built in next sprint

## Tech stack
- Next.js 14 (pages router)
- No UI library — pure CSS
- Anthropic claude-sonnet-4-6 via server-side API route
- Ready for Supabase auth + user storage in next sprint
