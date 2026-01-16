
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { CONFIG } from "@/lib/config"

const supabaseUrl = CONFIG.supabase.url
const supabaseServiceKey = CONFIG.supabase.serviceKey

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
      .limit(10)

  let userTickets = 0
  
  // 3. Fetch User Data if logged in
  if (session?.user?.id) {
    const { data: user } = await supabase.from("users").select("id").eq("discord_id", session.user.id).single()
    if (user) {
        const { data: tktData } = await supabase
          .from("spin_wheel_tickets")
          .select("tickets")
          .eq("user_id", user.id)
          .single()
        
        if (tktData) {
            userTickets = tktData.tickets || 0
        }
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

    // 1.7 Fetch User Inner ID
    const { data: user } = await supabase.from("users").select("id, coins, spin_tickets").eq("discord_id", discordId).single()
    if (!user) return NextResponse.json({ error: "User profile not found" }, { status: 404 })

    // OPTIONAL: Check for "Eligible Free Spins" (Elite Privilege)
    const { data: eligible } = await supabase
        .from("spin_wheel_eligible_users")
        .select("*")
        .eq("user_id", user.id)
        .gt("spins_remaining", 0)
        .single()

    let finalRemainingTickets = 0
    let usedEligible = false

    if (eligible) {
        // Decrement eligible spins
        await supabase
            .from("spin_wheel_eligible_users")
            .update({ spins_remaining: eligible.spins_remaining - 1 })
            .eq("id", eligible.id)
        
        usedEligible = true
        // Fetch current tickets to return in response
        const { data: tktData } = await supabase.from("spin_wheel_tickets").select("tickets").eq("user_id", user.id).single()
        finalRemainingTickets = tktData?.tickets || 0
    } else {
        // 2. Atomic Ticket Deduction (Regular flow)
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
        finalRemainingTickets = deduction.remaining_tickets
    }

    // FETCH USER ID for History logging (Handled early now)
    // const { data: user } = await supabase.from("users").select("id, spin_tickets, coins").eq("discord_id", discordId).single()
    // Already have 'user' from above snippet (Wait, I need to ensure v_user is available)



    // 2. Fetch active prizes
    const { data: prizes, error: prizesError } = await supabase
      .from("spin_wheel_prizes")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .limit(10)

    if (prizesError || !prizes || prizes.length === 0) {
      return NextResponse.json({ error: "No active prizes configured" }, { status: 500 })
    }

    // 3. Calculate result or apply FORCE WIN
    let selectedPrize: any = null

    // Check for Force Wins (Premium/Admin control)
    const { data: forceWin } = await supabase
        .from("spin_wheel_force_wins")
        .select("*, prize:spin_wheel_prizes(*)")
        .eq("user_id", discordId)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

    if (forceWin && forceWin.prize) {
        selectedPrize = forceWin.prize
        // Update use count
        const newUseCount = (forceWin.use_count || 0) + 1
        const updates: any = { use_count: newUseCount }
        if (forceWin.max_uses && newUseCount >= forceWin.max_uses) {
            updates.is_active = false
        }
        await supabase.from("spin_wheel_force_wins").update(updates).eq("id", forceWin.id)
    } else {
        const totalWeight = prizes.reduce((sum, prize) => sum + (parseFloat(prize.probability as any) || 0), 0)
        let random = Math.random() * totalWeight

        for (const prize of prizes) {
            const prob = parseFloat(prize.probability as any) || 0
            if (random < prob) {
                selectedPrize = prize
                break
            }
            random -= prob
        }
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
       const { data: updatedTkt } = await supabase.from("spin_wheel_tickets")
         .update({ tickets: finalRemainingTickets + selectedPrize.value })
         .eq("user_id", user.id)
         .select("tickets")
         .single()
       
       if (updatedTkt) {
           finalRemainingTickets = updatedTkt.tickets
       }
    }
 
    // For items, you might want to insert into `user_items` table if it exists.
    
    // Log history
    const claimStatus = (selectedPrize.type === 'coin' || selectedPrize.type === 'coins' || selectedPrize.type === 'ticket') 
      ? 'auto_awarded' 
      : 'unclaimed';

    await supabase.from("spin_wheel_history").insert({
      user_id: user.id,
      prize_id: selectedPrize.id,
      prize_name: selectedPrize.name || (selectedPrize as any).title,
      prize_value: selectedPrize.value,
      claim_status: claimStatus
    })

    return NextResponse.json({ 
      prize: selectedPrize,
      tickets: finalRemainingTickets,
      usedEligible,
      message: `You won ${selectedPrize.name || (selectedPrize as any).title}!`
    })

  } catch (error) {
    console.error("Spin error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
