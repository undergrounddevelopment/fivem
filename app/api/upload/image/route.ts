import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@supabase/supabase-js"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

// Initialize Supabase client - Direct to Supabase Storage 100%
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  if (!url || !key) return null

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type - images only
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only images allowed (JPEG, PNG, GIF, WebP)" }, { status: 400 })
    }

    // Validate file size (10MB max for images)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 10MB for images." }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const safeUserId = session.user.id.replace(/[^a-zA-Z0-9]/g, "")
    const filename = `${safeUserId}-${timestamp}-${randomStr}.${ext}`
    
    // 1. Try Supabase Storage First
    const supabase = getSupabase()
    
    if (supabase) {
        try {
            console.log("[Image Upload] Attempting Supabase Storage...")
            const filepath = `images/${filename}`
            const buffer = await file.arrayBuffer()
            
            const { data, error } = await supabase.storage
              .from("uploads")
              .upload(filepath, buffer, {
                contentType: file.type,
                upsert: true,
                cacheControl: "3600"
              })
        
            if (!error) {
                 const { data: { publicUrl } } = supabase.storage
                  .from("uploads")
                  .getPublicUrl(filepath)
                  
                 console.log("[Image Upload] Supabase Success:", publicUrl)
                 return NextResponse.json({ 
                   url: publicUrl,
                   filename: file.name,
                   size: file.size
                 })
            }
            console.warn("[Image Upload] Supabase Failed, falling back to local:", error.message)
        } catch (supaError) {
            console.warn("[Image Upload] Supabase Error, falling back to local:", supaError)
        }
    }

    // 2. Fallback to Local Filesystem (public/uploads)
    console.log("[Image Upload] Using Local Filesystem")
    const buffer = Buffer.from(await file.arrayBuffer())
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    
    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true })
    
    await writeFile(path.join(uploadDir, filename), buffer)
    
    const publicUrl = `/uploads/${filename}`
    console.log("[Image Upload] Local Success:", publicUrl)

    return NextResponse.json({ 
      url: publicUrl,
      filename: file.name,
      size: file.size,
      storage: "local"
    })

  } catch (error: any) {
    console.error("[Image Upload] Error:", error)
    return NextResponse.json({ error: "Upload failed: " + (error.message || "Unknown error") }, { status: 500 })
  }
}
