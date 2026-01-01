const fs = require('fs');
const path = require('path');

// Read the backup file
const backupFile = 'C:\\backup\\fivemvip_full.sql';
const outputFile = 'import-all-data.sql';

console.log('🔍 Extracting ALL data from backup file...');

// Read the backup file
const content = fs.readFileSync(backupFile, 'utf8');

// Extract all INSERT statements for public tables
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

// Group INSERT statements by table
const tableGroups = {};
for (const insert of insertStatements) {
    const tableName = insert.match(/INSERT INTO public\.(\w+)/);
    if (tableName) {
        const table = tableName[1];
        if (!tableGroups[table]) {
            tableGroups[table] = [];
        }
        tableGroups[table].push(insert);
    }
}

// Create comprehensive import script
let outputContent = `-- Complete data import from backup
-- Generated: ${new Date().toISOString()}
-- Total tables: ${Object.keys(tableGroups).length}
-- Total INSERT statements: ${insertStatements.length}

-- Set session for data import
SET session_replication_role = replica;
SET client_min_messages = warning;
SET client_encoding = 'UTF8';

-- Disable foreign key checks temporarily
SET session_replication_role = replica;

-- Clear existing data (in correct order to avoid foreign key issues)
TRUNCATE TABLE public.likes CASCADE;
TRUNCATE TABLE public.forum_replies CASCADE;
TRUNCATE TABLE public.forum_posts CASCADE;
TRUNCATE TABLE public.forum_threads CASCADE;
TRUNCATE TABLE public.asset_reviews CASCADE;
TRUNCATE TABLE public.asset_ratings CASCADE;
TRUNCATE TABLE public.downloads CASCADE;
TRUNCATE TABLE public.coin_transactions CASCADE;
TRUNCATE TABLE public.daily_claims CASCADE;
TRUNCATE TABLE public.daily_rewards CASCADE;
TRUNCATE TABLE public.daily_spin_tickets CASCADE;
TRUNCATE TABLE public.user_sessions CASCADE;
TRUNCATE TABLE public.notifications CASCADE;
TRUNCATE TABLE public.activities CASCADE;
TRUNCATE TABLE public.spin_history CASCADE;
TRUNCATE TABLE public.spin_wheel CASCADE;
TRUNCATE TABLE public.testimonials CASCADE;
TRUNCATE TABLE public.referrals CASCADE;
TRUNCATE TABLE public.profiles CASCADE;
TRUNCATE TABLE public.users CASCADE;
TRUNCATE TABLE public.forum_ranks CASCADE;
TRUNCATE TABLE public.forum_categories CASCADE;
TRUNCATE TABLE public.dynamic_menus CASCADE;
TRUNCATE TABLE public.banners CASCADE;
TRUNCATE TABLE public.ads CASCADE;
TRUNCATE TABLE public.announcements CASCADE;
TRUNCATE TABLE public.assets CASCADE;
TRUNCATE TABLE public.pages CASCADE;
TRUNCATE TABLE public.payments CASCADE;
TRUNCATE TABLE public.premium_downloads CASCADE;
TRUNCATE TABLE public.redeem_codes CASCADE;
TRUNCATE TABLE public.settings CASCADE;
TRUNCATE TABLE public.linkvertise_downloads CASCADE;
TRUNCATE TABLE public.vip_downloads CASCADE;
TRUNCATE TABLE public.wallet_transactions CASCADE;

`;

// Add INSERT statements in correct order (dependencies first)
const importOrder = [
    'users', 'forum_categories', 'forum_ranks', 'settings', 'assets', 'ads', 'banners', 
    'announcements', 'pages', 'redeem_codes', 'dynamic_menus',
    'profiles', 'activities', 'notifications', 'user_sessions',
    'daily_rewards', 'daily_claims', 'daily_spin_tickets',
    'coin_transactions', 'wallet_transactions', 'linkvertise_downloads',
    'premium_downloads', 'vip_downloads', 'payments',
    'forum_threads', 'forum_posts', 'forum_replies',
    'asset_ratings', 'asset_reviews', 'downloads', 'likes',
    'spin_wheel', 'spin_history', 'testimonials', 'referrals'
];

for (const table of importOrder) {
    if (tableGroups[table]) {
        outputContent += `\n-- Import ${table} data (${tableGroups[table].length} statements)\n`;
        outputContent += tableGroups[table].join('\n');
        outputContent += '\n';
    }
}

// Add any remaining tables not in the import order
for (const [table, statements] of Object.entries(tableGroups)) {
    if (!importOrder.includes(table)) {
        outputContent += `\n-- Import ${table} data (${statements.length} statements)\n`;
        outputContent += statements.join('\n');
        outputContent += '\n';
    }
}

outputContent += `
-- Re-enable foreign key checks
SET session_replication_role = DEFAULT;

-- Update sequences for all tables
`;

// Add sequence updates for all tables
for (const table of Object.keys(tableGroups)) {
    outputContent += `SELECT setval('public.${table}_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.${table}));\n`;
}

outputContent += `
-- Data import completed!
-- Summary:
-- - Tables imported: ${Object.keys(tableGroups).length}
-- - Total INSERT statements: ${insertStatements.length}
`;

fs.writeFileSync(outputFile, outputContent);

console.log(`✅ Extracted ${insertStatements.length} INSERT statements from ${Object.keys(tableGroups).length} tables`);
console.log(`📄 Output written to: ${outputFile}`);

// Show detailed stats
console.log('\n📊 Detailed table statistics:');
Object.entries(tableGroups).forEach(([table, statements]) => {
    // Count actual records (not just statements)
    let recordCount = 0;
    for (const stmt of statements) {
        // Count values in each INSERT
        const valuesMatch = stmt.match(/VALUES \((.*?)\)/);
        if (valuesMatch) {
            // Count rows by counting "),(" patterns
            const rows = stmt.split('),(').length;
            recordCount += rows;
        }
    }
    console.log(`   ${table}: ${statements.length} statements, ~${recordCount} records`);
});
