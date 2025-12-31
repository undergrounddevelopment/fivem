import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function searchTestimonials() {
  console.log('🔍 SEARCHING FOR LOST TESTIMONIALS...\n')

  try {
    // 1. Check main table
    console.log('1️⃣ Checking main testimonials table...')
    const { data: mainData, error: mainError, count } = await supabase
      .from('testimonials')
      .select('*', { count: 'exact' })
    
    console.log(`   Found: ${count || 0} records`)
    if (mainData && mainData.length > 0) {
      console.log('   ✅ Data exists in main table!')
      mainData.forEach((t: any) => {
        console.log(`      - ${t.username}: ${t.rating}⭐ (${t.upvotes_received || 0} upvotes)`)
      })
    } else {
      console.log('   ❌ No data in main table')
    }
    console.log('')

    // 2. Check for backup tables
    console.log('2️⃣ Searching for backup tables...')
    const backupTables = [
      'testimonials_backup',
      'testimonials_old',
      'testimonials_archive',
      'reviews',
      'user_reviews',
      'customer_reviews'
    ]

    for (const tableName of backupTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        if (!error && data) {
          console.log(`   ✅ Found table: ${tableName}`)
          const { count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true })
          console.log(`      Records: ${count}`)
        }
      } catch (e) {
        // Table doesn't exist, skip
      }
    }
    console.log('')

    // 3. Check if RLS is blocking
    console.log('3️⃣ Checking RLS policies...')
    const { data: policies } = await supabase.rpc('get_policies', {
      table_name: 'testimonials'
    })
    console.log(`   Policies found: ${policies ? 'Yes' : 'No'}`)
    console.log('')

    // 4. Try direct query with service role
    console.log('4️⃣ Trying direct query with service role...')
    const { data: directData, error: directError } = await supabase
      .from('testimonials')
      .select('*')
    
    if (directError) {
      console.log(`   ❌ Error: ${directError.message}`)
    } else {
      console.log(`   ✅ Query successful: ${directData?.length || 0} records`)
    }
    console.log('')

    // 5. Check database logs
    console.log('5️⃣ Checking recent activity...')
    console.log('   Run this SQL in Supabase SQL Editor:')
    console.log('   SELECT * FROM pg_stat_user_tables WHERE tablename = \'testimonials\';')
    console.log('')

    // 6. Recommendations
    console.log('📋 RECOMMENDATIONS:\n')
    if (count === 0) {
      console.log('   ❌ No testimonials found in database')
      console.log('   \n   Possible causes:')
      console.log('   1. Data was deleted (TRUNCATE or DELETE)')
      console.log('   2. Wrong database/project')
      console.log('   3. Table was recreated')
      console.log('   4. Migration reset the data')
      console.log('\n   Solutions:')
      console.log('   1. Check Supabase dashboard > Table Editor')
      console.log('   2. Check if you have multiple Supabase projects')
      console.log('   3. Restore from backup if available')
      console.log('   4. Re-seed data: scripts/SEED-TESTIMONIALS-COMPLETE.sql')
    }

  } catch (error) {
    console.error('❌ ERROR:', error)
  }
}

searchTestimonials()
