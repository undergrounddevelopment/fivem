const { execSync } = require('child_process');

const vars = [
    { key: "NEXT_PUBLIC_SUPABASE_URL", val: "https://elukwjlwmfgdfywjpzkd.supabase.co" },
    { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", val: "sb_publishable_gEZMCB3IhYghO3x3xIzumQ_RX7Zach-" },
    { key: "SUPABASE_SERVICE_ROLE_KEY", val: "sb_secret_WziEjlBmkNr0Xz2ezSWALQ_eDTEtOXp" }
];

console.log('Force re-adding critical env vars to Vercel...');

vars.forEach(v => {
    try {
        // Try removing first to ensure clean add if it exists but is corrupted/empty
        // Ignore error if not found
        try { execSync(`npx vercel env rm ${v.key} production -y`, {stdio: 'ignore'}); } catch {}
        
        console.log(`Adding ${v.key}...`);
        execSync(`npx vercel env add ${v.key} production`, { input: v.val, stdio: ['pipe', 'inherit', 'inherit'] });
    } catch (e) {
        console.log(`Failed to add ${v.key}:`, e.message);
    }
});

console.log('Done.');
