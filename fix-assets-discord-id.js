const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function fixAssetsDiscordId() {
  console.log('🔧 FIXING ASSETS TO USE DISCORD ID...\n')
  
  try {
    // Get all users for mapping
    const { data: users } = await supabase
      .from('users')
      .select('id, discord_id, username')
    
    const userIdToDiscordId = {}
    users.forEach(user => {
      userIdToDiscordId[user.id] = user.discord_id
    })
    
    // Get all assets
    const { data: assets } = await supabase
      .from('assets')
      .select('id, author_id, title')
    
    let fixed = 0
    let alreadyCorrect = 0
    
    for (const asset of assets) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(asset.author_id)
      
      if (isUUID) {
        const discordId = userIdToDiscordId[asset.author_id]
        if (discordId) {
          const { error } = await supabase
            .from('assets')
            .update({ author_id: discordId })
            .eq('id', asset.id)
          
          if (!error) {
            console.log(`✅ Fixed: "${asset.title}" - ${asset.author_id} -> ${discordId}`)
            fixed++
          }
        } else {
          console.log(`⚠️  No Discord ID found for UUID: ${asset.author_id}`)
        }
      } else {
        alreadyCorrect++
      }
    }
    
    console.log(`\n📊 ASSETS FIXED:`)
    console.log(`✅ Fixed: ${fixed}`)
    console.log(`✅ Already correct: ${alreadyCorrect}`)
    
    if (fixed > 0) {
      console.log('\n🎉 ALL ASSETS NOW USE DISCORD ID!')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

fixAssetsDiscordId()