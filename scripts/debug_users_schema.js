
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load env
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY);

async function inspect() {
    console.log("Fetching 1 user row...");
    const { data, error } = await supabase.from('users').select('*').limit(1);
    
    if (error) {
        console.error("Error:", error);
        return;
    }
    
    if (data && data.length > 0) {
        console.log("User Keys:", Object.keys(data[0]));
        console.log("Sample Data (Safe):", {
            id: data[0].id,
            discord_id: data[0].discord_id,
            coins: data[0].coins,
            tickets: data[0].tickets,
            spin_tickets: data[0].spin_tickets,
            username: data[0].username
        });
    } else {
        console.log("No users found.");
    }

    // Check spin_wheel_tickets too
    console.log("Fetching spin_wheel_tickets...");
    const { data: st, error: stError } = await supabase.from('spin_wheel_tickets').select('*').limit(1);
    if(st && st.length > 0) console.log("Spin Ticket Keys:", Object.keys(st[0]));
}

inspect();
