
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function runMigrationPg() {
  const migrationFile = process.argv[2];
  if (!migrationFile) {
      console.error('Please provide a migration file path');
      process.exit(1);
  }
  const filePath = path.resolve(process.cwd(), migrationFile);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
  const sql = fs.readFileSync(filePath, 'utf8');

  let connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
      // Try to read .env.local manually if dotenv didn't pick it up (sometimes happens if file is in odd format)
      try {
        const envContent = fs.readFileSync('.env.local', 'utf8');
        const match = envContent.match(/DATABASE_URL=(.*)/);
        if (match) connectionString = match[1].replace(/"/g, '').trim();
      } catch (e) {
         // ignore
      }
  }

  if (!connectionString) {
      console.error('DATABASE_URL not found in environment.');
      process.exit(1);
  }

  console.log('Connecting to database...');
  process.removeAllListeners('warning');
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected. Executing SQL...');
    await client.query(sql);
    console.log('Migration executed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

runMigrationPg();
