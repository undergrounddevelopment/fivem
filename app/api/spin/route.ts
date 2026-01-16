
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  
  // 1. Fetch Global Settings
  const { data: settingsData } = await supabase.from("spin_settings").select("*")
  const settings = settingsData?.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {}) || {}
  const ticketCost = settings.ticket_cost ? parseInt(settings.ticket_cost) : 1
  const isEnabled = settings.is_enabled !== false

  const ticketPriceCoins = settings.ticket_price_coins ? parseInt(settings.ticket_price_coins) : 500

  // 2. Fetch Prizes
  const { data: prizes } = await supabase
      .from("spin_wheel_prizes")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true })

  let userTickets = 0
  
  // 3. Fetch User Data if logged in
  if (session?.user?.id) {
    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("discord_id", session.user.id)
      .single()
    
    if (userData) {
        const { data: ticketData } = await supabase
          .from("spin_wheel_tickets")
          .select("tickets")
          .eq("user_id", userData.id)
          .single()
        
        userTickets = ticketData?.tickets || 0
    }
  }

  return NextResponse.json({
      prizes: prizes || [],
      userTickets,
      config: {
          cost: ticketCost,
          isEnabled,
          ticketPriceCoins
      }
  })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Session ID is the Discord ID
  const discordId = session.user.id

  try {
    // 1. Check user tickets by Discord ID
    // (User verification moved to deduct_ticket_for_spin RPC)


    // 1.5 Fetch global settings (ticket cost)
    const { data: settingsData } = await supabase
        .from("spin_settings")
        .select("*")
    
    // Default cost is 1 if not set
    const settings = settingsData?.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {})
    const ticketCost = settings?.ticket_cost ? parseInt(settings.ticket_cost) : 1
    const isEnabled = settings?.is_enabled !== false // Default true

    if (!isEnabled) {
         return NextResponse.json({ error: "Event is currently disabled" }, { status: 403 })
    }

    // 2. Atomic Ticket Deduction (Anti-Bypass)
    const { data: deduction, error: rpcError } = await supabase.rpc('deduct_ticket_for_spin', {
        p_discord_id: discordId,
        p_cost: ticketCost
    })

    if (rpcError || !deduction.success) {
         if (deduction?.error) {
             return NextResponse.json({ error: deduction.error }, { status: 403 })
         }
         console.error("RPC Error:", rpcError)
         return NextResponse.json({ error: "Insufficient tickets or system error" }, { status: 403 })
    }

    // FETCH USER ID for History logging later (Optimization: deduction already proved user exists)
    const { data: user } = await supabase.from("users").select("id, tickets, coins").eq("discord_id", discordId).single()


    // 2. Fetch active prizes
    const { data: prizes, error: prizesError } = await supabase
      .from("spin_wheel_prizes")
      .select("*")
      .eq("is_active", true)

    if (prizesError || !prizes || prizes.length === 0) {
      return NextResponse.json({ error: "No active prizes configured" }, { status: 500 })
    }

    // 3. Calculate result based on probabilities
    const totalWeight = prizes.reduce((sum, prize) => sum + (parseFloat(prize.probability as any) || 0), 0)
    let random = Math.random() * totalWeight
    let selectedPrize: any = null

    for (const prize of prizes) {
      const prob = parseFloat(prize.probability as any) || 0
      if (random < prob) {
        selectedPrize = prize
        break
      }
      random -= prob
    }

    if (!selectedPrize) {
      selectedPrize = prizes[prizes.length - 1]
    }

    // 4. Record transaction and update user
    // Ticket already deducted by RPC

    if (!selectedPrize || !user) {
      return NextResponse.json({ error: "Failed to determine result" }, { status: 500 })
    }

    // Award prize
    if (selectedPrize.type === 'coin' || selectedPrize.type === 'coins') {
      await supabase.from("users").update({ coins: (user.coins || 0) + selectedPrize.value }).eq("id", user.id)
    } else if (selectedPrize.type === 'ticket') {
       const { data: tData } = await supabase.from("spin_wheel_tickets").select("tickets").eq("user_id", user.id).single()
       await supabase.from("spin_wheel_tickets").update({ tickets: (tData?.tickets || 0) + selectedPrize.value }).eq("user_id", user.id)
    }
 
    // For items, you might want to insert into `user_items` table if it exists.
    
    // Log history
    await supabase.from("spin_wheel_history").insert({
      user_id: user.id,
      prize_id: selectedPrize.id,
      prize_name: selectedPrize.name || (selectedPrize as any).title,
      prize_value: selectedPrize.value
    })

    return NextResponse.json({ 
      prize: selectedPrize,
      tickets: deduction.remaining_tickets,
      message: `You won ${selectedPrize.name || (selectedPrize as any).title}!`
    })

  } catch (error) {
    console.error("Spin error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
