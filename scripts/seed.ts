import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load .env file
dotenv.config({ path: resolve(__dirname, '../.env') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seed() {
  console.log('🌱 Starting database seed...\n')

  // Only seed forum categories (essential for forum functionality)
  const { data: categories, error: catError } = await supabase
    .from('forum_categories')
    .insert([
      { name: 'Scripts', description: 'FiveM Scripts Discussion', icon: '📜', color: '#3b82f6', sort_order: 1 },
      { name: 'MLOs', description: 'Map & MLO Discussion', icon: '🏢', color: '#8b5cf6', sort_order: 2 },
      { name: 'Resources', description: 'General Resources', icon: '📦', color: '#10b981', sort_order: 3 },
      { name: 'Support', description: 'Help & Support', icon: '💬', color: '#f59e0b', sort_order: 4 }
    ])
    .select()

  if (catError && !catError.message.includes('duplicate')) console.error('❌ Categories:', catError.message)
  else console.log('✅ Forum categories:', categories?.length || 4)

  console.log('\n✨ Database ready!')
  console.log('\n📊 Next steps:')
  console.log('1. Login with Discord to create your user')
  console.log('2. Upload assets to populate data')
  console.log('3. All data will be real from actual users\n')
}

seed().catch(console.error)
