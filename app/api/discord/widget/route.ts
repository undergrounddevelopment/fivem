import { NextRequest, NextResponse } from "next/server"

const DEFAULT_GUILD_ID = "1445784240750067830"

function isValidGuildId(value: string) {
  return /^\d{5,25}$/.test(value)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const guildId = searchParams.get("guildId") || DEFAULT_GUILD_ID

    if (!isValidGuildId(guildId)) {
      return NextResponse.json({ error: "Invalid guildId" }, { status: 400 })
    }

    const url = `https://discordapp.com/api/guilds/${guildId}/widget.json`

    const res = await fetch(url, {
      next: { revalidate: 60 },
      headers: {
        Accept: "application/json",
      },
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch Discord widget" },
        { status: res.status },
      )
    }

    const data = await res.json()

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Discord widget API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
