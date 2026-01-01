@echo off
echo ==========================================
echo   FiveM Tools V7 - Database Setup
echo ==========================================
echo.

echo [INFO] Setting up database schema...

REM Check if .env file exists
if not exist ".env" (
    echo [ERROR] .env file not found!
    echo Please create .env file with your Supabase credentials first.
    echo.
    echo Required variables:
    echo NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
    echo SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
    echo.
    pause
    exit /b 1
)

echo [INFO] Environment file found
echo [INFO] Applying database schema...

REM Try to run the schema using Node.js
node -e "
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

async function setupDatabase() {
    try {
        console.log('[INFO] Loading Supabase client...');
        const { createClient } = require('@supabase/supabase-js');
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase credentials in .env file');
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        console.log('[INFO] Reading database schema...');
        const schemaPath = path.join(__dirname, 'database-schema-complete-v7.sql');
        
        if (!fs.existsSync(schemaPath)) {
            throw new Error('Database schema file not found: ' + schemaPath);
        }
        
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Split schema into individual statements
        const statements = schema
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        console.log('[INFO] Executing', statements.length, 'database statements...');
        
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.trim()) {
                try {
                    const { error } = await supabase.rpc('exec_sql', { sql: statement });
                    if (error) {
                        console.log('[WARNING] Statement', i + 1, 'failed:', error.message);
                        errorCount++;
                    } else {
                        successCount++;
                    }
                } catch (err) {
                    console.log('[WARNING] Statement', i + 1, 'error:', err.message);
                    errorCount++;
                }
            }
        }
        
        console.log('[SUCCESS] Database setup completed!');
        console.log('- Successful statements:', successCount);
        console.log('- Failed statements:', errorCount);
        
        // Test the connection
        console.log('[INFO] Testing database connection...');
        const { data, error } = await supabase.from('users').select('count').limit(1);
        
        if (error) {
            console.log('[WARNING] Connection test failed:', error.message);
        } else {
            console.log('[SUCCESS] Database connection test passed!');
        }
        
    } catch (error) {
        console.error('[ERROR] Database setup failed:', error.message);
        console.log('');
        console.log('Manual setup instructions:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Open SQL Editor');
        console.log('3. Copy and paste the contents of database-schema-complete-v7.sql');
        console.log('4. Run the SQL script');
        process.exit(1);
    }
}

setupDatabase();
"

if errorlevel 1 (
    echo.
    echo [ERROR] Automated setup failed. Please set up manually:
    echo.
    echo 1. Go to your Supabase dashboard
    echo 2. Open SQL Editor  
    echo 3. Copy and paste the contents of database-schema-complete-v7.sql
    echo 4. Run the SQL script
    echo.
    echo After manual setup, run: pnpm dev
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Database setup completed!
echo.
echo Next steps:
echo 1. Run: pnpm dev
echo 2. Open: http://localhost:3000
echo 3. Test the application
echo.
pause