import pg from 'pg'
const { Client } = pg

const oldDB = new Client({
  connectionString: 'postgresql://postgres.linnqtixdfjwbrixitrb:cba3nFp4y4pEemqa@aws-1-us-east-1.pooler.supabase.com:5432/postgres'
})

const newDB = new Client({
  connectionString: 'postgresql://postgres.peaulqbbvgzpnwshtbok:Vtdlv57XcKQlxtH6@aws-1-us-east-1.pooler.supabase.com:5432/postgres'
})

async function migrate() {
  await oldDB.connect()
  await newDB.connect()
  
  console.log('🚀 MIGRATION START\n')
  
  const tables = ['users', 'assets', 'forum_categories', 'forum_threads', 'forum_replies', 'announcements', 'banners', 'spin_wheel_prizes', 'spin_wheel_tickets', 'spin_wheel_history', 'notifications', 'activities', 'downloads', 'coin_transactions', 'testimonials']
  
  for (const table of tables) {
    try {
      console.log(`📋 ${table}...`)
      const { rows } = await oldDB.query(`SELECT * FROM ${table}`)
      
      if (rows.length === 0) {
        console.log(`⏭️  ${table}: empty`)
        continue
      }
      
      for (const row of rows) {
        const columns = Object.keys(row).join(', ')
        const values = Object.values(row).map((v, i) => `$${i + 1}`)
        await newDB.query(
          `INSERT INTO ${table} (${columns}) VALUES (${values.join(', ')}) ON CONFLICT DO NOTHING`,
          Object.values(row)
        )
      }
      
      console.log(`✅ ${table}: ${rows.length} rows`)
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`)
    }
  }
  
  await oldDB.end()
  await newDB.end()
  console.log('\n🎉 MIGRATION COMPLETE!')
}

migrate()
