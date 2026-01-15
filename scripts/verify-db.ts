
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const { verifyDatabaseConnection } = await import('../lib/database-complete-setup');
  
  try {
    const r = await verifyDatabaseConnection();
    console.log('✅ Database verification:', r);
  } catch (e) {
    console.error('❌ Verification failed:', e);
  }
}

main();
