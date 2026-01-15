const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const OLD_URL = 'https://linnqtixdfjwbrixitrb.supabase.co';
const OLD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTIxMjg1MiwiZXhwIjoyMDgwNzg4ODUyfQ.Rri9zq0S-Y4nRpwkuiHp1GsZJXAsL-6-xpqJ1fAP3KE';

const NEW_URL = 'https://elukwjlwmfgdfywjpzkd.supabase.co';
const NEW_KEY = 'sb_secret_WziEjlBmkNr0Xz2ezSWALQ_eDTEtOXp';

const oldSupabase = createClient(OLD_URL, OLD_KEY);
const newSupabase = createClient(NEW_URL, NEW_KEY);

async function migrate() {
    const fileName = 'unique_old_urls_fixed.txt';
    if (!fs.existsSync(fileName)) {
        console.error(`File ${fileName} not found!`);
        return;
    }
    
    const urls = fs.readFileSync(fileName, 'utf8')
        .split('\n')
        .filter(Boolean)
        .map(u => u.trim().replace(/\0/g, '')); // Remove NULL bytes just in case
    
    console.log(`🚀 Starting migration of ${urls.length} files...`);

    for (const url of urls) {
        if (!url.startsWith('http')) continue;
        
        try {
            const parts = url.split('/storage/v1/object/public/')[1];
            if (!parts) {
                console.log(`⚠️ Skipping invalid URL: ${url}`);
                continue;
            }
            
            const bucket = parts.split('/')[0];
            const filePath = parts.substring(bucket.length + 1);
            
            process.stdout.write(`🔄 Migrating ${bucket}/${filePath}... `);
            
            const { data, error: downloadError } = await oldSupabase.storage
                .from(bucket)
                .download(filePath);
            
            if (downloadError) {
                console.log(`❌ Download failed: ${downloadError.message}`);
                continue;
            }
            
            const { error: uploadError } = await newSupabase.storage
                .from(bucket)
                .upload(filePath, data, { upsert: true });
            
            if (uploadError) {
                if (uploadError.message.includes('Bucket not found') || uploadError.error === 'Bucket not found') {
                    console.log(`\n📦 Creating bucket: ${bucket}...`);
                    await newSupabase.storage.createBucket(bucket, { public: true });
                    const { error: retryError } = await newSupabase.storage.from(bucket).upload(filePath, data, { upsert: true });
                    if (retryError) {
                        console.log(`❌ Retry failed: ${retryError.message}`);
                    } else {
                        console.log(`✅ Success after retry!`);
                    }
                } else {
                    console.log(`❌ Upload failed: ${uploadError.message}`);
                }
            } else {
                console.log(`✅ Success!`);
            }
        } catch (err) {
            console.log(`\n💥 Unexpected error: ${err.message}`);
        }
    }
    console.log('\n🏁 Migration completed!');
}

migrate().catch(err => {
    console.error('Fatal error during migration:', err);
    process.exit(1);
});
