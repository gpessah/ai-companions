# AI Companions — Setup Guide

## What's built

- **Homepage**: Character gallery with featured companions
- **Character profiles**: Bio, photo gallery, video gallery (locked/unlocked), call button
- **Chat**: Real-time AI streaming chat with conversation history
- **AI Voice Calls**: Webhook integration for your voice provider
- **Admin Panel**: `/admin` — manage characters, upload photos/videos, toggle publish/featured
- **Auth**: Clerk (sign up, sign in, user sessions)
- **Storage**: Cloudflare R2 (S3-compatible) for images and videos
- **DB**: PostgreSQL via Prisma

---

## 1. Services to set up

### Supabase (Database)
1. Create a project at https://supabase.com
2. Copy the connection string from Settings → Database → Connection string (URI)
3. Paste into `.env.local` as `DATABASE_URL`

### Clerk (Auth)
1. Create an app at https://clerk.com
2. Copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
3. In Clerk → Webhooks, add endpoint: `https://yourdomain.com/api/webhooks/clerk`
4. Events: `user.created`, `user.deleted`
5. Copy webhook secret → `CLERK_WEBHOOK_SECRET`

### Cloudflare R2 (Storage)
1. Create a bucket named `aigirlfriends` at https://cloudflare.com
2. Enable public access on the bucket (or set a custom domain)
3. Create R2 API token with read/write permissions
4. Fill `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`

### OpenAI
1. Get API key at https://platform.openai.com
2. Set `OPENAI_API_KEY`

### Anthropic (optional)
1. Get API key at https://console.anthropic.com
2. Set `ANTHROPIC_API_KEY`

### Admin Secret
1. Set `ADMIN_SECRET` to a long random string (e.g. `openssl rand -hex 32`)

---

## 2. Local setup

```bash
cd aigirlfriends
cp .env.example .env.local
# Fill in all values in .env.local

npm install
npm run db:generate   # Generate Prisma client
npm run db:push       # Create database tables
npm run db:seed       # Add sample character (optional)

npm run dev           # Start at http://localhost:3000
```

---

## 3. Admin panel

1. Go to `http://localhost:3000/admin/login`
2. Enter your `ADMIN_SECRET`
3. Create characters, upload photos and videos, set personality prompts
4. Toggle "Published" to make a character visible to users

---

## 4. Voice Calls integration

Set `CALL_WEBHOOK_URL` and `CALL_API_KEY` in `.env.local`.

When a user clicks "Call", the backend sends a POST to your webhook with:
```json
{
  "callId": "...",
  "userId": "...",
  "characterId": "...",
  "characterName": "Sophia",
  "voiceId": "your-voice-id"
}
```

Your voice provider should respond with a `joinUrl` (or similar) for the call.

---

## 5. Adding to next.config.ts for your R2 domain

```ts
remotePatterns: [
  { protocol: "https", hostname: "your-bucket.r2.dev" },
  // or your custom domain
]
```

---

## 6. Deploy

Tell me where you want to host it and I'll set up the deployment config!
