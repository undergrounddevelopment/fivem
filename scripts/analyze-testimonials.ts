import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function analyzeTestimonials() {
  console.log('🔍 ANALYZING TESTIMONIALS IN SUPABASE...\n')

  try {
    // 1. Check if table exists
    console.log('1️⃣ Checking table existence...')
    const { data: tables, error: tableError } = await supabase
      .from('testimonials')
      .select('*')
      .limit(1)

    if (tableError) {
      console.error('❌ Table does not exist or error:', tableError.message)
      return
    }
    console.log('✅ Table exists\n')

    // 2. Count total testimonials
    console.log('2️⃣ Counting testimonials...')
    const { count, error: countError } = await supabase
      .from('testimonials')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('❌ Error counting:', countError.message)
      return
    }
    console.log(`✅ Total testimonials: ${count}\n`)

    if (count === 0) {
      console.log('⚠️  NO DATA FOUND!')
      console.log('📝 Run this SQL in Supabase SQL Editor:')
      console.log('   scripts/SEED-TESTIMONIALS-COMPLETE.sql\n')
      return
    }

    // 3. Get all testimonials
    console.log('3️⃣ Fetching all testimonials...')
    const { data: testimonials, error: fetchError } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('❌ Error fetching:', fetchError.message)
      return
    }

    // 4. Calculate stats
    console.log('4️⃣ Calculating statistics...\n')
    const totalUpvotes = testimonials?.reduce((sum, t) => sum + (t.upvotes_received || 0), 0) || 0
    const avgRating = testimonials?.reduce((sum, t) => sum + t.rating, 0) / (testimonials?.length || 1)
    const verifiedCount = testimonials?.filter(t => t.is_verified).length || 0
    const featuredCount = testimonials?.filter(t => t.is_featured).length || 0

    console.log('📊 STATISTICS:')
    console.log(`   Total Testimonials: ${count}`)
    console.log(`   Total Upvotes: ${totalUpvotes.toLocaleString()}`)
    console.log(`   Average Rating: ${avgRating.toFixed(2)}/5.0`)
    console.log(`   Verified Users: ${verifiedCount}`)
    console.log(`   Featured: ${featuredCount}\n`)

    // 5. Show sample data
    console.log('5️⃣ Sample testimonials:\n')
    testimonials?.slice(0, 5).forEach((t, i) => {
      console.log(`${i + 1}. ${t.username} (${t.rating}⭐)`)
      console.log(`   Server: ${t.server_name || 'N/A'}`)
      console.log(`   Upvotes: ${(t.upvotes_received || 0).toLocaleString()}`)
      console.log(`   Verified: ${t.is_verified ? '✅' : '❌'}`)
      console.log(`   Featured: ${t.is_featured ? '✅' : '❌'}`)
      console.log(`   Badge: ${t.badge || 'None'}`)
      console.log(`   Content: ${t.content.substring(0, 60)}...`)
      console.log('')
    })

    // 6. Check badges distribution
    console.log('6️⃣ Badge distribution:')
    const badges = testimonials?.reduce((acc, t) => {
      const badge = t.badge || 'none'
      acc[badge] = (acc[badge] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    Object.entries(badges || {}).forEach(([badge, count]) => {
      console.log(`   ${badge}: ${count}`)
    })
    console.log('')

    // 7. Test API endpoint
    console.log('7️⃣ Testing API endpoint...')
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/testimonials`)
      const apiData = await response.json()
      console.log(`✅ API returns ${apiData.length} testimonials`)
      
      if (apiData.length === 0) {
        console.log('⚠️  API returns empty array!')
        console.log('   Possible causes:')
        console.log('   - All testimonials have is_featured = false')
        console.log('   - RLS policies blocking access')
      }
    } catch (error) {
      console.error('❌ API test failed:', error)
    }
    console.log('')

    // 8. Check RLS policies
    console.log('8️⃣ Checking RLS status...')
    const { data: rlsData } = await supabase.rpc('check_rls_enabled', {
      table_name: 'testimonials'
    }).single()
    
    console.log(`   RLS Enabled: ${rlsData ? 'Yes' : 'Unknown'}`)
    console.log('')

    console.log('✅ ANALYSIS COMPLETE!\n')

  } catch (error) {
    console.error('❌ FATAL ERROR:', error)
  }
}

analyzeTestimonials()
