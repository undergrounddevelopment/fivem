import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(__dirname, '../.env') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function clearSampleData() {
  console.log('🗑️  Clearing sample data...\n')

  // Delete sample assets
  const { error: assetError } = await supabase
    .from('assets')
    .delete()
    .eq('author_id', 'system')
  
  if (assetError) console.error('❌ Assets:', assetError.message)
  else console.log('✅ Deleted sample assets')

  // Delete testimonials
  const { error: testError } = await supabase
    .from('testimonials')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
  
  if (testError) console.error('❌ Testimonials:', testError.message)
  else console.log('✅ Deleted sample testimonials')

  // Delete sample users
  const { error: userError } = await supabase
    .from('users')
    .delete()
    .like('discord_id', 'sample_%')
  
  if (userError) console.error('❌ Users:', userError.message)
  else console.log('✅ Deleted sample users')

  console.log('\n✨ Sample data cleared! Database is now clean.\n')
}

clearSampleData().catch(console.error)
