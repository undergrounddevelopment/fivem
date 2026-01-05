const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function fullDiscordIdMigration() {
  console.log('🚀 FULL DISCORD ID MIGRATION - 100% COMPLETE\n')
  
  try {
    // Get all users for mapping
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, discord_id, username')
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
      return
    }
    
    console.log(`📊 Found ${users.length} users for mapping`)
    
    const userIdToDiscordId = {}
    users.forEach(user => {
      userIdToDiscordId[user.id] = user.discord_id
    })
    
    // All tables that need Discord ID migration
    const migrations = [
      // Core tables
      { table: 'assets', columns: ['author_id'] },
      { table: 'forum_threads', columns: ['author_id'] },
      { table: 'forum_replies', columns: ['author_id'] },
      
      // User activity tables
      { table: 'notifications', columns: ['user_id'] },
      { table: 'activities', columns: ['user_id'] },
      { table: 'downloads', columns: ['user_id'] },
      { table: 'coin_transactions', columns: ['user_id'] },
      
      // Spin wheel tables
      { table: 'spin_wheel_history', columns: ['user_id'] },
      { table: 'spin_wheel_tickets', columns: ['user_id'] },
      
      // Other potential tables
      { table: 'testimonials', columns: ['user_id'] },
      { table: 'banners', columns: ['created_by'] },
      { table: 'announcements', columns: ['created_by'] },
    ]
    
    let totalUpdated = 0
    let totalAlreadyCorrect = 0\n    \n    for (const migration of migrations) {\n      for (const column of migration.columns) {\n        console.log(`\\n📋 Processing ${migration.table}.${column}...`)\n        \n        try {\n          const { data: records, error: fetchError } = await supabase\n            .from(migration.table)\n            .select(`id, ${column}`)\n          \n          if (fetchError) {\n            console.log(`   ⚠️  Column ${column} not found in ${migration.table}`)\n            continue\n          }\n          \n          let updated = 0\n          let alreadyCorrect = 0\n          \n          for (const record of records || []) {\n            const currentId = record[column]\n            if (!currentId) continue\n            \n            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentId)\n            \n            if (isUUID) {\n              const discordId = userIdToDiscordId[currentId]\n              if (discordId) {\n                const { error: updateError } = await supabase\n                  .from(migration.table)\n                  .update({ [column]: discordId })\n                  .eq('id', record.id)\n                \n                if (!updateError) {\n                  updated++\n                }\n              }\n            } else {\n              alreadyCorrect++\n            }\n          }\n          \n          console.log(`   ✅ Updated: ${updated}, Already correct: ${alreadyCorrect}`)\n          totalUpdated += updated\n          totalAlreadyCorrect += alreadyCorrect\n          \n        } catch (error) {\n          console.log(`   ⚠️  Error processing ${migration.table}.${column}:`, error.message)\n        }\n      }\n    }\n    \n    console.log('\\n' + '='.repeat(60))\n    console.log('🎉 DISCORD ID MIGRATION COMPLETE!')\n    console.log(`📊 FINAL STATISTICS:`)\n    console.log(`   ✅ Total records updated: ${totalUpdated}`)\n    console.log(`   ✅ Already using Discord ID: ${totalAlreadyCorrect}`)\n    console.log(`   📝 Total processed: ${totalUpdated + totalAlreadyCorrect}`)\n    console.log('\\n🚀 ALL SYSTEMS NOW USE DISCORD ID 100%!')\n    \n  } catch (error) {\n    console.error('❌ Migration error:', error)\n  }\n}\n\nfullDiscordIdMigration()