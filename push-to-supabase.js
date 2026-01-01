// PUSH ALL DATA TO NEW SUPABASE
// Run: node push-to-supabase.js

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = 'https://peaulqbbvgzpnwshtbok.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE'
const supabase = createClient(supabaseUrl, supabaseKey)

// Read data from complete_data_dump.sql
const sqlData = fs.readFileSync('./database-dump/complete_data_dump.sql', 'utf8')

// Parse INSERT statements
const insertStatements = sqlData.match(/INSERT INTO users \([^)]+\) VALUES \([^;]+\);/g)

console.log('🚀 Starting data push to Supabase...')
console.log(`📊 Found ${insertStatements?.length || 0} users to import`)

async function pushData() {
  try {
    // 1. Create tables first
    console.log('📋 Creating tables...')
    const createTablesSQL = fs.readFileSync('./IMPORT_TO_SUPABASE.sql', 'utf8')
    
    // Execute via Supabase SQL
    const { error: tableError } = await supabase.rpc('exec_sql', { 
      sql: createTablesSQL 
    })
    
    if (tableError) {
      console.log('⚠️  Tables might already exist, continuing...')
    } else {
      console.log('✅ Tables created successfully')
    }

    // 2. Push users data
    console.log('👥 Pushing users data...')
    
    // Parse and insert users in batches
    const batchSize = 100
    let successCount = 0
    
    for (let i = 0; i < insertStatements.length; i += batchSize) {
      const batch = insertStatements.slice(i, i + batchSize)
      
      for (const statement of batch) {
        // Extract values from INSERT statement
        const match = statement.match(/VALUES \(([^)]+)\)/)
        if (match) {
          const values = match[1].split(',').map(v => v.trim().replace(/^'|'$/g, ''))
          
          const userData = {
            id: values[0],
            discord_id: values[1],
            username: values[2],
            email: values[3] === 'NULL' ? null : values[3],
            avatar: values[4] === 'NULL' ? null : values[4],
            membership: values[5],
            coins: parseInt(values[6]),
            reputation: parseInt(values[7]),
            downloads: parseInt(values[8]),
            points: parseInt(values[9]),
            is_banned: values[10] === 'true',
            is_admin: values[12] === 'true',
            spin_tickets: parseInt(values[16]),
            role: values[17],
            is_active: values[18] === 'true',
            xp: parseInt(values[19]),
            level: parseInt(values[20])
          }
          
          const { error } = await supabase
            .from('users')
            .upsert(userData, { onConflict: 'discord_id' })
          
          if (!error) successCount++
        }
      }
      
      console.log(`✅ Processed ${Math.min(i + batchSize, insertStatements.length)}/${insertStatements.length} users`)
    }
    
    console.log(`\n🎉 SUCCESS! Pushed ${successCount} users to Supabase`)
    console.log(`🔗 Database: ${supabaseUrl}`)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

pushData()
