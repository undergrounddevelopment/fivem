import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(__dirname, '../.env') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkData() {
  console.log('📊 Checking database data...\n')

  const { data: users, error: userError } = await supabase
    .from('users')
    .select('*')

  console.log('Users:', users?.length || 0)
  if (users) users.forEach(u => console.log(`  - ${u.username} (${u.membership})`))

  const { data: categories, error: catError } = await supabase
    .from('forum_categories')
    .select('*')

  console.log('\nForum Categories:', categories?.length || 0)
  if (categories) categories.forEach(c => console.log(`  - ${c.name}`))

  const { data: assets, error: assetError } = await supabase
    .from('assets')
    .select('*')

  console.log('\nAssets:', assets?.length || 0)
  if (assets) assets.forEach(a => console.log(`  - ${a.title}`))

  const { data: testimonials, error: testError } = await supabase
    .from('testimonials')
    .select('*')

  console.log('\nTestimonials:', testimonials?.length || 0)
  if (testimonials) testimonials.forEach(t => console.log(`  - ${t.content.substring(0, 50)}...`))

  console.log('\n✅ Check complete!')
}

checkData().catch(console.error)
