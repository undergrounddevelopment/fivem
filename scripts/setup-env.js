#!/usr/bin/env node

const fs = require('fs');
const crypto = require('crypto');

const envTemplate = `# Database
DATABASE_URL="postgresql://username:password@localhost:5432/fivemtools"

# NextAuth
NEXTAUTH_SECRET="${crypto.randomBytes(32).toString('hex')}"
NEXTAUTH_URL="http://localhost:3000"

# Discord OAuth
DISCORD_CLIENT_ID="your_discord_client_id"
DISCORD_CLIENT_SECRET="your_discord_client_secret"

# UploadThing
UPLOADTHING_SECRET="your_uploadthing_secret"
UPLOADTHING_APP_ID="your_uploadthing_app_id"
`;

if (!fs.existsSync('.env.local')) {
  fs.writeFileSync('.env.local', envTemplate);
  console.log('✅ .env.local created with template values');
  console.log('📝 Please update the values in .env.local');
} else {
  console.log('⚠️  .env.local already exists');
}
