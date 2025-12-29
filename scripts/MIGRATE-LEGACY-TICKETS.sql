-- Migrate legacy spin_tickets to spin_wheel_tickets table
-- Run this once to move all legacy tickets

-- Insert tickets for each user based on their spin_tickets count
INSERT INTO spin_wheel_tickets (user_id, ticket_type, created_at)
SELECT 
  discord_id,
  'reward',
  NOW() - (interval '1 second' * series.n)
FROM users
CROSS JOIN LATERAL generate_series(1, GREATEST(spin_tickets, 0)) AS series(n)
WHERE spin_tickets > 0;

-- Reset legacy spin_tickets to 0
UPDATE users SET spin_tickets = 0 WHERE spin_tickets > 0;

SELECT 'Legacy tickets migrated!' as status,
       COUNT(*) as tickets_created
FROM spin_wheel_tickets
WHERE ticket_type = 'reward'
AND created_at > NOW() - interval '1 minute';
