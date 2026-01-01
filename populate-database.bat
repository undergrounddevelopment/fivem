@echo off
echo ==========================================
echo   FiveM Tools V7 - Database Population
echo ==========================================
echo.

echo [INFO] Populating database with sample data...

node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function populateDatabase() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase credentials');
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        console.log('[INFO] Connected to Supabase');
        
        // 1. Insert sample users
        console.log('[INFO] Inserting sample users...');
        const { data: users, error: usersError } = await supabase
            .from('users')
            .upsert([
                {
                    discord_id: '1047719075322810378',
                    username: 'Admin',
                    email: 'admin@fivemtools.net',
                    is_admin: true,
                    membership: 'admin',
                    coins: 999999,
                    avatar: 'https://cdn.discordapp.com/avatars/1047719075322810378/avatar.png'
                },
                {
                    discord_id: '123456789012345678',
                    username: 'TestUser1',
                    email: 'user1@example.com',
                    membership: 'vip',
                    coins: 5000,
                    avatar: 'https://cdn.discordapp.com/embed/avatars/1.png'
                },
                {
                    discord_id: '987654321098765432',
                    username: 'TestUser2',
                    email: 'user2@example.com',
                    membership: 'free',
                    coins: 1000,
                    avatar: 'https://cdn.discordapp.com/embed/avatars/2.png'
                }
            ], { onConflict: 'discord_id' });
        
        if (usersError) console.log('[WARNING] Users insert:', usersError.message);
        else console.log('[SUCCESS] Users inserted:', users?.length || 0);
        
        // 2. Insert sample announcements
        console.log('[INFO] Inserting sample announcements...');
        const { data: announcements, error: announcementsError } = await supabase
            .from('announcements')
            .upsert([
                {
                    title: 'Welcome',
                    message: '🎉 Welcome to FiveM Tools V7 - Your ultimate FiveM resource platform!',
                    type: 'success',
                    is_active: true,
                    is_dismissible: true,
                    sort_order: 1
                },
                {
                    title: 'New Features',
                    message: '✨ Explore our new advanced admin dashboard and real-time features!',
                    type: 'info',
                    is_active: true,
                    is_dismissible: true,
                    sort_order: 2,
                    link: '/admin'
                },
                {
                    title: 'Discord Community',
                    message: '💬 Join our Discord community for support and updates!',
                    type: 'promo',
                    is_active: true,
                    is_dismissible: true,
                    sort_order: 3,
                    link: 'https://discord.gg/fivemtools'
                }
            ], { onConflict: 'id' });
        
        if (announcementsError) console.log('[WARNING] Announcements insert:', announcementsError.message);
        else console.log('[SUCCESS] Announcements inserted:', announcements?.length || 0);
        
        // 3. Insert sample forum categories
        console.log('[INFO] Inserting forum categories...');
        const { data: categories, error: categoriesError } = await supabase
            .from('forum_categories')
            .upsert([
                {
                    name: 'General Discussion',
                    description: 'General discussions about FiveM',
                    icon: 'MessageSquare',
                    color: '#3b82f6',
                    order_index: 1
                },
                {
                    name: 'Script Help',
                    description: 'Get help with FiveM scripts',
                    icon: 'Code',
                    color: '#10b981',
                    order_index: 2
                },
                {
                    name: 'Asset Releases',
                    description: 'Share your FiveM assets',
                    icon: 'Package',
                    color: '#f59e0b',
                    order_index: 3
                }
            ], { onConflict: 'name' });
        
        if (categoriesError) console.log('[WARNING] Categories insert:', categoriesError.message);
        else console.log('[SUCCESS] Categories inserted:', categories?.length || 0);
        
        // 4. Insert sample assets
        console.log('[INFO] Inserting sample assets...');
        const adminUser = users?.find(u => u.username === 'Admin');
        if (adminUser) {
            const { data: assets, error: assetsError } = await supabase
                .from('assets')
                .upsert([
                    {
                        title: 'Police Car Pack',
                        description: 'High quality police vehicles for your FiveM server',
                        category: 'vehicles',
                        framework: 'standalone',
                        creator_id: adminUser.id,
                        status: 'approved',
                        is_featured: true,
                        downloads: 1250,
                        rating: 4.8,
                        coin_price: 0,
                        thumbnail_url: '/placeholder.jpg'
                    },
                    {
                        title: 'Bank MLO Interior',
                        description: 'Detailed bank interior with custom props',
                        category: 'mlo',
                        framework: 'standalone',
                        creator_id: adminUser.id,
                        status: 'approved',
                        downloads: 890,
                        rating: 4.6,
                        coin_price: 500,
                        thumbnail_url: '/placeholder.jpg'
                    },
                    {
                        title: 'Advanced Banking Script',
                        description: 'Complete banking system with ATMs and transactions',
                        category: 'scripts',
                        framework: 'qbcore',
                        creator_id: adminUser.id,
                        status: 'approved',
                        downloads: 2100,
                        rating: 4.9,
                        coin_price: 1000,
                        thumbnail_url: '/placeholder.jpg'
                    }
                ], { onConflict: 'title' });
            
            if (assetsError) console.log('[WARNING] Assets insert:', assetsError.message);
            else console.log('[SUCCESS] Assets inserted:', assets?.length || 0);
        }
        
        // 5. Verify data
        console.log('[INFO] Verifying inserted data...');
        const verification = await Promise.all([
            supabase.from('users').select('count', { count: 'exact' }),
            supabase.from('announcements').select('count', { count: 'exact' }),
            supabase.from('forum_categories').select('count', { count: 'exact' }),
            supabase.from('assets').select('count', { count: 'exact' })
        ]);
        
        console.log('[SUCCESS] Database populated successfully!');
        console.log('- Users:', verification[0].count || 0);
        console.log('- Announcements:', verification[1].count || 0);
        console.log('- Categories:', verification[2].count || 0);
        console.log('- Assets:', verification[3].count || 0);
        
    } catch (error) {
        console.error('[ERROR] Population failed:', error.message);
        process.exit(1);
    }
}

populateDatabase();
"

if errorlevel 1 (
    echo [ERROR] Database population failed
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Database populated with sample data!
echo.
echo You can now:
echo 1. Run: pnpm dev
echo 2. Check: http://localhost:3000/api/database/check
echo 3. View: http://localhost:3000
echo.
pause