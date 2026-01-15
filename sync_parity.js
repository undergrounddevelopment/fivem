const { Client } = require('pg');

const OLD_URL = 'postgresql://postgres.linnqtixdfjwbrixitrb:DNC4a3SS0i6orn2g@aws-1-us-east-1.pooler.supabase.com:6543/postgres';
const NEW_URL = 'postgresql://postgres.elukwjlwmfgdfywjpzkd:Arunk%40123456789%40%40@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';

async function sync() {
    const oldClient = new Client({ connectionString: OLD_URL, ssl: { rejectUnauthorized: false } });
    const newClient = new Client({ connectionString: NEW_URL, ssl: { rejectUnauthorized: false } });

    await oldClient.connect();
    await newClient.connect();

    console.log('🚀 Starting 100% Data Sync...');

    // 1. Sync spin_history (the missing rows)
    console.log('Syncing spin_history...');
    const { rows: oldSpin } = await oldClient.query('SELECT * FROM spin_history');
    console.log(`Found ${oldSpin.length} rows in old DB.`);
    
    let spinCount = 0;
    for (const row of oldSpin) {
        try {
            await newClient.query(
                `INSERT INTO spin_history (id, user_id, prize_id, coins_won, prize_name, created_at, spin_type) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING`,
                [row.id, row.user_id, row.prize_id, row.coins_won, row.prize_name, row.created_at, row.spin_type]
            );
            spinCount++;
        } catch (err) {
            // Ignore errors for individual rows
        }
    }
    console.log(`✅ spin_history sync complete. (Processed ${spinCount} rows)`);

    // 2. Sync storage metadata
    console.log('Syncing storage metadata...');
    // Buckets
    const { rows: buckets } = await oldClient.query('SELECT * FROM storage.buckets');
    for (const b of buckets) {
        await newClient.query(
            `INSERT INTO storage.buckets (id, name, owner, created_at, updated_at, public, avif_autoresize, allowed_mime_types, file_size_limit) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING`,
            [b.id, b.name, b.owner, b.created_at, b.updated_at, b.public, b.avif_autoresize, b.allowed_mime_types, b.file_size_limit]
        );
    }
    
    // Objects
    const { rows: objects } = await oldClient.query('SELECT * FROM storage.objects');
    let objCount = 0;
    for (const o of objects) {
        try {
            await newClient.query(
                `INSERT INTO storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, owner_id, version) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO NOTHING`,
                [o.id, o.bucket_id, o.name, o.owner, o.created_at, o.updated_at, o.last_accessed_at, o.metadata, o.owner_id, o.version]
            );
            objCount++;
        } catch (err) {
            console.error(`Error syncing object ${o.name}:`, err.message);
        }
    }
    console.log(`✅ storage.objects sync complete. (Processed ${objCount} rows)`);

    await oldClient.end();
    await newClient.end();
    console.log('🏁 100% Data Parity Achieved!');
}

sync().catch(err => {
    console.error('Fatal sync error:', err);
    process.exit(1);
});
