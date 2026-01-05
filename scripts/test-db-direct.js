const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL || "";

if (!connectionString) {
  console.error('❌ Missing DATABASE_URL / POSTGRES_URL / SUPABASE_DB_URL env var');
  process.exit(1);
}

const sslEnabled = connectionString.includes('supabase') || connectionString.includes('neon');
const pool = new Pool({
  connectionString,
  ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
});

async function test() {
  try {
    console.log('Testing database connection...\n');
    
    const usersRes = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log('✅ Users table:', usersRes.rows[0].count, 'users');
    
    const assetsRes = await pool.query('SELECT COUNT(*) as count FROM assets');
    console.log('✅ Assets table:', assetsRes.rows[0].count, 'assets');
    
    console.log('\n✅ DATABASE CONNECTION WORKS!');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    await pool.end();
    process.exit(1);
  }
}

test();
