const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function auditDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL not found');
    process.exit(1);
  }

  process.removeAllListeners('warning');
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('--- DATABASE AUDIT ---');

    // 1. Check Tables without RLS
    console.log('\n[1] Tables without RLS:');
    const rlsQuery = `
      SELECT schemaname, tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      AND rowsecurity = false;
    `;
    const rlsRes = await client.query(rlsQuery);
    rlsRes.rows.forEach(row => console.log(`- ${row.schemaname}.${row.tablename}`));

    // 2. Check Foreign Keys without Indexes
    console.log('\n[2] Foreign Keys without Indexes:');
    const fkQuery = `
      SELECT
        conname AS constraint_name,
        conrelid::regclass AS table_name,
        a.attname AS column_name
      FROM pg_constraint c
      JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
      WHERE confrelid != 0
      AND NOT EXISTS (
        SELECT 1
        FROM pg_index i
        WHERE i.indrelid = c.conrelid
        AND i.indkey[0] = a.attnum
      );
    `;
    const fkRes = await client.query(fkQuery);
    fkRes.rows.forEach(row => console.log(`- ${row.table_name}(${row.column_name}) [Constraint: ${row.constraint_name}]`));

    console.log('\n--- AUDIT COMPLETE ---');
  } catch (err) {
    console.error('Audit failed:', err);
  } finally {
    await client.end();
  }
}

auditDatabase();
