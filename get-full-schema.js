const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://linnqtixdfjwbrixitrb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMTU1NzcsImV4cCI6MjA1Mzg5MTU3N30.Ks-Vu-Hy-Ks0Ks0Ks0Ks0Ks0Ks0Ks0Ks0Ks0Ks0Ks0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getFullSchema() {
  const { Client } = require('pg');
  
  const client = new Client({
    host: 'aws-1-us-east-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres.linnqtixdfjwbrixitrb',
    password: '06Zs04s8vCBrW4XE',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Get full schema dump
    const query = `
      SELECT 
        'CREATE TABLE ' || table_name || ' (' || 
        string_agg(
          column_name || ' ' || 
          data_type || 
          CASE WHEN character_maximum_length IS NOT NULL 
            THEN '(' || character_maximum_length || ')' 
            ELSE '' 
          END ||
          CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END,
          ', '
        ) || ');' as create_statement
      FROM information_schema.columns
      WHERE table_schema = 'public'
      GROUP BY table_name
      ORDER BY table_name;
    `;

    const result = await client.query(query);
    
    let fullSQL = '-- FiveM Tools V7 - Full Database Schema\n';
    fullSQL += '-- Generated: ' + new Date().toISOString() + '\n\n';
    
    for (const row of result.rows) {
      fullSQL += row.create_statement + '\n\n';
    }

    // Get indexes
    const indexQuery = `
      SELECT indexdef || ';' as index_def
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname;
    `;
    
    const indexes = await client.query(indexQuery);
    fullSQL += '\n-- Indexes\n';
    for (const idx of indexes.rows) {
      fullSQL += idx.index_def + '\n';
    }

    fs.writeFileSync('full-schema.sql', fullSQL);
    console.log('✅ Schema saved to full-schema.sql');

    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getFullSchema();
