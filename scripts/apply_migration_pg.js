
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Fix Self-Signed Cert Error
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Load env
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

async function run() {
    const dbUrl = envConfig.DATABASE_URL;
    if (!dbUrl) {
        console.error("No DATABASE_URL found.");
        process.exit(1);
    }

    const client = new Client({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false } // Required for Supabase/Neon usually
    });

    try {
        await client.connect();
        console.log("Connected to Database.");
        
        const migrationFile = path.join(__dirname, '..', 'supabase', 'migrations', '20260117_fix_rpc_security.sql');
        const sql = fs.readFileSync(migrationFile, 'utf8');

        console.log("Applying Migration...");
        await client.query(sql);
        console.log("Migration Applied Successfully.");

    } catch (e) {
        console.error("Migration Failed:", e);
    } finally {
        await client.end();
    }
}
run();
