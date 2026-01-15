const { execSync } = require('child_process');
const fs = require('fs');

try {
    const envData = JSON.parse(fs.readFileSync('vercel-env.json', 'utf8'));
    const envVars = envData.env;

    console.log('Starting environment variable addition...');

    // We only add the ones that are NOT part of the removal list or are clearly new.
    // Actually, 'add' will fail if it exists, so we can try adding all of them safely.
    // The user wants to APPLY this file.

    for (const [key, value] of Object.entries(envVars)) {
        try {
            console.log(`Adding ${key}...`);
            // cmd format: echo value | npx vercel env add NAME production
            // We need to handle potential quotes in value if passing via echo, but execSync input option is safer.
            
            // Add to Production
            execSync(`npx vercel env add ${key} production`, { input: value, stdio: ['pipe', 'inherit', 'inherit'] });
            
            // Optional: Add to Preview/Development if standard practice, but user just said "update vercel env" (usually prod)
            // execSync(`npx vercel env add ${key} preview`, { input: value, stdio: ['pipe', 'inherit', 'inherit'] });
            // execSync(`npx vercel env add ${key} development`, { input: value, stdio: ['pipe', 'inherit', 'inherit'] });

        } catch (error) {
            console.log(`Failed to add ${key} (might already exist):`, error.message);
        }
    }

    console.log('Environment variable update process complete.');

} catch (error) {
    console.error('Error reading or parsing vercel-env.json:', error);
}
