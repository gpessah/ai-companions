# Deploy to NameHero cPanel — Step by Step

## Overview
- App runs as a Node.js process via cPanel's Node.js App manager
- Database: MySQL (created in cPanel)
- Storage: Cloudflare R2 (free, for images/videos)
- Auth: Clerk (free)
- AI: OpenAI + Anthropic APIs

---

## Step 1 — Accounts to create first (all free)

| Service | URL | What to get |
|---|---|---|
| Clerk | https://clerk.com | API keys + webhook secret |
| Cloudflare | https://cloudflare.com | R2 bucket + API token |
| OpenAI | https://platform.openai.com | API key |

---

## Step 2 — Create MySQL database in cPanel

1. Log in to cPanel → **MySQL Databases**
2. Create a new database, e.g. `youraccount_companions`
3. Create a new user, e.g. `youraccount_compuser` with a strong password
4. Add the user to the database with **All Privileges**
5. Note down:
   - Database name: `youraccount_companions`
   - Username: `youraccount_compuser`
   - Password: (the one you set)
   - Host: `localhost`

Your `DATABASE_URL` will be:
```
mysql://youraccount_compuser:PASSWORD@localhost:3306/youraccount_companions
```

---

## Step 3 — Set up Cloudflare R2 (image/video storage)

1. Go to https://cloudflare.com → **R2 Object Storage**
2. Create a bucket named `aigirlfriends`
3. Under bucket settings → enable **Public access** (or add a custom domain)
4. Go to **Manage R2 API Tokens** → Create token with `Object Read & Write`
5. Note down: Account ID, Access Key ID, Secret Access Key
6. Note down the public bucket URL: `https://pub-xxxxxxxx.r2.dev` or your custom domain

---

## Step 4 — Set up Clerk

1. Create an app at https://clerk.com
2. Go to **API Keys** → copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
3. Go to **Webhooks** → Add endpoint:
   - URL: `https://yoursubdomain.yourdomain.com/api/webhooks/clerk`
   - Events: `user.created`, `user.deleted`
4. Copy the **Webhook signing secret** → `CLERK_WEBHOOK_SECRET`
5. In **Clerk Dashboard → Domains** → add your production domain

---

## Step 5 — Build on your local machine

```bash
cd ~/Downloads/Claude/aigirlfriends

# Copy and fill in ALL values
cp .env.example .env.local
nano .env.local   # or open in your editor

# Build and package
./deploy.sh
```

This creates `deploy.zip`.

---

## Step 6 — Upload to NameHero

1. Log in to cPanel → **File Manager**
2. Navigate to your subdomain's document root
   - For a subdomain like `companions.yourdomain.com`, the root is usually `/home/youraccount/companions.yourdomain.com/`
3. Upload `deploy.zip` there
4. Extract it (right-click → Extract)
5. You should now have:
   ```
   /home/youraccount/companions.yourdomain.com/
     .next/
     public/
     prisma/
     server.js
     package.json
   ```

---

## Step 7 — Set up Node.js App in cPanel

1. cPanel → **Setup Node.js App** (or "Node.js Selector")
2. Click **Create Application**
3. Fill in:
   - **Node.js version**: 20.x (latest LTS)
   - **Application mode**: Production
   - **Application root**: `/home/youraccount/companions.yourdomain.com`
   - **Application URL**: `companions.yourdomain.com`
   - **Application startup file**: `server.js`
4. Click **Create**

---

## Step 8 — Set environment variables in cPanel

In the Node.js App settings, find **Environment Variables** and add ALL of these:

```
DATABASE_URL = mysql://youraccount_compuser:PASSWORD@localhost:3306/youraccount_companions
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_live_xxx
CLERK_SECRET_KEY = sk_live_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL = /sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL = /sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL = /
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL = /
CLERK_WEBHOOK_SECRET = whsec_xxx
OPENAI_API_KEY = sk-xxx
ANTHROPIC_API_KEY = sk-ant-xxx
R2_ACCOUNT_ID = xxx
R2_ACCESS_KEY_ID = xxx
R2_SECRET_ACCESS_KEY = xxx
R2_BUCKET_NAME = aigirlfriends
R2_PUBLIC_URL = https://your-bucket.r2.dev
NEXT_PUBLIC_APP_URL = https://companions.yourdomain.com
ADMIN_SECRET = your-long-random-secret
NODE_ENV = production
PORT = 3000
```

---

## Step 9 — Install dependencies & run database migrations

In cPanel → Node.js App → click **"Run NPM Install"** button.

Then open **Terminal** (cPanel → Terminal) and run:

```bash
cd /home/youraccount/companions.yourdomain.com
source /home/youraccount/nodevenv/companions.yourdomain.com/20/bin/activate

# Create database tables
npx prisma db push

# (Optional) Add a sample character
npx ts-node prisma/seed.ts
```

---

## Step 10 — Start the app

In cPanel → Node.js App → click **Start** (or **Restart** if already running).

Visit `https://companions.yourdomain.com` — you should see the site!

---

## Step 11 — First login to Admin

1. Go to `https://companions.yourdomain.com/admin/login`
2. Enter your `ADMIN_SECRET`
3. Create your first AI companion!
4. Upload photos and videos
5. Set personality, toggle "Published"

---

## Updating the app later

1. Make changes locally
2. Run `./deploy.sh` again → new `deploy.zip`
3. Upload to NameHero, extract (overwrite)
4. cPanel → Node.js App → **Restart**

---

## Subdomain setup in cPanel

1. cPanel → **Subdomains**
2. Create `companions` under `yourdomain.com`
3. Document root: `/home/youraccount/companions.yourdomain.com`
4. SSL: cPanel → **SSL/TLS** → **Let's Encrypt** → issue for the subdomain

---

## Troubleshooting

- **App won't start**: Check cPanel → Node.js App → view error log
- **Database error**: Double-check `DATABASE_URL` format and that user has privileges
- **Images not showing**: Add your R2 domain to `next.config.ts` → `remotePatterns`
- **Auth not working**: Make sure Clerk domain is set to production URL, not localhost
