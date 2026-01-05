const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://linnqtixdfjwbrixitrb.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTIxMjg1MiwiZXhwIjoyMDgwNzg4ODUyfQ.Rri9zq0S-Y4nRpwkuiHp1GsZJXAsL-6-xpqJ1fAP3KE',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function checkExistingData() {
  try {
    console.log('🔍 Checking existing data in Supabase...\n')

    // Check assets table
    console.log('📦 ASSETS TABLE:')
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('id, title, status, category, author_id, creator_id')
      .order('created_at', { ascending: false })

    if (assetsError) {
      console.error('❌ Assets error:', assetsError)
    } else {
      console.log(`   Total assets: ${assets.length}`)
      assets.forEach((asset, index) => {
        console.log(`   ${index + 1}. ${asset.title} (${asset.status}) - Category: ${asset.category}`)
        console.log(`      ID: ${asset.id}`)
        console.log(`      Author ID: ${asset.author_id || 'NULL'}`)
        console.log(`      Creator ID: ${asset.creator_id || 'NULL'}`)
        console.log('')
      })
    }

    // Check users table
    console.log('\n👥 USERS TABLE:')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, discord_id, username')
      .order('created_at', { ascending: false })

    if (usersError) {
      console.error('❌ Users error:', usersError)
    } else {
      console.log(`   Total users: ${users.length}`)
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.username} (Discord: ${user.discord_id})`)
        console.log(`      UUID: ${user.id}`)
      })
    }

    // Check foreign key relationships
    console.log('\n🔗 CHECKING FOREIGN KEY RELATIONSHIPS:')
    if (assets && users) {
      assets.forEach(asset => {
        const authorByUUID = users.find(u => u.id === asset.author_id)
        const creatorByUUID = users.find(u => u.id === asset.creator_id)
        
        console.log(`Asset: ${asset.title}`)
        console.log(`  author_id (${asset.author_id}): ${authorByUUID ? '✅ Found' : '❌ Not found'}`)
        console.log(`  creator_id (${asset.creator_id}): ${creatorByUUID ? '✅ Found' : '❌ Not found'}`)
      })
    }

  } catch (error) {
    console.error('💥 Error:', error)
  }
}

checkExistingData()