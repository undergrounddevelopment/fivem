import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const asset = await db.assets.getById(id)

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    // Increment views
    await db.assets.incrementViews(id)

    return NextResponse.json({ asset })
  } catch (error) {
    console.error("Asset fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
