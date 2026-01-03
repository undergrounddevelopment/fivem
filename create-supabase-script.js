#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

async function createSupabaseExecutionScript() {
  console.log('🚀 Creating Supabase SQL execution script...\n');

  try {
    // Read the complete schema file
    const schemaPath = path.join(__dirname, 'database-schema-complete-v7.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    // Create a clean SQL file for Supabase SQL Editor
    const cleanSQL = `-- FiveM Tools V7 - Complete Database Schema
-- Execute this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- This script will create all tables, indexes, triggers, and initial data
-- for your FiveM Tools V7 application

${schemaSQL}

-- Final verification query
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Success message
SELECT 'FiveM Tools V7 Database Setup Complete! 🎉' as status;`;

    // Write the clean SQL file
    const outputPath = path.join(__dirname, 'EXECUTE_IN_SUPABASE.sql');
    fs.writeFileSync(outputPath, cleanSQL);

    console.log('✅ SQL execution file created: EXECUTE_IN_SUPABASE.sql');
    console.log('\n📋 Instructions:');
    console.log('1. Open your Supabase dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Copy and paste the content of EXECUTE_IN_SUPABASE.sql');
    console.log('4. Click "Run" to execute the schema');
    console.log('\n🔗 Supabase SQL Editor:');
    console.log(`https://supabase.com/dashboard/project/${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}/sql`);

    // Also create a summary of what will be created
    const summary = `# FiveM Tools V7 - Database Schema Summary

## Tables to be created (25 total):

### Core Tables (15):
1. users - User accounts and profiles
2. assets - FiveM scripts, MLOs, vehicles, clothing
3. forum_categories - Forum categories
4. forum_threads - Forum discussions
5. forum_replies - Forum replies
6. notifications - User notifications
7. activities - User activity log
8. downloads - Download tracking
9. coin_transactions - Coin system transactions
10. spin_wheel_prizes - Spin wheel rewards
11. spin_wheel_tickets - User spin tickets
12. spin_wheel_history - Spin history
13. announcements - Site announcements
14. banners - Promotional banners
15. testimonials - User reviews

### Admin & Security Tables (6):
16. admin_actions - Admin action logs
17. security_events - Security monitoring
18. firewall_rules - IP filtering rules
19. rate_limits - Rate limiting data
20. user_presence - Real-time user status
21. realtime_events - Real-time notifications

### Features:
- ✅ Row Level Security (RLS)
- ✅ Performance indexes
- ✅ Auto-update triggers
- ✅ Optimized views
- ✅ Initial sample data
- ✅ Security policies

## After execution:
Your database will be 100% ready for FiveM Tools V7!`;

    fs.writeFileSync(path.join(__dirname, 'DATABASE_SCHEMA_SUMMARY.md'), summary);
    console.log('✅ Schema summary created: DATABASE_SCHEMA_SUMMARY.md');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createSupabaseExecutionScript().catch(console.error);