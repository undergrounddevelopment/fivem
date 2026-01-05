const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateAllTablesToDiscordId() {
  console.log('🔧 Updating ALL tables to use Discord ID consistently...\n')
  
  try {
    // Get all users for mapping
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, discord_id')
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
      return
    }
    
    const userIdToDiscordId = {}
    users.forEach(user => {
      userIdToDiscordId[user.id] = user.discord_id
    })
    
    const tables = [
      { name: 'assets', column: 'author_id' },
      { name: 'assets', column: 'user_id' },
      { name: 'notifications', column: 'user_id' },
      { name: 'activities', column: 'user_id' },
      { name: 'downloads', column: 'user_id' },
      { name: 'coin_transactions', column: 'user_id' },
      { name: 'spin_wheel_history', column: 'user_id' },
      { name: 'spin_wheel_tickets', column: 'user_id' },
    ]
    
    for (const table of tables) {
      console.log(`\n📋 Updating ${table.name}.${table.column}...`)
      
      const { data: records, error: fetchError } = await supabase
        .from(table.name)
        .select(`id, ${table.column}`)
      
      if (fetchError) {
        console.log(`⚠️  Table ${table.name} not found or error:`, fetchError.message)
        continue
      }
      
      let updated = 0
      let alreadyCorrect = 0
      
      for (const record of records || []) {
        const currentId = record[table.column]
        if (!currentId) continue
        
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentId)
        
        if (isUUID) {
          const discordId = userIdToDiscordId[currentId]
          if (discordId) {
            const { error: updateError } = await supabase
              .from(table.name)
              .update({ [table.column]: discordId })
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
    }
    
    console.log('\n🎉 All tables updated to use Discord ID consistently!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

updateAllTablesToDiscordId()