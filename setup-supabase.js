const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres.linnqtixdfjwbrixitrb:ftbU5SwxVhshePE7@aws-1-us-east-1.pooler.supabase.com:6543/postgres';

const sqlFiles = [
  'scripts/FINAL-SETUP.sql'
];

async function runSetup() {
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('✅ Terhubung ke Supabase');

    for (const file of sqlFiles) {
      const filePath = path.join(__dirname, file);
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File tidak ditemukan: ${file}`);
        continue;
      }

      console.log(`\n📄 Menjalankan: ${file}`);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      try {
        await client.query(sql);
        console.log(`✅ Berhasil: ${file}`);
      } catch (err) {
        console.error(`❌ Error di ${file}:`, err.message);
      }
    }

    console.log('\n🎉 Setup database selesai!');
  } catch (err) {
    console.error('❌ Error koneksi:', err.message);
  } finally {
    await client.end();
  }
}

runSetup();
