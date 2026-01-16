
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { quantity } = await req.json()
  const qty = parseInt(quantity)
  if (!qty || qty < 1) return NextResponse.json({ error: "Invalid quantity" }, { status: 400 })

  // 1. Fetch Settings for Price
  const { data: settingsData } = await supabase.from("spin_settings").select("*")
  const settings = settingsData?.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {}) || {}
  const pricePerTicket = settings.ticket_price_coins ? parseInt(settings.ticket_price_coins) : 500 // Default 500 coins

  const totalCost = pricePerTicket * qty

  try {
      // 3. Perform Transaction via Atomic RPC
      // This prevents race conditions (anti-bypass)
      const { data: result, error: rpcError } = await supabase.rpc('purchase_tickets', {
          p_discord_id: session.user.id,
          p_quantity: qty,
          p_price_per_ticket: pricePerTicket
      })

      if (rpcError) {
          console.error("RPC Error:", rpcError)
          throw new Error("Transaction verification failed")
      }

      // Check the logical result from the function
      if (!result.success) {
           return NextResponse.json({ error: result.error }, { status: 403 })
      }

      return NextResponse.json({ 
          success: true, 
          newTickets: result.new_tickets,
          newCoins: result.new_coins, 
          message: `Purchased ${qty} tickets for ${totalCost} coins` 
      })

  } catch (error) {
      console.error(error)
      return NextResponse.json({ error: "Transaction failed" }, { status: 500 })
  }
}
