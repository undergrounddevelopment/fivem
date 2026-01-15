import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client - Direct to Supabase Storage 100%
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "uploads"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type - Support more file types for assets
    const allowedImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg"]
    const allowedArchiveTypes = [
      "application/zip",
      "application/x-zip-compressed", 
      "application/x-rar-compressed",
      "application/x-7z-compressed",
      "application/x-tar",
      "application/gzip"
    ]
    const allowedTextTypes = [
      "text/plain",
      "text/markdown", 
      "text/html",
      "text/css",
      "text/javascript",
      "application/json",
      "application/xml"
    ]
    const allowedDocumentTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]
    const allowedScriptTypes = [
      "application/lua",
      "application/x-lua",
      "text/x-lua",
      "application/javascript",
      "text/javascript",
      "application/x-javascript"
    ]
    const allowedBinaryTypes = [
      "application/octet-stream",
      "application/x-binary",
      "application/x-executable"
    ]
    
    const allowedFileTypes = [
      ...allowedImageTypes,
      ...allowedArchiveTypes,
      ...allowedTextTypes,
      ...allowedDocumentTypes,
      ...allowedScriptTypes,
      ...allowedBinaryTypes
    ]
    
    const isImage = allowedImageTypes.includes(file.type)
    const isArchive = allowedArchiveTypes.includes(file.type)
    const isText = allowedTextTypes.includes(file.type)
    
    // Check if file type is allowed (more permissive for assets)
    if (folder === "thumbnails" && !isImage) {
      return NextResponse.json({ error: "Thumbnails must be image files (JPEG, PNG, GIF, WebP)" }, { status: 400 })
    }
    
    // For assets folder, allow more file types but still validate
    if (folder === "assets") {
      // Check by file extension if MIME type is generic
      const fileName = file.name.toLowerCase()
      const allowedExtensions = [
        '.zip', '.rar', '.7z', '.tar', '.gz',
        '.txt', '.md', '.lua', '.js', '.json', '.xml', '.html', '.css',
        '.pdf', '.doc', '.docx',
        '.exe', '.dll', '.so', '.dylib'
      ]
      
      const hasAllowedExtension = allowedExtensions.some(ext => fileName.endsWith(ext))
      
      if (!allowedFileTypes.includes(file.type) && !hasAllowedExtension) {
        return NextResponse.json({ 
          error: "Unsupported file type. Allowed: ZIP, RAR, 7Z, TXT, LUA, JS, PDF, EXE, and more" 
        }, { status: 400 })
      }
    }
    
    // Dynamic size limits based on file type
    let maxSize
    if (isImage) {
      maxSize = 10 * 1024 * 1024 // 10MB for images
    } else if (isText) {
      maxSize = 5 * 1024 * 1024  // 5MB for text files
    } else if (isArchive) {
      maxSize = 100 * 1024 * 1024 // 100MB for archives
    } else {
      maxSize = 50 * 1024 * 1024  // 50MB for other files
    }
    
    if (file.size > maxSize) {
      const sizeMB = Math.round(maxSize / (1024 * 1024))
      return NextResponse.json(
        { error: `File too large (max ${sizeMB}MB for this file type)` },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin"
    const safeUserId = session.user.id.replace(/[^a-zA-Z0-9]/g, "")
    const filepath = `${folder}/${safeUserId}-${timestamp}-${randomStr}.${ext}`

    console.log("[Upload] Starting upload to Supabase Storage:", filepath)

    const supabase = getSupabase()
    const buffer = await file.arrayBuffer()

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("uploads")
      .upload(filepath, buffer, {
        contentType: file.type,
        upsert: true,
        cacheControl: "3600"
      })

    if (error) {
      console.error("[Upload] Supabase Storage error:", error)
      
      // If bucket doesn't exist, try to create it
      if (error.message?.includes("not found") || error.message?.includes("does not exist")) {
        console.log("[Upload] Attempting to create uploads bucket...")
        
        const { error: createError } = await supabase.storage.createBucket("uploads", {
          public: true,
          fileSizeLimit: 52428800 // 50MB
        })
        
        if (createError && !createError.message?.includes("already exists")) {
          console.error("[Upload] Failed to create bucket:", createError)
          return NextResponse.json({ error: "Storage not configured. Please contact admin." }, { status: 500 })
        }
        
        // Retry upload
        const { data: retryData, error: retryError } = await supabase.storage
          .from("uploads")
          .upload(filepath, buffer, {
            contentType: file.type,
            upsert: true
          })
        
        if (retryError) {
          console.error("[Upload] Retry failed:", retryError)
          return NextResponse.json({ error: "Upload failed: " + retryError.message }, { status: 500 })
        }
      } else {
        return NextResponse.json({ error: "Upload failed: " + error.message }, { status: 500 })
      }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("uploads")
      .getPublicUrl(filepath)

    console.log("[Upload] Success! URL:", publicUrl)

    return NextResponse.json({
      url: publicUrl,
      filename: file.name,
      size: file.size,
      type: file.type,
      path: filepath
    })
  } catch (error: any) {
    console.error("[Upload] Error:", error)
    return NextResponse.json({ error: "Upload failed: " + (error.message || "Unknown error") }, { status: 500 })
  }
}
