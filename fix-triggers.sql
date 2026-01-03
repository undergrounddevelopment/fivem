-- Fix: Handle existing triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_assets_updated_at ON assets;
DROP TRIGGER IF EXISTS update_forum_categories_updated_at ON forum_categories;
DROP TRIGGER IF EXISTS update_forum_threads_updated_at ON forum_threads;
DROP TRIGGER IF EXISTS update_forum_replies_updated_at ON forum_replies;
DROP TRIGGER IF EXISTS update_announcements_updated_at ON announcements;
DROP TRIGGER IF EXISTS update_spin_wheel_tickets_updated_at ON spin_wheel_tickets;

-- Recreate triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_categories_updated_at BEFORE UPDATE ON forum_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_threads_updated_at BEFORE UPDATE ON forum_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_replies_updated_at BEFORE UPDATE ON forum_replies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_spin_wheel_tickets_updated_at BEFORE UPDATE ON spin_wheel_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();