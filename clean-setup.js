const { Client } = require('pg');

const connectionString = 'postgresql://postgres.linnqtixdfjwbrixitrb:ftbU5SwxVhshePE7@aws-1-us-east-1.pooler.supabase.com:6543/postgres';

async function cleanDatabase() {
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('✅ Terhubung ke Supabase\n');

    console.log('🗑️  Menghapus tabel yang ada...');
    
    const dropSQL = `
      -- Drop tables in correct order (respecting foreign keys)
      DROP TABLE IF EXISTS likes CASCADE;
      DROP TABLE IF EXISTS coin_transactions CASCADE;
      DROP TABLE IF EXISTS notifications CASCADE;
      DROP TABLE IF EXISTS downloads CASCADE;
      DROP TABLE IF EXISTS forum_replies CASCADE;
      DROP TABLE IF EXISTS forum_threads CASCADE;
      DROP TABLE IF EXISTS forum_categories CASCADE;
      DROP TABLE IF EXISTS spin_history CASCADE;
      DROP TABLE IF EXISTS daily_spin_tickets CASCADE;
      DROP TABLE IF EXISTS spin_wheel_settings CASCADE;
      DROP TABLE IF EXISTS spin_wheel_prizes CASCADE;
      DROP TABLE IF EXISTS testimonials CASCADE;
      DROP TABLE IF EXISTS assets CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS daily_rewards CASCADE;
      DROP TABLE IF EXISTS reports CASCADE;
      DROP TABLE IF EXISTS messages CASCADE;
      DROP TABLE IF EXISTS activities CASCADE;
      
      -- Drop functions
      DROP FUNCTION IF EXISTS exec_sql(text) CASCADE;
      DROP FUNCTION IF EXISTS is_admin() CASCADE;
      DROP FUNCTION IF EXISTS increment_thread_replies(UUID) CASCADE;
      DROP FUNCTION IF EXISTS decrement_thread_replies(UUID) CASCADE;
      DROP FUNCTION IF EXISTS update_category_thread_count() CASCADE;
      DROP FUNCTION IF EXISTS increment_thread_count(UUID) CASCADE;
      DROP FUNCTION IF EXISTS increment_reply_count(UUID) CASCADE;
      DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
    `;
    
    await client.query(dropSQL);
    console.log('✅ Tabel lama berhasil dihapus\n');

    console.log('📦 Membuat struktur database baru...');
    const fs = require('fs');
    const setupSQL = fs.readFileSync('scripts/FINAL-SETUP.sql', 'utf8');
    
    await client.query(setupSQL);
    console.log('✅ Database baru berhasil dibuat\n');

    console.log('🎉 Setup database selesai 100%!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}

cleanDatabase();
