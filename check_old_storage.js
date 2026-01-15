const { createClient } = require('@supabase/supabase-js');

const OLD_URL = 'https://linnqtixdfjwbrixitrb.supabase.co';
const OLD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTI4NTIsImV4cCI6MjA4MDc4ODg1Mn0.7Mm9XtHZzWC4K4iHuPBCxIWoUJAVqqsD4ph0mwUbFrU';

const oldSupabase = createClient(OLD_URL, OLD_KEY);

async function check() {
    console.log('Checking old storage buckets...');
    const { data: buckets, error } = await oldSupabase.storage.listBuckets();
    
    if (error) {
        console.error('Error listing buckets:', error);
    } else {
        console.log('Buckets found:', buckets.map(b => b.name));
        
        for (const bucket of buckets) {
            console.log(`Listing files in ${bucket.name}...`);
            const { data: files, error: listError } = await oldSupabase.storage.from(bucket.name).list('', { limit: 5 });
            if (listError) console.error(`Error listing ${bucket.name}:`, listError);
            else console.log(`Files in ${bucket.name}:`, files.map(f => f.name));
        }
    }
}

check();
