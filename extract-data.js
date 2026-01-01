const fs = require('fs');
const path = require('path');

// Read the backup file
const backupFile = 'C:\\backup\\fivemvip_full.sql';
const outputFile = 'import-data-only.sql';

console.log('🔍 Extracting data from backup file...');

// Read the backup file
const content = fs.readFileSync(backupFile, 'utf8');

// Extract only INSERT statements for public tables
const lines = content.split('\n');
const insertStatements = [];
let currentInsert = '';
let inInsert = false;

for (const line of lines) {
    // Start of INSERT statement for public tables
    if (line.trim().startsWith('INSERT INTO public.') && !line.trim().startsWith('--')) {
        inInsert = true;
        currentInsert = line;
    } 
    // Continue INSERT statement
    else if (inInsert) {
        currentInsert += '\n' + line;
        
        // End of INSERT statement (ends with semicolon)
        if (line.trim().endsWith(';')) {
            insertStatements.push(currentInsert);
            currentInsert = '';
            inInsert = false;
        }
    }
}

// Write the extracted INSERT statements to output file
const outputContent = `-- Data import from backup
-- Generated: ${new Date().toISOString()}
-- Total INSERT statements: ${insertStatements.length}

-- Set session for data import
SET session_replication_role = replica;
SET client_min_messages = warning;

-- Disable foreign key checks temporarily
SET session_replication_role = replica;

-- Import all data
${insertStatements.join('\n\n')}

-- Re-enable foreign key checks
SET session_replication_role = DEFAULT;

-- Update sequences
SELECT setval('public.users_id_seq', (SELECT MAX(id) FROM public.users));
SELECT setval('public.activities_id_seq', (SELECT MAX(id) FROM public.activities));
SELECT setval('public.ads_id_seq', (SELECT MAX(id) FROM public.ads));
SELECT setval('public.announcements_id_seq', (SELECT MAX(id) FROM public.announcements));
SELECT setval('public.asset_ratings_id_seq', (SELECT MAX(id) FROM public.asset_ratings));
SELECT setval('public.asset_reviews_id_seq', (SELECT MAX(id) FROM public.asset_reviews));
SELECT setval('public.assets_id_seq', (SELECT MAX(id) FROM public.assets));
SELECT setval('public.banners_id_seq', (SELECT MAX(id) FROM public.banners));
SELECT setval('public.coin_transactions_id_seq', (SELECT MAX(id) FROM public.coin_transactions));
SELECT setval('public.daily_claims_id_seq', (SELECT MAX(id) FROM public.daily_claims));
SELECT setval('public.daily_rewards_id_seq', (SELECT MAX(id) FROM public.daily_rewards));
SELECT setval('public.daily_spin_tickets_id_seq', (SELECT MAX(id) FROM public.daily_spin_tickets));
SELECT setval('public.downloads_id_seq', (SELECT MAX(id) FROM public.downloads));
SELECT setval('public.dynamic_menus_id_seq', (SELECT MAX(id) FROM public.dynamic_menus));
SELECT setval('public.forum_categories_id_seq', (SELECT MAX(id) FROM public.forum_categories));
SELECT setval('public.forum_posts_id_seq', (SELECT MAX(id) FROM public.forum_posts));
SELECT setval('public.forum_ranks_id_seq', (SELECT MAX(id) FROM public.forum_ranks));
SELECT setval('public.forum_replies_id_seq', (SELECT MAX(id) FROM public.forum_replies));
SELECT setval('public.forum_threads_id_seq', (SELECT MAX(id) FROM public.forum_threads));
SELECT setval('public.likes_id_seq', (SELECT MAX(id) FROM public.likes));
SELECT setval('public.linkvertise_downloads_id_seq', (SELECT MAX(id) FROM public.linkvertise_downloads));
SELECT setval('public.notifications_id_seq', (SELECT MAX(id) FROM public.notifications));
SELECT setval('public.pages_id_seq', (SELECT MAX(id) FROM public.pages));
SELECT setval('public.payments_id_seq', (SELECT MAX(id) FROM public.payments));
SELECT setval('public.premium_downloads_id_seq', (SELECT MAX(id) FROM public.premium_downloads));
SELECT setval('public.profiles_id_seq', (SELECT MAX(id) FROM public.profiles));
SELECT setval('public.redeem_codes_id_seq', (SELECT MAX(id) FROM public.redeem_codes));
SELECT setval('public.referrals_id_seq', (SELECT MAX(id) FROM public.referrals));
SELECT setval('public.settings_id_seq', (SELECT MAX(id) FROM public.settings));
SELECT setval('public.spin_history_id_seq', (SELECT MAX(id) FROM public.spin_history));
SELECT setval('public.spin_wheel_id_seq', (SELECT MAX(id) FROM public.spin_wheel));
SELECT setval('public.testimonials_id_seq', (SELECT MAX(id) FROM public.testimonials));
SELECT setval('public.user_sessions_id_seq', (SELECT MAX(id) FROM public.user_sessions));
SELECT setval('public.vip_downloads_id_seq', (SELECT MAX(id) FROM public.vip_downloads));
SELECT setval('public.wallet_transactions_id_seq', (SELECT MAX(id) FROM public.wallet_transactions));

-- Data import completed!
`;

fs.writeFileSync(outputFile, outputContent);

console.log(`✅ Extracted ${insertStatements.length} INSERT statements`);
console.log(`📄 Output written to: ${outputFile}`);

// Show some stats
const tableStats = {};
for (const insert of insertStatements) {
    const tableName = insert.match(/INSERT INTO public\.(\w+)/);
    if (tableName) {
        const table = tableName[1];
        tableStats[table] = (tableStats[table] || 0) + 1;
    }
}

console.log('\n📊 Table statistics:');
Object.entries(tableStats).forEach(([table, count]) => {
    console.log(`   ${table}: ${count} INSERT statements`);
});
