#!/usr/bin/env node

/**
 * Complete Supabase Data Dump Script
 * Exports all data using Supabase client
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = 'https://linnqtixdfjwbrixitrb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTI4NTIsImV4cCI6MjA4MDc4ODg1Mn0.7Mm9XtHZzWC4K4iHuPBCxIWoUJAVqqsD4ph0mwUbFrU';

// Create output directory
const outputDir = path.join(__dirname, 'database-dump');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function connectToSupabase() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Connected to Supabase');
    return supabase;
  } catch (error) {
    console.error('❌ Failed to connect to Supabase:', error.message);
    throw error;
  }
}

async function getTables(supabase) {
  try {
    // Try to get tables from information_schema
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE')
      .order('table_name');

    if (error) {
      console.log('⚠️  Cannot access information_schema, using known table list...');
      // Return common table names that might exist
      return [
        'users',
        'profiles', 
        'assets',
        'forum_posts',
        'forum_comments',
        'announcements',
        'activity_logs',
        'testimonials',
        'spin_tickets',
        'daily_spin',
        'categories',
        'tags',
        'settings',
        'admin_users',
        'badges',
        'user_badges',
        'reports',
        'notifications',
        'sessions',
        'audit_logs',
        'backup_logs'
      ];
    }

    const tables = data.map(row => row.table_name);
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

async function exportTableData(supabase, tableName) {
  try {
    console.log(`📤 Exporting table: ${tableName}`);
    
    // Get all data
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' });

    if (error) {
      console.log(`  ⚠️  Table ${tableName} not accessible: ${error.message}`);
      return;
    }

    const rows = data || [];
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
            if (typeof value === 'object') {
              return JSON.stringify(value).replace(/"/g, '""');
            }
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
          if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
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

async function exportSchema(supabase, tables) {
  try {
    console.log('📋 Exporting schema information...');
    
    const schemaInfo = {
      tables: [],
      exportDate: new Date().toISOString()
    };

    for (const tableName of tables) {
      try {
        // Try to get a sample row to understand the structure
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (!error && data && data.length > 0) {
          const columns = Object.keys(data[0]);
          const sampleRow = data[0];
          
          const columnInfo = columns.map(col => ({
            name: col,
            type: typeof sampleRow[col],
            nullable: sampleRow[col] === null,
            sample: sampleRow[col]
          }));
          
          schemaInfo.tables.push({
            name: tableName,
            columns: columnInfo
          });
        } else {
          schemaInfo.tables.push({
            name: tableName,
            columns: [],
            error: error?.message || 'No data available'
          });
        }
      } catch (err) {
        schemaInfo.tables.push({
          name: tableName,
          columns: [],
          error: err.message
        });
      }
    }
    
    fs.writeFileSync(
      path.join(outputDir, 'schema_info.json'),
      JSON.stringify(schemaInfo, null, 2),
      'utf8'
    );
    
    console.log('✅ Schema information exported');
    
  } catch (error) {
    console.error('❌ Error exporting schema:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting Supabase Data Dump');
  console.log('=====================================\n');
  
  try {
    // Connect to Supabase
    const supabase = await connectToSupabase();
    
    // Get all tables
    const tables = await getTables(supabase);
    
    // Export schema information
    await exportSchema(supabase, tables);
    
    // Export data from each table
    console.log('\n📤 Exporting table data...');
    for (const tableName of tables) {
      await exportTableData(supabase, tableName);
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
  }
}

// Run the dump
main().catch(console.error);
