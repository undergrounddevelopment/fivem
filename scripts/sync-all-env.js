const fs = require('fs');

try {
    const envData = JSON.parse(fs.readFileSync('vercel-env.json', 'utf8'));
    const envVars = envData.env;
    
    // Explicit list of keys to ensure we capture exactly what user wants + others
    // We will just dump ALL keys from vercel-env.json into the target files formatted as KEY="VALUE"
    
    let envContent = '';
    // Header
    envContent += `# Auto-synced from vercel-env.json\n`;
    
    for (const [key, value] of Object.entries(envVars)) {
        envContent += `${key}="${value}"\n`;
    }

    // Target files to overwrite
    const targets = ['.env', '.env.production', '.env.local'];

    targets.forEach(file => {
        fs.writeFileSync(file, envContent);
        console.log(`✅ Synced ${file}`);
    });
    
    // Also try checking for development or other variants if they exist
    if (fs.existsSync('.env.development')) {
         fs.writeFileSync('.env.development', envContent);
         console.log(`✅ Synced .env.development`);
    }

} catch (error) {
    console.error('Error syncing env files:', error);
}
