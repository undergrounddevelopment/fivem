# Database Dump Summary

## Export Information
- **Export Date**: 2025-12-31T18:17:12.348Z
- **Database**: Supabase PostgreSQL (linnqtixdfjwbrixitrb.supabase.co)
- **Total Tables Found**: 20 tables attempted
- **Successful Exports**: 4 tables with data

## Tables Successfully Exported

### 1. users (609 rows)
**Size**: 193.78 KB (CSV) / 357.63 KB (SQL)
**Columns**: 22 columns including:
- id, discord_id, username, email
- avatar, membership, coins, reputation
- downloads, points, is_banned, is_admin
- created_at, updated_at, last_seen
- spin_tickets, role, is_active, xp, level, bio

**Sample Data**:
- Admin user with 999,999 coins
- 608 regular users with various coin amounts (100-420)
- All users have Discord integration

### 2. assets (33 rows)
**Size**: 50.48 KB (CSV) / 64.26 KB (SQL)
**Columns**: 28 columns including:
- id, title, description, category, framework
- version, coin_price, thumbnail, download_link
- downloads, tags, status, is_verified
- virus_scan_status, author_id, rating
- Various metadata fields (features, installation, changelog)

**Sample Data**:
- FiveM scripts and resources
- Categories: scripts, frameworks (qbcore, esx)
- Download counts ranging from 0-51
- External download links (Google Drive)

### 3. announcements (1 row)
**Size**: 0.30 KB (CSV) / 0.37 KB (SQL)
**Columns**: 9 columns including:
- id, title, message, type
- is_active, is_dismissible, sort_order
- created_at, updated_at

**Sample Data**:
- Welcome announcement with promotional content
- Active and dismissible

### 4. notifications (824 rows)
**Size**: 174.83 KB (CSV) / 271.28 KB (SQL)
**Columns**: 8 columns including:
- id, user_id, type, title, message
- link, is_read, created_at

**Sample Data**:
- Download notifications for users
- Various notification types (download, system, etc.)

## Tables Not Found/Empty

### Empty Tables (0 rows):
- forum_posts
- testimonials  
- reports

### Tables Not Accessible:
- profiles
- forum_comments
- activity_logs
- spin_tickets
- daily_spin
- categories
- tags
- settings
- admin_users
- badges
- user_badges
- sessions
- audit_logs
- backup_logs

## Complete Dump Files

### Main Files:
- **complete_data_dump.sql** (693.66 KB) - All INSERT statements combined
- **schema_info.json** (12.94 KB) - Complete schema information

### Individual Table Files:
- **users_data.csv** + **users_inserts.sql**
- **assets_data.csv** + **assets_inserts.sql**
- **announcements_data.csv** + **announcements_inserts.sql**
- **notifications_data.csv** + **notifications_inserts.sql**
- Empty files for non-existent tables

## Database Statistics

### Total Records Exported:
- Users: 609
- Assets: 33
- Announcements: 1
- Notifications: 824
- **Total**: 1,467 records

### Data Types:
- User accounts with Discord OAuth integration
- FiveM assets/scripts with metadata
- System notifications
- Admin announcements

## Export Quality

✅ **Successfully Exported**:
- All accessible tables with complete data
- Both CSV and SQL INSERT formats
- Proper schema information
- All data types handled correctly

⚠️ **Limitations**:
- Some tables not accessible via Supabase client
- Empty tables created placeholder files
- Schema information limited to accessible tables

## Usage Instructions

### To Restore Data:
1. Use `complete_data_dump.sql` for full restoration
2. Or use individual table files for selective restoration
3. CSV files can be imported into spreadsheet applications

### To Analyze Data:
1. Check `schema_info.json` for structure
2. Use CSV files for data analysis
3. SQL files contain proper INSERT statements

## Security Notes
- All sensitive data (passwords, tokens) properly handled
- Discord IDs and user information included as stored
- Admin credentials and settings exported as available
