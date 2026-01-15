import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log('🚀 Running complete setup via tsx...');

async function main() {
  const { setupCompleteDatabase } = await import('../lib/database-complete-setup');
  
  try {
    const r = await setupCompleteDatabase();
    console.log('✅ Setup complete:', r);
  } catch (e) {
    console.error('❌ Setup failed:', e);
  }
}

main();
