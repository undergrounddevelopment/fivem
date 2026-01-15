const fs = require('fs');

try {
    const envData = JSON.parse(fs.readFileSync('vercel-env.json', 'utf8'));
    // Handle specific env structure (development, production, etc.)
    // Usually 'env' key holds prod/general vars.
    // vercel-env.json structure from previous read: { "env": {KEY: "VAL"}, "build": ..., "headers": ... }
    const envVars = envData.env;
    
    let envContent = '';
    for (const [key, value] of Object.entries(envVars)) {
        envContent += `${key}="${value}"\n`;
    }

    fs.writeFileSync('.env.local', envContent);
    console.log('Successfully created .env.local from vercel-env.json');
} catch (error) {
    console.error('Error creating .env.local:', error);
}
