import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0"

serve(async (req) => {
  const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"))
  const { userId } = await req.json()

  if (!userId) {
    return new Response(JSON.stringify({ error: "Missing user ID" }), { status: 400, headers: { "Content-Type": "application/json" } })
  }

  try {
    const { data, error } = await supabase.rpc("handle_daily_claim", { p_user_id: userId })

    if (error) {
      throw error
    }

    return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } })
  }
})
