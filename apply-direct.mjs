import pg from 'pg';
import fs from 'fs';

const { Client } = pg;

async function applySchema() {
  const client = new Client({
    host: 'aws-1-us-east-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.linnqtixdfjwbrixitrb',
    password: '06Zs04s8vCBrW4XE',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!');

    console.log('📋 Reading SQL file...');
    const sql = fs.readFileSync('complete-schema.sql', 'utf8');

    console.log('🚀 Applying schema...');
    await client.query(sql);

    console.log('✅ Schema applied successfully!');
    console.log('🎉 Database setup complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

applySchema();
