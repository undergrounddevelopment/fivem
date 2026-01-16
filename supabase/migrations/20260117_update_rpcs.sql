-- Update RPCs to use spin_wheel_tickets table instead of users.tickets

-- 1. Updated purchase_tickets
CREATE OR REPLACE FUNCTION purchase_tickets(
    p_discord_id TEXT,
    p_quantity INT,
    p_price_per_ticket INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_current_coins BIGINT;
    v_total_cost BIGINT;
    v_new_coins BIGINT;
    v_current_tickets INT;
BEGIN
    -- 1. Get User ID and lock User for coins
    SELECT id, coins INTO v_user_id, v_current_coins
    FROM users
    WHERE discord_id = p_discord_id
    FOR UPDATE;

    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found');
    END IF;

    -- 2. Validate Funds
    v_total_cost := p_price_per_ticket * p_quantity;
    
    IF v_current_coins < v_total_cost THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient coins');
    END IF;

    -- 3. Lock/Get Tickets from standalone table
    INSERT INTO spin_wheel_tickets (user_id, tickets)
    VALUES (v_user_id, 0)
    ON CONFLICT (user_id) DO NOTHING;

    SELECT tickets INTO v_current_tickets
    FROM spin_wheel_tickets
    WHERE user_id = v_user_id
    FOR UPDATE;

    -- 4. Perform Updates
    UPDATE users SET coins = v_current_coins - v_total_cost WHERE id = v_user_id;
    
    UPDATE spin_wheel_tickets 
    SET tickets = COALESCE(v_current_tickets, 0) + p_quantity 
    WHERE user_id = v_user_id
    RETURNING tickets INTO v_current_tickets;

    RETURN jsonb_build_object(
        'success', true,
        'new_coins', v_current_coins - v_total_cost,
        'new_tickets', v_current_tickets
    );
END;
$$;

-- 2. Updated deduct_ticket_for_spin
CREATE OR REPLACE FUNCTION deduct_ticket_for_spin(
    p_discord_id TEXT,
    p_cost INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_current_tickets INT;
BEGIN
    -- 1. Get User ID
    SELECT id INTO v_user_id FROM users WHERE discord_id = p_discord_id;

    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found');
    END IF;

    -- 2. Lock Ticket Row
    SELECT tickets INTO v_current_tickets
    FROM spin_wheel_tickets
    WHERE user_id = v_user_id
    FOR UPDATE;

    IF v_current_tickets IS NULL OR v_current_tickets < p_cost THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient tickets');
    END IF;

    -- 3. Deduct
    UPDATE spin_wheel_tickets
    SET tickets = v_current_tickets - p_cost
    WHERE user_id = v_user_id;

    RETURN jsonb_build_object('success', true, 'remaining_tickets', v_current_tickets - p_cost);
END;
$$;
