const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function fixAllAssetsToDiscordId() {
  console.log('🔧 FIXING ALL ASSETS TO USE DISCORD ID...\n')
  
  try {
    // Get all users for mapping
    const { data: users } = await supabase
      .from('users')
      .select('id, discord_id, username')
    
    const userIdToDiscordId = {}
    users.forEach(user => {
      userIdToDiscordId[user.id] = user.discord_id
    })
    
    console.log(`📊 User mapping: ${Object.keys(userIdToDiscordId).length} users`)
    
    // Get all assets
    const { data: assets } = await supabase
      .from('assets')
      .select('id, author_id, creator_id, title')
    
    console.log(`📊 Found ${assets.length} assets to process\n`)
    
    let fixed = 0
    
    for (const asset of assets) {
      const updates = {}
      let needsUpdate = false
      
      // Check author_id
      if (asset.author_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(asset.author_id)) {
        const discordId = userIdToDiscordId[asset.author_id]
        if (discordId) {
          updates.author_id = discordId
          needsUpdate = true
        }
      }
      
      // Check creator_id
      if (asset.creator_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(asset.creator_id)) {
        const discordId = userIdToDiscordId[asset.creator_id]
        if (discordId) {
          updates.creator_id = discordId
          needsUpdate = true
        }
      }
      
      if (needsUpdate) {
        const { error } = await supabase
          .from('assets')
          .update(updates)
          .eq('id', asset.id)
        
        if (!error) {
          console.log(`✅ Fixed: "${asset.title}"`)
          if (updates.author_id) console.log(`   author_id: ${asset.author_id} -> ${updates.author_id}`)
          if (updates.creator_id) console.log(`   creator_id: ${asset.creator_id} -> ${updates.creator_id}`)
          fixed++
        } else {
          console.log(`❌ Error updating ${asset.title}:`, error.message)
        }
      }
    }
    
    console.log(`\n📊 ASSETS MIGRATION COMPLETE:`)
    console.log(`✅ Fixed: ${fixed} assets`)
    console.log(`📝 Total processed: ${assets.length} assets`)
    
    if (fixed > 0) {
      console.log('\n🎉 ALL ASSETS NOW USE DISCORD ID!')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

fixAllAssetsToDiscordId()