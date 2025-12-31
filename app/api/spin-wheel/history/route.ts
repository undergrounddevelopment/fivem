import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ history: [] })
    }

    const supabase = createAdminClient()

    // Menggunakan nama tabel yang benar sesuai dengan skema database
    const { data: history, error } = await supabase
      .from("spin_wheel_history")
      .select("id, prize_name, prize_type, prize_value as coins_won, created_at")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) {
      console.error("Error fetching spin history:", error)
      
      // Capture error ke Sentry
      import('@sentry/nextjs').then(Sentry => {
        Sentry.captureException(error, {
          contexts: {
            spinWheel: {
              userId: session.user.id,
              action: 'fetchHistory'
            }
          }
        });
      });
      
      throw error
    }

    return NextResponse.json({ history: history || [] })
  } catch (error) {
    console.error("Error fetching history:", error)
    
    // Capture error ke Sentry
    import('@sentry/nextjs').then(Sentry => {
      Sentry.captureException(error, {
        contexts: {
          spinWheel: {
            action: 'getHistory'
          }
        }
      });
    });
    
    return NextResponse.json({ history: [] })
  }
}