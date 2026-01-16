-- SECURE RPC FIX: Unify Logic to users.spin_tickets
-- Previously RPCs were using spin_wheel_tickets (which might be obsolete or split-brain).
-- We enforced users.spin_tickets in the API earlier.

-- 1. purchase_tickets (Coins -> Tickets)
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
    v_current_tickets INT;
BEGIN
    -- Lock User Row
    SELECT id, coins, spin_tickets INTO v_user_id, v_current_coins, v_current_tickets
    FROM users
    WHERE discord_id = p_discord_id
    FOR UPDATE;

    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found');
    END IF;

    -- Validate Funds
    v_total_cost := p_price_per_ticket * p_quantity;
    
    IF v_current_coins < v_total_cost THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient coins');
    END IF;

    -- Update Everything in users table
    UPDATE users 
    SET 
        coins = v_current_coins - v_total_cost,
        spin_tickets = COALESCE(v_current_tickets, 0) + p_quantity
    WHERE id = v_user_id;

    RETURN jsonb_build_object(
        'success', true,
        'new_coins', v_current_coins - v_total_cost,
        'new_tickets', COALESCE(v_current_tickets, 0) + p_quantity
    );
END;
$$;

-- 2. deduct_ticket_for_spin (Usage)
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
    SELECT id, spin_tickets INTO v_user_id, v_current_tickets
    FROM users 
    WHERE discord_id = p_discord_id
    FOR UPDATE;

    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found');
    END IF;

    IF COALESCE(v_current_tickets, 0) < p_cost THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient tickets');
    END IF;

    -- Deduct
    UPDATE users
    SET spin_tickets = v_current_tickets - p_cost
    WHERE id = v_user_id;

    RETURN jsonb_build_object('success', true, 'remaining_tickets', v_current_tickets - p_cost);
END;
$$;
