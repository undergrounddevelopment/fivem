-- Secure RPC for Purchasing Tickets (Atomic Transaction)
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
    v_new_tickets INT;
BEGIN
    -- 1. Get User ID and lock the row for update
    SELECT id, coins, tickets INTO v_user_id, v_current_coins, v_new_tickets
    FROM users
    WHERE discord_id = p_discord_id
    FOR UPDATE; -- Critical: Locks row to prevent race conditions

    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found');
    END IF;

    -- 2. Validate Funds
    v_total_cost := p_price_per_ticket * p_quantity;
    
    IF v_current_coins < v_total_cost THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient coins');
    END IF;

    -- 3. Perform Update
    v_new_coins := v_current_coins - v_total_cost;
    v_new_tickets := v_new_tickets + p_quantity;

    UPDATE users
    SET coins = v_new_coins,
        tickets = v_new_tickets
    WHERE id = v_user_id;

    RETURN jsonb_build_object(
        'success', true,
        'new_coins', v_new_coins,
        'new_tickets', v_new_tickets
    );
END;
$$;

-- Secure RPC for Deducting Tickets (Atomic Check & Deduct)
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
    -- 1. Lock Row
    SELECT id, tickets INTO v_user_id, v_current_tickets
    FROM users
    WHERE discord_id = p_discord_id
    FOR UPDATE;

    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found');
    END IF;

    -- 2. Validate Balance
    IF v_current_tickets < p_cost THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient tickets');
    END IF;

    -- 3. Deduct
    UPDATE users
    SET tickets = v_current_tickets - p_cost
    WHERE id = v_user_id;

    RETURN jsonb_build_object('success', true, 'remaining_tickets', v_current_tickets - p_cost);
END;
$$;
