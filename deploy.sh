#!/bin/bash
# Run this on your LOCAL machine to build and package for NameHero
# Upload the resulting deploy.zip to cPanel File Manager

set -e
echo "📦 Building AI Companions for NameHero..."

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Build Next.js (standalone mode)
npm run build

# Copy static assets into the standalone folder (required by Next.js standalone)
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public

echo ""
echo "🗜 Creating deploy.zip..."
rm -f deploy.zip

zip -r deploy.zip \
  .next/standalone \
  server.js \
  package.json \
  prisma/schema.prisma \
  prisma/seed.ts \
  .env.example \
  -x "*.DS_Store" \
  -x "__pycache__/*"

echo ""
echo "✅ Done! deploy.zip is ready."
echo ""
echo "Next steps:"
echo "  1. Upload deploy.zip to cPanel File Manager → your subdomain folder"
echo "  2. Extract it there"
echo "  3. Follow NAMEHERO_DEPLOY.md from Step 7 onward"
