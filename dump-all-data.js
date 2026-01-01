#!/usr/bin/env node

/**
 * Complete PostgreSQL Data Dump Script
 * Exports all data from the database using Node.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  connectionString: 'postgres://postgres.linnqtixdfjwbrixitrb:06Zs04s8vCBrW4XE@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require',
  ssl: { 
    rejectUnauthorized: false,
    requestCert: true,
    agent: false
  }
};

// Create output directory
const outputDir = path.join(__dirname, 'database-dump');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function connectToDatabase() {
  const client = new Client(dbConfig);
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL database');
    return client;
  } catch (error) {
    console.error('❌ Failed to connect to database:', error.message);
    throw error;
  }
}

async function getTables(client) {
  try {
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    const tables = result.rows.map(row => row.table_name);
    console.log(`📋 Found ${tables.length} tables: ${tables.join(', ')}`);
    
    // Save tables list
    fs.writeFileSync(
      path.join(outputDir, 'tables_list.txt'),
      tables.join('\n'),
      'utf8'
    );
    
    return tables;
  } catch (error) {
    console.error('❌ Error getting tables:', error.message);
    throw error;
  }
}

async function getTableSchema(client, tableName) {
  try {
    const result = await client.query(`
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);
    
    return result.rows;
  } catch (error) {
    console.error(`❌ Error getting schema for ${tableName}:`, error.message);
    return [];
  }
}

async function exportTableData(client, tableName) {
  try {
    console.log(`📤 Exporting table: ${tableName}`);
    
    // Get table schema first
    const schema = await getTableSchema(client, tableName);
    if (schema.length === 0) {
      console.log(`⚠️  No schema found for table: ${tableName}`);
      return;
    }
    
    // Get all data
    const dataResult = await client.query(`
      SELECT * FROM ${tableName} ORDER BY id
    `);
    
    const rows = dataResult.rows;
    console.log(`  📊 Found ${rows.length} rows`);
    
    // Export as CSV
    if (rows.length > 0) {
      const headers = Object.keys(rows[0]);
      const csvContent = [
        headers.join(','),
        ...rows.map(row => 
          headers.map(header => {
            const value = row[header];
            if (value === null || value === undefined) return 'NULL';
            if (typeof value === 'string') {
              // Escape quotes and wrap in quotes if contains comma or quote
              const escaped = value.replace(/"/g, '""');
              return escaped.includes(',') || escaped.includes('"') ? `"${escaped}"` : escaped;
            }
            if (typeof value === 'boolean') return value.toString();
            return value.toString();
          }).join(',')
        )
      ].join('\n');
      
      fs.writeFileSync(
        path.join(outputDir, `${tableName}_data.csv`),
        csvContent,
        'utf8'
      );
      
      // Export as INSERT statements
      const insertStatements = rows.map(row => {
        const columns = Object.keys(row);
        const values = columns.map(col => {
          const value = row[col];
          if (value === null || value === undefined) return 'NULL';
          if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
          if (typeof value === 'boolean') return value.toString();
          return value.toString();
        });
        
        return `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});`;
      });
      
      fs.writeFileSync(
        path.join(outputDir, `${tableName}_inserts.sql`),
        insertStatements.join('\n'),
        'utf8'
      );
      
      console.log(`  ✅ Exported ${tableName} (${rows.length} rows)`);
    } else {
      // Create empty files for consistency
      fs.writeFileSync(
        path.join(outputDir, `${tableName}_data.csv`),
        '',
        'utf8'
      );
      fs.writeFileSync(
        path.join(outputDir, `${tableName}_inserts.sql`),
        '',
        'utf8'
      );
      console.log(`  ✅ Exported ${tableName} (0 rows)`);
    }
    
  } catch (error) {
    console.error(`❌ Error exporting table ${tableName}:`, error.message);
  }
}

async function exportCompleteSchema(client) {
  try {
    console.log('📋 Exporting complete schema...');
    
    const result = await client.query(`
      SELECT 
        table_name,
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `);
    
    // Group by table
    const tables = {};
    result.rows.forEach(row => {
      if (!tables[row.table_name]) {
        tables[row.table_name] = [];
      }
      tables[row.table_name].push(row);
    });
    
    // Generate CREATE TABLE statements
    const schemaStatements = Object.entries(tables).map(([tableName, columns]) => {
      const columnDefs = columns.map(col => {
        let def = `${col.column_name} ${col.data_type}`;
        
        if (col.character_maximum_length) {
          def += `(${col.character_maximum_length})`;
        }
        
        if (col.is_nullable === 'NO') {
          def += ' NOT NULL';
        }
        
        if (col.column_default) {
          def += ` DEFAULT ${col.column_default}`;
        }
        
        return def;
      });
      
      return `CREATE TABLE ${tableName} (\n  ${columnDefs.join(',\n  ')}\n);`;
    });
    
    fs.writeFileSync(
      path.join(outputDir, 'schema_dump.sql'),
      schemaStatements.join('\n\n'),
      'utf8'
    );
    
    console.log('✅ Complete schema exported');
    
  } catch (error) {
    console.error('❌ Error exporting schema:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting PostgreSQL Data Dump');
  console.log('=====================================\n');
  
  let client;
  try {
    // Connect to database
    client = await connectToDatabase();
    
    // Get all tables
    const tables = await getTables(client);
    
    // Export complete schema
    await exportCompleteSchema(client);
    
    // Export data from each table
    console.log('\n📤 Exporting table data...');
    for (const tableName of tables) {
      await exportTableData(client, tableName);
    }
    
    // Create combined dump file
    console.log('\n📦 Creating combined dump file...');
    const allInserts = [];
    
    for (const tableName of tables) {
      const insertFile = path.join(outputDir, `${tableName}_inserts.sql`);
      if (fs.existsSync(insertFile)) {
        const content = fs.readFileSync(insertFile, 'utf8');
        if (content.trim()) {
          allInserts.push(`-- Data for table: ${tableName}`);
          allInserts.push(content);
        }
      }
    }
    
    fs.writeFileSync(
      path.join(outputDir, 'complete_data_dump.sql'),
      allInserts.join('\n\n'),
      'utf8'
    );
    
    console.log('\n=====================================');
    console.log('✅ DATABASE DUMP COMPLETED SUCCESSFULLY!');
    console.log('=====================================');
    console.log(`📁 All files saved to: ${outputDir}`);
    
    // List created files
    const files = fs.readdirSync(outputDir);
    console.log('\n📄 Created files:');
    files.forEach(file => {
      const filePath = path.join(outputDir, file);
      const stats = fs.statSync(filePath);
      const size = (stats.size / 1024).toFixed(2);
      console.log(`  - ${file} (${size} KB)`);
    });
    
  } catch (error) {
    console.error('\n❌ Dump failed:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the dump
main().catch(console.error);
