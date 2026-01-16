-- Final Realtime & Security Cleanup

-- 1. Add missing tables to Realtime Publication
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.public_notifications;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Skipping public_notifications - already in publication or does not exist';
        END;

        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.coin_transactions;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Skipping coin_transactions - already in publication or does not exist';
        END;
    END IF;
END $$;

-- 2. Basic RLS for messages (Standard Security)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages" ON public.messages
    FOR SELECT USING (
        auth.uid()::text = sender_id OR auth.uid()::text = receiver_id
        OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND (discord_id = sender_id OR discord_id = receiver_id)
        )
    );

CREATE POLICY "Users can insert their own messages" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid()::text = sender_id
        OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND discord_id = sender_id
        )
    );
