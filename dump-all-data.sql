-- Complete SQL Data Dump Script
-- This script will export all data from all tables in the database

-- Set up environment
\c postgres

-- Show all tables first
\dt

-- Export data from each table
-- Note: This will generate INSERT statements for all data

-- Users table (if exists)
\copy (SELECT * FROM users ORDER BY id) TO 'users_data.csv' WITH CSV HEADER;

-- Profiles table (if exists)
\copy (SELECT * FROM profiles ORDER BY id) TO 'profiles_data.csv' WITH CSV HEADER;

-- Assets table (if exists)
\copy (SELECT * FROM assets ORDER BY id) TO 'assets_data.csv' WITH CSV HEADER;

-- Forum posts table (if exists)
\copy (SELECT * FROM forum_posts ORDER BY id) TO 'forum_posts_data.csv' WITH CSV HEADER;

-- Forum comments table (if exists)
\copy (SELECT * FROM forum_comments ORDER BY id) TO 'forum_comments_data.csv' WITH CSV HEADER;

-- Announcements table (if exists)
\copy (SELECT * FROM announcements ORDER BY id) TO 'announcements_data.csv' WITH CSV HEADER;

-- Activity logs table (if exists)
\copy (SELECT * FROM activity_logs ORDER BY id) TO 'activity_logs_data.csv' WITH CSV HEADER;

-- Testimonials table (if exists)
\copy (SELECT * FROM testimonials ORDER BY id) TO 'testimonials_data.csv' WITH CSV HEADER;

-- Spin tickets table (if exists)
\copy (SELECT * FROM spin_tickets ORDER BY id) TO 'spin_tickets_data.csv' WITH CSV HEADER;

-- Daily spin table (if exists)
\copy (SELECT * FROM daily_spin ORDER BY id) TO 'daily_spin_data.csv' WITH CSV HEADER;

-- Categories table (if exists)
\copy (SELECT * FROM categories ORDER BY id) TO 'categories_data.csv' WITH CSV HEADER;

-- Tags table (if exists)
\copy (SELECT * FROM tags ORDER BY id) TO 'tags_data.csv' WITH CSV HEADER;

-- Settings table (if exists)
\copy (SELECT * FROM settings ORDER BY id) TO 'settings_data.csv' WITH CSV HEADER;

-- Admin users table (if exists)
\copy (SELECT * FROM admin_users ORDER BY id) TO 'admin_users_data.csv' WITH CSV HEADER;

-- Badges table (if exists)
\copy (SELECT * FROM badges ORDER BY id) TO 'badges_data.csv' WITH CSV HEADER;

-- User badges table (if exists)
\copy (SELECT * FROM user_badges ORDER BY id) TO 'user_badges_data.csv' WITH CSV HEADER;

-- Reports table (if exists)
\copy (SELECT * FROM reports ORDER BY id) TO 'reports_data.csv' WITH CSV HEADER;

-- Notifications table (if exists)
\copy (SELECT * FROM notifications ORDER BY id) TO 'notifications_data.csv' WITH CSV HEADER;

-- Sessions table (if exists)
\copy (SELECT * FROM sessions ORDER BY id) TO 'sessions_data.csv' WITH CSV HEADER;

-- Audit logs table (if exists)
\copy (SELECT * FROM audit_logs ORDER BY id) TO 'audit_logs_data.csv' WITH CSV HEADER;

-- Backup logs table (if exists)
\copy (SELECT * FROM backup_logs ORDER BY id) TO 'backup_logs_data.csv' WITH CSV HEADER;

-- Generate complete SQL dump with INSERT statements
-- This creates a single SQL file with all data
\copy (
    SELECT 
        'INSERT INTO users (' || 
        array_to_string(array_agg(column_name), ', ') || 
        ') VALUES (' || 
        array_to_string(array_agg(
            CASE 
                WHEN data_type = 'character varying' OR data_type = 'text' OR data_type = 'date' OR data_type = 'timestamp' 
                THEN '''' || COALESCE(column_value::text, 'NULL') || ''''
                WHEN data_type = 'boolean' THEN COALESCE(column_value::text, 'false')
                ELSE COALESCE(column_value::text, 'NULL')
            END
        ), ', ') || ');' as sql_statement
    FROM (
        SELECT * FROM users ORDER BY id
    ) t
) TO 'users_inserts.sql' WITH CSV;

-- Show completion message
SELECT 'Data dump completed. Check CSV files for all table data.' as status;
