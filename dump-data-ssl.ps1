# PowerShell script to dump all PostgreSQL data with SSL
$env:PGPASSWORD = "cba3nFp4y4pEemqa"
$env:PGSSLMODE = "require"

# Create output directory
New-Item -ItemType Directory -Force -Path "database-dump" | Out-Null
Set-Location "database-dump"

Write-Host "Connecting to PostgreSQL database with SSL..." -ForegroundColor Green

# Get all tables
Write-Host "Step 1: Getting table list..." -ForegroundColor Yellow
$tables = psql -h aws-1-us-east-1.pooler.supabase.com -p 6543 -U postgres.linnqtixdfjwbrixitrb -d postgres -c "\dt" -t | Out-String
$tables | Out-File "tables_list.txt"

# Get schema
Write-Host "Step 2: Getting database schema..." -ForegroundColor Yellow
$schema = psql -h aws-1-us-east-1.pooler.supabase.com -p 6543 -U postgres.linnqtixdfjwbrixitrb -d postgres -c "
SELECT 
    'CREATE TABLE ' || table_name || ' (' || 
    STRING_AGG(
        column_name || ' ' || data_type || 
        CASE 
            WHEN character_maximum_length IS NOT NULL THEN '(' || character_maximum_length || ')'
            WHEN data_type = 'numeric' AND (numeric_precision IS NOT NULL OR numeric_scale IS NOT NULL) 
                THEN '(' || COALESCE(numeric_precision::text, '') || 
                     CASE WHEN numeric_scale IS NOT NULL THEN ',' || numeric_scale ELSE '' END || ')'
            ELSE ''
        END || 
        CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END,
        E',\n    '
    ) || ');'
FROM information_schema.columns 
WHERE table_schema = 'public'
GROUP BY table_name
ORDER BY table_name;
" -t
$schema | Out-File "schema_dump.sql"

# Get all table names
$tableNames = psql -h aws-1-us-east-1.pooler.supabase.com -p 6543 -U postgres.linnqtixdfjwbrixitrb -d postgres -c "
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
" -t

# Split table names and process each
$tableNameArray = $tableNames -split "`n" | Where-Object { $_.Trim() -ne "" }

Write-Host "Step 3: Exporting data from all tables..." -ForegroundColor Yellow
foreach ($tableName in $tableNameArray) {
    $tableName = $tableName.Trim()
    if ($tableName -ne "") {
        Write-Host "Exporting table: $tableName" -ForegroundColor Cyan
        
        # Export CSV data
        $csvQuery = "COPY (SELECT * FROM $tableName ORDER BY id) TO '$tableName`_data.csv' WITH CSV HEADER;"
        psql -h aws-1-us-east-1.pooler.supabase.com -p 6543 -U postgres.linnqtixdfjwbrixitrb -d postgres -c $csvQuery
        
        # Export INSERT statements
        $insertQuery = "
COPY (
    SELECT 'INSERT INTO $tableName (' || 
    array_to_string(array_agg(column_name), ', ') || 
    ') VALUES (' || 
    array_to_string(array_agg(
        CASE 
            WHEN data_type = 'character varying' OR data_type = 'text' OR data_type = 'date' OR data_type = 'timestamp' 
            THEN '''' || COALESCE(REPLACE(column_value::text, '''', '''''''), 'NULL') || ''''
            WHEN data_type = 'boolean' THEN COALESCE(column_value::text, 'false')
            ELSE COALESCE(column_value::text, 'NULL')
        END
    ), ', ') || ');'
    FROM (
        SELECT * FROM $tableName ORDER BY id
    ) t
) TO '$tableName`_inserts.sql' WITH CSV;
"
        psql -h aws-1-us-east-1.pooler.supabase.com -p 6543 -U postgres.linnqtixdfjwbrixitrb -d postgres -c $insertQuery
    }
}

# Complete dump
Write-Host "Step 4: Creating complete database dump..." -ForegroundColor Yellow
pg_dump -h aws-1-us-east-1.pooler.supabase.com -p 6543 -U postgres.linnqtixdfjwbrixitrb -d postgres --data-only --no-owner --no-privileges --verbose | Out-File "complete_data_dump.sql"

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "DATABASE DUMP COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "All files saved in: database-dump folder" -ForegroundColor White
Write-Host "Files created:" -ForegroundColor White
Write-Host "- schema_dump.sql (table structures)" -ForegroundColor Gray
Write-Host "- complete_data_dump.sql (all data)" -ForegroundColor Gray
Write-Host "- *_data.csv files (CSV format)" -ForegroundColor Gray
Write-Host "- *_inserts.sql files (INSERT statements)" -ForegroundColor Gray

# List all created files
Write-Host "`nCreated files:" -ForegroundColor Yellow
Get-ChildItem | ForEach-Object { Write-Host "- $($_.Name)" -ForegroundColor Gray }

Set-Location ..
Write-Host "`nDump process completed. Check the database-dump folder for all data." -ForegroundColor Green
