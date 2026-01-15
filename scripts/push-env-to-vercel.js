const fs = require('fs');
const { execSync } = require('child_process');

console.log('🚀 Pushing .env.local variables to Vercel Production...');

try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
        if (!line || line.startsWith('#')) continue;
        const parts = line.split('=');
        const key = parts[0].trim();
        let val = parts.slice(1).join('=').trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        
        if (!key) continue;

        console.log(`Processing ${key}...`);
        
        // Remove existing
        try { execSync(`npx vercel env rm ${key} production -y`, { stdio: 'ignore' }); } catch {}
        
        // Add new
        try {
            execSync(`npx vercel env add ${key} production`, { input: val, stdio: ['pipe', 'inherit', 'inherit'] });
        } catch (e) {
            console.error(`❌ Failed to add ${key}: ${e.message}`);
        }
    }
    console.log('✅ All variables pushed to Vercel.');
} catch (error) {
    console.error('Fatal Error:', error);
}
