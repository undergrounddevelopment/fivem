const postgres = require('postgres');

const sql = postgres('postgresql://postgres.linnqtixdfjwbrixitrb:06Zs04s8vCBrW4XE@aws-1-us-east-1.pooler.supabase.com:6543/postgres', {
  ssl: 'require'
});

async function test() {
  try {
    console.log('Testing database connection...\n');
    
    const users = await sql`SELECT COUNT(*) as count FROM users`;
    console.log('✅ Users table:', users[0].count, 'users');
    
    const assets = await sql`SELECT COUNT(*) as count FROM assets`;
    console.log('✅ Assets table:', assets[0].count, 'assets');
    
    console.log('\n✅ DATABASE CONNECTION WORKS!');
    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  }
}

test();
