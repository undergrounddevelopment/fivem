import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const supabase = getSupabaseAdminClient()

    const { data: existing, error: existingError } = await supabase
      .from("assets")
      .select("id, author_id")
      .eq("id", id)
      .single()

    if (existingError || !existing) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    const isOwner = existing.author_id === session.user.id
    const isAdmin = session.user.isAdmin === true

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const category = body.category
    const framework = body.framework

    const validCategories = ["scripts", "mlo", "vehicles", "clothing"]
    if (category && !validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    const validFrameworks = ["standalone", "esx", "qbcore", "qbox"]
    if (framework && !validFrameworks.includes(framework)) {
      return NextResponse.json({ error: "Invalid framework" }, { status: 400 })
    }

    const tags = Array.isArray(body.tags) ? body.tags : undefined
    const coinPrice =
      typeof body.coin_price === "number"
        ? body.coin_price
        : typeof body.coin_price === "string" && body.coin_price.trim() !== ""
          ? Number(body.coin_price)
          : undefined

    const baseUpdate: any = {
      ...(typeof body.title === "string" ? { title: body.title } : {}),
      ...(typeof body.description === "string" ? { description: body.description } : {}),
      ...(typeof category === "string" ? { category } : {}),
      ...(typeof framework === "string" ? { framework } : {}),
      ...(typeof body.version === "string" ? { version: body.version } : {}),
      ...(typeof coinPrice === "number" && Number.isFinite(coinPrice) ? { coin_price: coinPrice } : {}),
      ...(typeof body.thumbnail === "string" ? { thumbnail: body.thumbnail } : {}),
      ...(typeof body.download_link === "string" ? { download_link: body.download_link } : {}),
      ...(typeof body.file_size === "string" ? { file_size: body.file_size } : {}),
      ...(tags ? { tags } : {}),
      updated_at: new Date().toISOString(),
    }

    const extendedUpdate: any = {
      ...baseUpdate,
      ...(typeof body.features === "string" ? { features: body.features } : {}),
      ...(typeof body.installation === "string" ? { installation: body.installation } : {}),
      ...(typeof body.changelog === "string" ? { changelog: body.changelog } : {}),
      ...(typeof body.youtube_link === "string" ? { youtube_link: body.youtube_link } : {}),
      ...(typeof body.github_link === "string" ? { github_link: body.github_link } : {}),
      ...(typeof body.docs_link === "string" ? { docs_link: body.docs_link } : {}),
    }

    const runUpdate = async (payload: any) => {
      let q = supabase.from("assets").update(payload).eq("id", id)
      if (!isAdmin) q = q.eq("author_id", session.user.id)
      return await q.select("*").single()
    }

    const first = await runUpdate(extendedUpdate)
    if (!first.error) {
      return NextResponse.json({ success: true, asset: first.data })
    }

    const shouldFallback =
      first.error.code === "PGRST204" ||
      String(first.error.message || "").toLowerCase().includes("column") ||
      String((first.error as any).details || "").toLowerCase().includes("column")

    if (!shouldFallback) {
      return NextResponse.json({ error: first.error.message || "Update failed" }, { status: 500 })
    }

    const second = await runUpdate(baseUpdate)
    if (second.error) {
      return NextResponse.json({ error: second.error.message || "Update failed" }, { status: 500 })
    }

    return NextResponse.json({ success: true, asset: second.data })
  } catch (error) {
    console.error("Asset update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
