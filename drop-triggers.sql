-- Force drop existing triggers
DROP TRIGGER update_users_updated_at ON users;
DROP TRIGGER update_assets_updated_at ON assets;
DROP TRIGGER update_forum_categories_updated_at ON forum_categories;
DROP TRIGGER update_forum_threads_updated_at ON forum_threads;
DROP TRIGGER update_forum_replies_updated_at ON forum_replies;
DROP TRIGGER update_announcements_updated_at ON announcements;
DROP TRIGGER update_spin_wheel_tickets_updated_at ON spin_wheel_tickets;