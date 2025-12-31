import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

async function verifyAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 }
  }

  const supabase = await createAdminClient()
  const { data: userData } = await supabase
    .from("users")
    .select("discord_id, is_admin, membership")
    .eq("discord_id", session.user.id)
    .single()

  const isAdmin = userData?.is_admin === true || userData?.membership === "admin"
  if (!isAdmin) {
    return { error: "Forbidden", status: 403 }
  }

  return { session, supabase, userData }
}

export async function GET() {
  try {
    console.log('[API] GET /api/admin/spin-wheel/prizes called')
    const auth = await verifyAdmin()
    if ("error" in auth) {
      console.log('[API] Auth failed:', auth.error)
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { data: prizes, error } = await auth.supabase.from("spin_wheel_prizes").select("*").order("sort_order")

    if (error) {
      console.error('[API] Database error:', error)
      
      // Capture error ke Sentry
      import('@sentry/nextjs').then(Sentry => {
        Sentry.captureException(error, {
          contexts: {
            spinWheel: {
              action: 'fetchPrizes'
            }
          }
        });
      });
      
      throw error
    }

    console.log('[API] Prizes found:', prizes?.length || 0)
    return NextResponse.json({ prizes: prizes || [] })
  } catch (error) {
    console.error("Error fetching prizes:", error)
    
    // Capture error ke Sentry
    import('@sentry/nextjs').then(Sentry => {
      Sentry.captureException(error, {
        contexts: {
          spinWheel: {
            action: 'fetchPrizes'
          }
        }
      });
    });
    
    return NextResponse.json({ error: "Failed to fetch prizes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyAdmin()
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { name, type, value, coins, color, probability, icon, is_active, sort_order } = body

    const { data, error } = await auth.supabase
      .from("spin_wheel_prizes")
      .insert({
        name,
        type: type || "coins",
        value: Number(value ?? coins) || 0,
        color: color || "#3b82f6",
        probability: Number(probability) || 10,
        icon: icon || "gift",
        is_active: is_active !== false,
        sort_order: Number(sort_order) || 0,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating prize:", error)
      
      // Capture error ke Sentry
      import('@sentry/nextjs').then(Sentry => {
        Sentry.captureException(error, {
          contexts: {
            spinWheel: {
              action: 'createPrize'
            }
          }
        });
      });
      
      throw error
    }

    return NextResponse.json({ prize: data })
  } catch (error) {
    console.error("Error creating prize:", error)
    
    // Capture error ke Sentry
    import('@sentry/nextjs').then(Sentry => {
      Sentry.captureException(error, {
        contexts: {
          spinWheel: {
            action: 'createPrize'
          }
        }
      });
    });
    
    return NextResponse.json({ error: "Failed to create prize" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await verifyAdmin()
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "Prize ID required" }, { status: 400 })
    }

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.type !== undefined) updateData.type = updates.type
    if (updates.value !== undefined) updateData.value = Number(updates.value)
    if (updates.coins !== undefined && updates.value === undefined) updateData.value = Number(updates.coins)
    if (updates.color !== undefined) updateData.color = updates.color
    if (updates.probability !== undefined) updateData.probability = Number(updates.probability)
    if (updates.icon !== undefined) updateData.icon = updates.icon
    if (updates.is_active !== undefined) updateData.is_active = updates.is_active
    if (updates.sort_order !== undefined) updateData.sort_order = Number(updates.sort_order)

    const { data, error } = await auth.supabase
      .from("spin_wheel_prizes")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating prize:", error)
      
      // Capture error ke Sentry
      import('@sentry/nextjs').then(Sentry => {
        Sentry.captureException(error, {
          contexts: {
            spinWheel: {
              action: 'updatePrize',
              prizeId: id
            }
          }
        });
      });
      
      throw error
    }

    return NextResponse.json({ prize: data })
  } catch (error) {
    console.error("Error updating prize:", error)
    
    // Capture error ke Sentry
    import('@sentry/nextjs').then(Sentry => {
      Sentry.captureException(error, {
        contexts: {
          spinWheel: {
            action: 'updatePrize'
          }
        }
      });
    });
    
    return NextResponse.json({ error: "Failed to update prize" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await verifyAdmin()
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    // Support both body and query param
    const { searchParams } = new URL(request.url)
    let id = searchParams.get("id")

    if (!id) {
      try {
        const body = await request.json()
        id = body.id
      } catch {
        // No body provided
      }
    }

    if (!id) {
      return NextResponse.json({ error: "Prize ID required" }, { status: 400 })
    }

    const { error } = await auth.supabase.from("spin_wheel_prizes").delete().eq("id", id)

    if (error) {
      console.error("Error deleting prize:", error)
      
      // Capture error ke Sentry
      import('@sentry/nextjs').then(Sentry => {
        Sentry.captureException(error, {
          contexts: {
            spinWheel: {
              action: 'deletePrize',
              prizeId: id
            }
          }
        });
      });
      
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting prize:", error)
    
    // Capture error ke Sentry
    import('@sentry/nextjs').then(Sentry => {
      Sentry.captureException(error, {
        contexts: {
          spinWheel: {
            action: 'deletePrize'
          }
        }
      });
    });
    
    return NextResponse.json({ error: "Failed to delete prize" }, { status: 500 })
  }
}