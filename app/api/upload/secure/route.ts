import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()

    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string || "general"
    const requireAdmin = formData.get("requireAdmin") === "true"

    if (requireAdmin) {
      const { data: user } = await supabase
        .from("users")
        .select("is_admin")
        .eq("discord_id", session.user.id)
        .single()

      if (!user?.is_admin) {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 })
      }
    }

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 })
    }

    const fileExt = file.name.split(".").pop()
    const fileName = `${type}/${session.user.id}/${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage
      .from("uploads")
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from("uploads")
      .getPublicUrl(data.path)

    return NextResponse.json({ url: publicUrl, path: data.path })
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 })
  }
}
