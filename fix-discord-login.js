const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

console.log('🔧 FIXING DISCORD LOGIN ISSUES...\n');

// 1. Generate valid NEXTAUTH_SECRET
const newSecret = crypto.randomBytes(32).toString('base64');
console.log('✅ Generated new NEXTAUTH_SECRET');

// 2. Read .env.local
const envPath = path.join(__dirname, '.env.local');
let envContent = fs.readFileSync(envPath, 'utf8');

// 3. Fix NEXTAUTH_SECRET
envContent = envContent.replace(
  /NEXTAUTH_SECRET="NEXTAUTH_SECRET"/g,
  `NEXTAUTH_SECRET="${newSecret}"`
);
console.log('✅ Fixed NEXTAUTH_SECRET');

// 4. Remove typo NEXTAUTH_UR
envContent = envContent.replace(/NEXTAUTH_UR="[^"]*"\n/g, '');
console.log('✅ Removed NEXTAUTH_UR typo');

// 5. Ensure NEXTAUTH_URL is correct
if (!envContent.includes('NEXTAUTH_URL=')) {
  envContent += '\nNEXTAUTH_URL="http://localhost:3000"\n';
} else {
  envContent = envContent.replace(
    /NEXTAUTH_URL="[^"]*"/g,
    'NEXTAUTH_URL="http://localhost:3000"'
  );
}
console.log('✅ Fixed NEXTAUTH_URL');

// 6. Write back to .env.local
fs.writeFileSync(envPath, envContent, 'utf8');
console.log('✅ Updated .env.local\n');

// 7. Fix lib/auth.ts - remove duplicate getProviders
const authPath = path.join(__dirname, 'lib', 'auth.ts');
let authContent = fs.readFileSync(authPath, 'utf8');

// Find and remove duplicate function
const functionPattern = /function getProviders\(\) \{[\s\S]*?\n\}/g;
const matches = authContent.match(functionPattern);

if (matches && matches.length > 1) {
  // Keep first occurrence, remove others
  let firstFound = false;
  authContent = authContent.replace(functionPattern, (match) => {
    if (!firstFound) {
      firstFound = true;
      return match;
    }
    return '';
  });
  
  fs.writeFileSync(authPath, authContent, 'utf8');
  console.log('✅ Removed duplicate getProviders() function\n');
}

// 8. Display summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ ALL FIXES APPLIED!\n');
console.log('📋 NEXT STEPS:');
console.log('1. Configure Discord Redirect URI:');
console.log('   https://discord.com/developers/applications/1445650115447754933/oauth2');
console.log('   Add: http://localhost:3000/api/auth/callback/discord\n');
console.log('2. Clear cache and restart:');
console.log('   rmdir /s /q .next');
console.log('   pnpm dev\n');
console.log('3. Test login at: http://localhost:3000');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('🎯 New NEXTAUTH_SECRET:', newSecret);
console.log('\n⚠️  IMPORTANT: Add this Redirect URI to Discord:');
console.log('   http://localhost:3000/api/auth/callback/discord');
