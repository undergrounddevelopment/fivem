
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Use connection string from env
const connectionString = (process.env.DATABASE_URL || process.env.POSTGRES_URL || '')
  .replace('&pgbouncer=true', '')
  .replace('?pgbouncer=true', '')
  .replace('pgbouncer=true&', '');

if (!connectionString) {
  console.error('❌ DATABASE_URL or POSTGRES_URL not found in .env.local');
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function restore() {
  try {
    await client.connect();
    console.log('🔌 Connected to database');

    const sqlPath = path.join(__dirname, '..', 'backup_full_14012026.sql');
    
    // Attempt to read with utf16le if the previous tool hinted it.
    // However, if it's mixed, we might need to be careful.
    // Let's try utf16le first based on the error message.
    try {
        sqlContent = fs.readFileSync(sqlPath, 'utf16le');
        // Strip BOM if present (UTF-16LE BOM is \uFEFF when decoded provided it was aligned)
        if (sqlContent.charCodeAt(0) === 0xFEFF) {
            sqlContent = sqlContent.slice(1);
        }
    } catch(e) {
        console.log('Failed to read as utf16le, trying utf8...');
        sqlContent = fs.readFileSync(sqlPath, 'utf8');
        if (sqlContent.charCodeAt(0) === 0xFEFF) {
            sqlContent = sqlContent.slice(1);
        }
    }

    if (!sqlContent) {
        throw new Error('Empty SQL content');
    }

    // Also remove any other potential garbage at start if necessary
    sqlContent = sqlContent.trim(); 

    // Remove lines starting with backslash (psql meta-commands or garbage)
    sqlContent = sqlContent.replace(/^\\.*$/gm, '');

    // Write cleaned content to temp file
    const tempFile = path.join(__dirname, '..', 'temp_restore.sql');
    fs.writeFileSync(tempFile, sqlContent);
    console.log(`💾 Wrote cleaned SQL to ${tempFile}`);

    console.log('🚀 Executing psql...');
    // Execute psql
    // We need to properly quote the command or pass env vars.
    // Setting PGPASSWORD env var is safer but URI works too.
    const { execSync } = require('child_process');
    
    try {
        // psql -d "URL" -f file
        // Windows cmd quoting might be tricky with special chars in URL.
        // Best to use process.env for connection string if possible, or just pass it carefully.
        // Note: execSync inherits formatting.
        
        // Pass connection string as first argument to psql
        // Need to wrap in quotes for Windows cmd
        const command = `psql "${connectionString}" -f "${tempFile}"`;
        console.log('Running command:', command.replace(/:[^:@]+@/, ':****@')); // Log masked
        
        execSync(command, { stdio: 'inherit', env: process.env });
        
        console.log('✅ Database restoration complete via psql!');
    } catch (e) {
        console.error('❌ psql execution failed:', e.message);
        throw e;
    } finally {
        // Cleanup
        if (fs.existsSync(tempFile)) {
             try { fs.unlinkSync(tempFile); } catch {}
        }
    }
  } catch (err) {
    console.error('❌ Restore failed:', err);
  } finally {
    await client.end();
  }
}

restore();
