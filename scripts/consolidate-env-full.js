
const fs = require('fs');
const { execSync } = require('child_process');

console.log('🚀 Consolidating Environment Variables to FIVEM12 Standard...');

// SOURCE OF TRUTH (FIVEM12)
const FIVEM12 = {
    DATABASE_URL: "postgres://postgres.elukwjlwmfgdfywjpzkd:Arunk%40123456789%40%40@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true",
    POSTGRES_URL: "postgres://postgres.elukwjlwmfgdfywjpzkd:Arunk%40123456789%40%40@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x",
    POSTGRES_PRISMA_URL: "postgres://postgres.elukwjlwmfgdfywjpzkd:Arunk%40123456789%40%40@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true",
    POSTGRES_URL_NON_POOLING: "postgres://postgres.elukwjlwmfgdfywjpzkd:Arunk%40123456789%40%40@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require",
    POSTGRES_USER: "postgres",
    POSTGRES_HOST: "db.elukwjlwmfgdfywjpzkd.supabase.co",
    POSTGRES_PASSWORD: "Arunk@123456789@@",
    POSTGRES_DATABASE: "postgres",
    
    NEXT_PUBLIC_SUPABASE_URL: "https://elukwjlwmfgdfywjpzkd.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsdWt3amx3bWZnZGZ5d2pwemtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNzQ2NzIsImV4cCI6MjA4Mzk1MDY3Mn0.7qgAuqnx9yKxJ5dK89b018MlxC1qaa2cEnZP-zLSwJA",
    SUPABASE_SERVICE_ROLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsdWt3amx3bWZnZGZ5d2pwemtkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM3NDY3MiwiZXhwIjoyMDgzOTUwNjcyfQ.2tffYDTMH1RLxOWAQm8UFImPqVrFAOHtbDxRb3FJpVo",
    SUPABASE_URL: "https://elukwjlwmfgdfywjpzkd.supabase.co",
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsdWt3amx3bWZnZGZ5d2pwemtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNzQ2NzIsImV4cCI6MjA4Mzk1MDY3Mn0.7qgAuqnx9yKxJ5dK89b018MlxC1qaa2cEnZP-zLSwJA",
    SUPABASE_JWT_SECRET: "ZV2iZfDSHwAlThx89fyEyHlT6vWYtt0Mi3q9EuAYzDcZMGgQb7rordAH3xcMcjE2wXII+4gvpam/y6aRQoyVQQ==",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_gEZMCB3IhYghO3x3xIzumQ_RX7Zach-",
    SUPABASE_PUBLISHABLE_KEY: "sb_publishable_gEZMCB3IhYghO3x3xIzumQ_RX7Zach-"
};

// OTHER STATIC KEYS
const OTHERS = {
    ADMIN_DISCORD_ID: "1047719075322810378",
    CRON_SECRET: "fivemtools_cron_secret_2025",
    LINKVERTISE_AUTH_TOKEN: "0e4fe4bd2f9dd70412858a5f154e50ada772176b13fb61d5aa0dceb7405c2d29",
    LINKVERTISE_USER_ID: "1461354",
    NEXT_PUBLIC_LINKVERTISE_ENABLED: "true",
    NEXT_PUBLIC_APP_URL: "https://www.fivemtools.net",
    NEXT_PUBLIC_SITE_URL: "https://www.fivemtools.net",
    
    // Auth & Discord
    NEXTAUTH_URL: "https://www.fivemtools.net",
    NEXTAUTH_SECRET: "fivemtools_nextauth_secret_2025_production",
    DISCORD_CLIENT_ID: "1445650115447754933",
    DISCORD_CLIENT_SECRET: "JXY7URZrY3zsN5Ca4kQ88tB0hUC2pXuW" // Taken from existing .env.local
};

const ALL_VARS = { ...FIVEM12, ...OTHERS };

let fileContent = '# AUTO-GENERATED FULL ENV (FIVEM12 STANDARD)\n\n';

for (const [key, val] of Object.entries(ALL_VARS)) {
    fileContent += `${key}="${val}"\n`;
}

// Write to files
['.env', '.env.local', '.env.production'].forEach(f => {
    fs.writeFileSync(f, fileContent);
    console.log(`✅ Written ${f}`);
});

// Push to Vercel
console.log('🚀 Pushing to Vercel...');
for (const [key, val] of Object.entries(ALL_VARS)) {
     try {
        // Remove old to be safe
        try { execSync(`npx vercel env rm ${key} production -y`, { stdio: 'ignore' }); } catch {}
        
        // Add new
        execSync(`npx vercel env add ${key} production`, { input: val, stdio: ['pipe', 'inherit', 'inherit'] });
    } catch (e) {
        console.log(`Failed ${key}: ${e.message}`);
    }
}
console.log('✅ Done.');
