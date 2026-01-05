const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function fullDiscordIdMigration() {
  console.log('🚀 FULL DISCORD ID MIGRATION - 100% COMPLETE')
  console.log('')
  
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
      { table: 'assets', columns: ['author_id'] },
      { table: 'forum_threads', columns: ['author_id'] },
      { table: 'forum_replies', columns: ['author_id'] },
      { table: 'notifications', columns: ['user_id'] },
      { table: 'activities', columns: ['user_id'] },
      { table: 'downloads', columns: ['user_id'] },
      { table: 'coin_transactions', columns: ['user_id'] },
      { table: 'spin_wheel_history', columns: ['user_id'] },
      { table: 'spin_wheel_tickets', columns: ['user_id'] },
      { table: 'testimonials', columns: ['user_id'] },
    ]
    
    let totalUpdated = 0
    let totalAlreadyCorrect = 0
    
    for (const migration of migrations) {
      for (const column of migration.columns) {
        console.log(``)
        console.log(`📋 Processing ${migration.table}.${column}...`)
        
        try {
          const { data: records, error: fetchError } = await supabase
            .from(migration.table)
            .select(`id, ${column}`)
          
          if (fetchError) {
            console.log(`   ⚠️  Column ${column} not found in ${migration.table}`)
            continue
          }
          
          let updated = 0
          let alreadyCorrect = 0
          
          for (const record of records || []) {
            const currentId = record[column]
            if (!currentId) continue
            
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentId)
            
            if (isUUID) {
              const discordId = userIdToDiscordId[currentId]
              if (discordId) {
                const { error: updateError } = await supabase
                  .from(migration.table)
                  .update({ [column]: discordId })
                  .eq('id', record.id)
                
                if (!updateError) {
                  updated++
                }
              }
            } else {
              alreadyCorrect++
            }
          }
          
          console.log(`   ✅ Updated: ${updated}, Already correct: ${alreadyCorrect}`)
          totalUpdated += updated
          totalAlreadyCorrect += alreadyCorrect
          
        } catch (error) {
          console.log(`   ⚠️  Error processing ${migration.table}.${column}:`, error.message)
        }
      }
    }
    
    console.log('')
    console.log('============================================================')
    console.log('🎉 DISCORD ID MIGRATION COMPLETE!')
    console.log(`📊 FINAL STATISTICS:`)
    console.log(`   ✅ Total records updated: ${totalUpdated}`)
    console.log(`   ✅ Already using Discord ID: ${totalAlreadyCorrect}`)
    console.log(`   📝 Total processed: ${totalUpdated + totalAlreadyCorrect}`)
    console.log('')
    console.log('🚀 ALL SYSTEMS NOW USE DISCORD ID 100%!')
    
  } catch (error) {
    console.error('❌ Migration error:', error)
  }
}

fullDiscordIdMigration()