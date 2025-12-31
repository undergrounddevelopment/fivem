CREATE OR REPLACE FUNCTION handle_daily_claim(p_user_id TEXT)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  today_start TIMESTAMPTZ := date_trunc('day', now() at time zone 'utc');
  yesterday_start TIMESTAMPTZ := today_start - interval '1 day';
  tomorrow_start TIMESTAMPTZ := today_start + interval '1 day';
  last_claim RECORD;
  new_streak INT := 1;
  bonus_tickets INT := 1;
  new_tickets_count INT;
BEGIN
  -- Lock the user's record to prevent concurrent claims
  PERFORM * FROM users WHERE discord_id = p_user_id FOR UPDATE;

  -- Check if already claimed today
  IF EXISTS (
    SELECT 1 FROM daily_claims
    WHERE user_id = p_user_id
      AND claim_type = 'spin_ticket'
      AND claimed_at >= today_start
  ) THEN
    RETURN json_build_object('error', 'Already claimed today', 'success', false);
  END IF;

  -- Get yesterday's claim for streak calculation
  SELECT streak INTO last_claim FROM daily_claims
  WHERE user_id = p_user_id
    AND claim_type = 'spin_ticket'
    AND claimed_at >= yesterday_start AND claimed_at < today_start
  ORDER BY claimed_at DESC
  LIMIT 1;

  -- Calculate new streak
  IF FOUND THEN
    new_streak := last_claim.streak + 1;
  END IF;

  -- Calculate bonus tickets based on streak
  IF new_streak >= 7 THEN
    bonus_tickets := 3;
  ELSIF new_streak >= 3 THEN
    bonus_tickets := 2;
  END IF;

  -- Add tickets to spin_wheel_tickets table
  FOR i IN 1..bonus_tickets LOOP
    INSERT INTO spin_wheel_tickets (user_id, ticket_type, expires_at)
    VALUES (p_user_id, 'daily', tomorrow_start);
  END LOOP;

  -- Record the claim
  INSERT INTO daily_claims (user_id, claim_type, streak)
  VALUES (p_user_id, 'spin_ticket', new_streak);

  -- Get updated ticket count
  SELECT count(*) INTO new_tickets_count FROM spin_wheel_tickets
  WHERE user_id = p_user_id AND is_used = false AND (expires_at IS NULL OR expires_at > now());

  RETURN json_build_object(
    'success', true,
    'newTickets', new_tickets_count,
    'newStreak', new_streak,
    'bonusTickets', bonus_tickets
  );
END;
$$;
