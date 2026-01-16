
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  const migrationFile = process.argv[2];
  if (!migrationFile) {
    console.error('Please provide a migration file path');
    process.exit(1);
  }

  const filePath = path.resolve(process.cwd(), migrationFile);
  if (!fs.existsSync(filePath)) {
    console.error(`Migration file not found: ${filePath}`);
    process.exit(1);
  }

  console.log(`Running migration: ${migrationFile}...`);
  const sql = fs.readFileSync(filePath, 'utf8');

  // Split by semicolon to run statements individually, assuming simple SQL structure
  // This is a naive split, but sufficient for simple CREATE TABLE statements in this context
  // Better approach is to use a proper pg client, but using Supabase JS rpc or simple execution if possible.
  // Since supabase-js doesn't expose a raw query method easily without RLS or via rpc, 
  // we will try to assume the user has a postgres connection string or we use a designated RPC function for migrations if it exists.
  // HOWEVER, for this environment, often 'pg' is available. Let's check package.json.
  // 'pg' is in dependencies. Let's use 'pg' directly if DATABASE_URL is available?
  // Let's check .env.local for DATABASE_URL.
  
  // If we can't use pg directly, we might need to rely on the admin panel or manual SQL tool.
  // But wait, the previous `apply-akamai-sql.js` likely used `pg`. Let's check that file first?
  // No, I'll just write a script using `pg` assuming DATABASE_URL exists or constructs it from Supabase config if possible.
  
  // Actually, let's look at `scripts/check-database.js` to see how it connects.
}

// Re-writing the script to use 'pg' directly as it is more reliable for DDL
import { Client } from 'pg';

async function runMigrationPg() {
  const migrationFile = process.argv[2];
  if (!migrationFile) {
      console.error('Please provide a migration file path');
      process.exit(1);
  }
  const filePath = path.resolve(process.cwd(), migrationFile);
  const sql = fs.readFileSync(filePath, 'utf8');

  let connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
      // Try to construct from Supabase URL if typical format, otherwise fail
      // Just try to see if we can find it in the env file content directly if it wasn't loaded
      const envContent = fs.readFileSync('.env.local', 'utf8');
      const match = envContent.match(/DATABASE_URL=(.*)/);
      if (match) connectionString = match[1].replace(/"/g, '');
  }

  if (!connectionString) {
      console.error('DATABASE_URL not found in environment.');
      process.exit(1);
  }

  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false } // Required for Supabase in many envs
  });

  try {
    await client.connect();
    console.log('Connected to database. Executing SQL...');
    await client.query(sql);
    console.log('Migration executed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

runMigrationPg();
