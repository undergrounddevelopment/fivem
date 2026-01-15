
const fs = require('fs');
const { execSync } = require('child_process');

const rawEnv = `
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsdWt3amx3bWZnZGZ5d2pwemtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNzQ2NzIsImV4cCI6MjA4Mzk1MDY3Mn0.7qgAuqnx9yKxJ5dK89b018MlxC1qaa2cEnZP-zLSwJA"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_gEZMCB3IhYghO3x3xIzumQ_RX7Zach-"
NEXT_PUBLIC_SUPABASE_URL="https://elukwjlwmfgdfywjpzkd.supabase.co"
fivem12_POSTGRES_DATABASE="postgres"
fivem12_POSTGRES_HOST="db.elukwjlwmfgdfywjpzkd.supabase.co"
fivem12_POSTGRES_PASSWORD="Arunk@123456789@@"
fivem12_POSTGRES_PRISMA_URL="postgres://postgres.elukwjlwmfgdfywjpzkd:Arunk%40123456789%40%40@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
fivem12_POSTGRES_URL="postgres://postgres.elukwjlwmfgdfywjpzkd:Arunk%40123456789%40%40@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x"
fivem12_POSTGRES_URL_NON_POOLING="postgres://postgres.elukwjlwmfgdfywjpzkd:Arunk%40123456789%40%40@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require"
fivem12_POSTGRES_USER="postgres"
NEXT_PUBLIC_fivem12_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsdWt3amx3bWZnZGZ5d2pwemtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNzQ2NzIsImV4cCI6MjA4Mzk1MDY3Mn0.7qgAuqnx9yKxJ5dK89b018MlxC1qaa2cEnZP-zLSwJA"
fivem12_SUPABASE_JWT_SECRET="ZV2iZfDSHwAlThx89fyEyHlT6vWYtt0Mi3q9EuAYzDcZMGgQb7rordAH3xcMcjE2wXII+4gvpam/y6aRQoyVQQ=="
fivem12_SUPABASE_PUBLISHABLE_KEY="sb_publishable_gEZMCB3IhYghO3x3xIzumQ_RX7Zach-"
fivem12_SUPABASE_SECRET_KEY="sb_secret_WziEjlBmkNr0Xz2ezSWALQ_eDTEtOXp"
fivem12_SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsdWt3amx3bWZnZGZ5d2pwemtkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM3NDY3MiwiZXhwIjoyMDgzOTUwNjcyfQ.2tffYDTMH1RLxOWAQm8UFImPqVrFAOHtbDxRb3FJpVo"
fivem12_SUPABASE_URL="https://elukwjlwmfgdfywjpzkd.supabase.co"
`;

// Map to standard keys
const mappings = {
    'DATABASE_URL': 'fivem12_POSTGRES_PRISMA_URL',
    'POSTGRES_URL': 'fivem12_POSTGRES_URL',
    'POSTGRES_URL_NON_POOLING': 'fivem12_POSTGRES_URL_NON_POOLING',
    'SUPABASE_SERVICE_ROLE_KEY': 'fivem12_SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_JWT_SECRET': 'fivem12_SUPABASE_JWT_SECRET',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'NEXT_PUBLIC_SUPABASE_ANON_KEY', // direct
    'NEXT_PUBLIC_SUPABASE_URL': 'NEXT_PUBLIC_SUPABASE_URL' // direct
};

// Parse raw env
const envLines = rawEnv.trim().split('\n');
const parsedEnv = {};
envLines.forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest) {
        let val = rest.join('=');
        // Remove quotes
        if (val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1);
        }
        parsedEnv[key.trim()] = val;
    }
});

// Create final env content
let finalContent = '# Auto-generated from user request (fivem12)\n';
Object.entries(parsedEnv).forEach(([k, v]) => {
    finalContent += `${k}="${v}"\n`;
});
finalContent += '\n# MAPPED STANDARD KEYS\n';
Object.entries(mappings).forEach(([stdKey, srcKey]) => {
    if (parsedEnv[srcKey] && stdKey !== srcKey) { // Avoid duplicates if direct
        finalContent += `${stdKey}="${parsedEnv[srcKey]}"\n`;
    }
});

// Keep existing important keys that were not provided (like Discord, Linkvertise, NextAuth)
// We'll read the current .env.local to recover them
let existingEnv = {};
try {
    const fs = require('fs');
    if (fs.existsSync('.env.local')) {
        const content = fs.readFileSync('.env.local', 'utf8');
        content.split('\n').forEach(line => {
            const [k, ...v] = line.split('=');
            if (k && v.length > 0) existingEnv[k.trim()] = v.join('=').replace(/^"|"$/g, '');
        });
    }
} catch(e) {}

// Merge: Prioritize NEW values, keep OLD non-conflicting values
const preservedKeys = [
    'NEXTAUTH_SECRET', 'NEXTAUTH_URL',
    'DISCORD_CLIENT_ID', 'DISCORD_CLIENT_SECRET', 'ADMIN_DISCORD_ID',
    'LINKVERTISE_USER_ID', 'LINKVERTISE_AUTH_TOKEN', 'NEXT_PUBLIC_LINKVERTISE_ENABLED',
    'CRON_SECRET', 'NEXT_PUBLIC_SITE_URL', 'NEXT_PUBLIC_APP_URL'
];

preservedKeys.forEach(k => {
    if (existingEnv[k]) {
        finalContent += `${k}="${existingEnv[k]}"\n`;
    }
});

const files = ['.env', '.env.local', '.env.production'];
files.forEach(f => {
    fs.writeFileSync(f, finalContent);
    console.log(`✅ Updated ${f}`);
});

// Push to Vercel?
// We can generate a vercel-env.json or just push directly via script if needed.
// For now, updating local files is the first step.
