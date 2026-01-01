@echo off
echo Starting complete PostgreSQL data dump...
echo.

REM Set connection parameters
set PGHOST=aws-1-us-east-1.pooler.supabase.com
set PGPORT=6543
set PGUSER=postgres.linnqtixdfjwbrixitrb
set PGPASSWORD=cba3nFp4y4pEemqa
set PGDATABASE=postgres

echo Connecting to database: %PGHOST%:%PGPORT%/%PGDATABASE%
echo.

REM Create output directory
if not exist "database-dump" mkdir database-dump
cd database-dump

echo Step 1: Getting table structure...
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -c "\dt" > tables_list.txt

echo Step 2: Dumping all table data...
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -c "
COPY (
    SELECT 'CREATE TABLE ' || table_name || ' (' || 
    array_to_string(
        array_agg(
            column_name || ' ' || data_type || 
            CASE 
                WHEN character_maximum_length IS NOT NULL THEN '(' || character_maximum_length || ')'
                WHEN data_type = 'numeric' AND (numeric_precision IS NOT NULL OR numeric_scale IS NOT NULL) 
                    THEN '(' || COALESCE(numeric_precision::text, '') || 
                         CASE WHEN numeric_scale IS NOT NULL THEN ',' || numeric_scale ELSE '' END || ')'
                ELSE ''
            END || 
            CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END
        ), 
        E',\n    '
    ) || ');'
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    GROUP BY table_name
    ORDER BY table_name
) TO 'schema_dump.sql' WITH CSV;
"

echo Step 3: Exporting data from all tables...
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -c "
DO \$\$
DECLARE
    table_rec RECORD;
    query TEXT;
BEGIN
    FOR table_rec IN 
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name
    LOOP
        query := 'COPY (SELECT * FROM ' || table_rec.table_name || ' ORDER BY id) TO ''' || 
                 table_rec.table_name || '_data.csv'' WITH CSV HEADER';
        EXECUTE query;
        RAISE NOTICE 'Exported data from table: %', table_rec.table_name;
    END LOOP;
END \$\$;
"

echo Step 4: Creating complete SQL dump with INSERT statements...
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE -c "
DO \$\$
DECLARE
    table_rec RECORD;
    query TEXT;
BEGIN
    FOR table_rec IN 
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name
    LOOP
        query := 'COPY (SELECT ''INSERT INTO ' || table_rec.table_name || ' ('' || 
                 array_to_string(array_agg(column_name), '', '') || '') VALUES ('' || 
                 array_to_string(array_agg(
                     CASE 
                         WHEN data_type = ''character varying'' OR data_type = ''text'' OR data_type = ''date'' OR data_type = ''timestamp'' 
                         THEN '''''''' || COALESCE(column_value::text, ''NULL'') || ''''''''
                         WHEN data_type = ''boolean'' THEN COALESCE(column_value::text, ''false'')
                         ELSE COALESCE(column_value::text, ''NULL'')
                     END
                 ), '', '') || '');'' as insert_statement FROM (SELECT * FROM ' || table_rec.table_name || ' ORDER BY id) t) TO ''' || 
                 table_rec.table_name || '_inserts.sql'' WITH CSV';
        EXECUTE query;
        RAISE NOTICE 'Created INSERT statements for table: %', table_rec.table_name;
    END LOOP;
END \$\$;
"

echo Step 5: Creating complete backup file...
pg_dump -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% --data-only --no-owner --no-privileges > complete_data_dump.sql

echo.
echo ========================================
echo DUMP COMPLETED SUCCESSFULLY!
echo ========================================
echo All data has been exported to the database-dump folder:
echo - Schema: schema_dump.sql
echo - Complete data: complete_data_dump.sql
echo - Individual table data: *_data.csv files
echo - INSERT statements: *_inserts.sql files
echo.
echo Check the files for your complete database backup.
echo.

pause
