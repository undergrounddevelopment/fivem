import pg from 'pg'
const { Client } = pg

async function exportSchema() {
  const client = new Client({
    host: 'aws-1-us-east-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres.linnqtixdfjwbrixitrb',
    password: 'pkV89nkftaSw9iPF',
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    console.log('✅ Connected to database\n')

    // Get all tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)

    let sql = '-- FiveM Tools V7 - Complete Database Schema\n\n'

    for (const row of tablesResult.rows) {
      const tableName = row.table_name
      console.log(`📋 Exporting: ${tableName}`)

      // Get CREATE TABLE statement
      const createResult = await client.query(`
        SELECT 
          'CREATE TABLE ' || quote_ident(table_name) || ' (' ||
          string_agg(
            quote_ident(column_name) || ' ' || 
            data_type || 
            CASE WHEN character_maximum_length IS NOT NULL 
              THEN '(' || character_maximum_length || ')' 
              ELSE '' 
            END ||
            CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
            CASE WHEN column_default IS NOT NULL 
              THEN ' DEFAULT ' || column_default 
              ELSE '' 
            END,
            ', '
          ) || ');' as create_statement
        FROM information_schema.columns
        WHERE table_name = $1
        GROUP BY table_name
      `, [tableName])

      sql += `\n-- Table: ${tableName}\n`
      sql += createResult.rows[0].create_statement + '\n'

      // Get indexes
      const indexResult = await client.query(`
        SELECT indexdef 
        FROM pg_indexes 
        WHERE tablename = $1 
        AND schemaname = 'public'
      `, [tableName])

      if (indexResult.rows.length > 0) {
        sql += '\n-- Indexes\n'
        indexResult.rows.forEach(idx => {
          sql += idx.indexdef + ';\n'
        })
      }

      sql += '\n'
    }

    // Save to file
    const fs = await import('fs')
    fs.writeFileSync('database-schema-complete.sql', sql)
    console.log('\n✅ Schema exported to: database-schema-complete.sql')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await client.end()
  }
}

exportSchema()
