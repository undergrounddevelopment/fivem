import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const DEFAULT_BANNERS = [
  {
    title: "FiveM Tools V7.0",
    image_url: "https://cdn.discordapp.com/attachments/1445794462033776721/1453797128643153920/back1.png?ex=6961df55&is=69608dd5&hm=35c5b9c0b9c4f44685edb4c45b6e2c6150ed793b5f85b7f9da02a618de13c55c",
    position: "hero",
    sort_order: 0,
    is_active: true
  },
  {
    title: "FiveM Tools V7.0", 
    image_url: "https://cdn.discordapp.com/attachments/1445794462033776721/1451657496132325537/BetterImage_1766172076669.jpeg?ex=6961ffa5&is=6960ae25&hm=53059aea7b479cc575e0086a02d2940bdd294335f55e94ecdd136d2ae0012a35",
    position: "hero",
    sort_order: 1,
    is_active: true
  },
  {
    title: "FiveM Tools V7.0",
    image_url: "https://cdn.discordapp.com/attachments/1445794462033776721/1448995490107752522/Untitled_design_21.png?ex=69618af5&is=69603975&hm=5e22b4f2afe60d29106a60956517dad7fd9a6631ddad6284c9b48f8ab46c02b8",
    position: "hero",
    sort_order: 2,
    is_active: true
  },
  {
    title: "FiveM Tools V7.0",
    image_url: "https://cdn.discordapp.com/attachments/1445794462033776721/1458484751089533041/snapedit_1767799490911.png?ex=6961c985&is=69607805&hm=bcc61523b7a9370868c16c55d6979384ef24dd5e68b879c10e6eaccda751ad96",
    position: "hero",
    sort_order: 3,
    is_active: true
  }
]

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Check if user is admin
    const { data: user } = await supabase
      .from("users")
      .select("role")
      .eq("discord_id", (session.user as any).discord_id || session.user.id)
      .single()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Insert banners
    for (const banner of DEFAULT_BANNERS) {
        await supabase.from("banners").insert(banner)
    }

    return NextResponse.json({ success: true, message: "Defaults seeded" })
  } catch (error) {
    console.error("Error seeding banners:", error)
    return NextResponse.json({ error: "Failed to seed banners" }, { status: 500 })
  }
}
