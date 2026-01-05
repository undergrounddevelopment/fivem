const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixAssetsData() {
  console.log('🔧 Fixing assets data...\n')

  try {
    // 1. Get or create default admin user
    let { data: adminUser } = await supabase
      .from('users')
      .select('id')
      .eq('discord_id', process.env.ADMIN_DISCORD_ID || '1047719075322810378')
      .single()

    if (!adminUser) {
      console.log('Creating default admin user...')
      const { data: newAdmin } = await supabase
        .from('users')
        .insert({
          discord_id: process.env.ADMIN_DISCORD_ID || '1047719075322810378',
          username: 'Admin',
          email: 'admin@fivemtools.net',
          is_admin: true,
          membership: 'vip'
        })
        .select('id')
        .single()
      
      adminUser = newAdmin
    }

    if (!adminUser) {
      console.error('❌ Could not create/find admin user')
      return
    }

    console.log(`✅ Admin user ID: ${adminUser.id}`)

    // 2. Fix assets without creator_id
    const { data: assetsToFix } = await supabase
      .from('assets')
      .select('id, title')
      .is('creator_id', null)

    console.log(`🔧 Fixing ${assetsToFix?.length || 0} assets without creator_id...`)

    if (assetsToFix && assetsToFix.length > 0) {
      const { error: updateError } = await supabase
        .from('assets')
        .update({ creator_id: adminUser.id })
        .is('creator_id', null)

      if (updateError) {
        console.error('❌ Error updating assets:', updateError.message)
      } else {
        console.log(`✅ Fixed ${assetsToFix.length} assets`)
      }
    }

    // 3. Set featured status for popular assets
    const { data: popularAssets } = await supabase
      .from('assets')
      .update({ 
        is_featured: true,
        status: 'featured'
      })
      .or('downloads.gt.50,likes.gt.20')
      .select('id, title, downloads')

    console.log(`✅ Set ${popularAssets?.length || 0} popular assets as featured`)

    // 4. Verify fix
    const { data: verifyAssets } = await supabase
      .from('assets')
      .select('*, author:users!creator_id(username)')
      .in('status', ['approved', 'featured', 'active'])
      .limit(5)

    console.log('\n📋 Verification - Sample assets with authors:')
    verifyAssets?.forEach((asset, index) => {
      console.log(`  ${index + 1}. ${asset.title}`)
      console.log(`     Author: ${asset.author?.username || 'Unknown'}`)
      console.log(`     Status: ${asset.status}`)
      console.log(`     Downloads: ${asset.downloads}`)
      console.log('')
    })

    console.log('✅ Assets data fix completed!')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

fixAssetsData()