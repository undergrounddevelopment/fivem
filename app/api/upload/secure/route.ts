import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/server"
import crypto from "crypto"

// Allowed file types with their MIME types
const ALLOWED_TYPES: Record<string, string[]> = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
  video: ["video/mp4", "video/webm", "video/ogg"],
  document: ["application/pdf", "application/zip", "application/x-rar-compressed"],
}

// Max file sizes per type (in bytes)
const MAX_SIZES: Record<string, number> = {
  image: 10 * 1024 * 1024, // 10MB
  video: 100 * 1024 * 1024, // 100MB
  document: 50 * 1024 * 1024, // 50MB
}

// File signature validation (magic bytes)
const FILE_SIGNATURES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "image/gif": [[0x47, 0x49, 0x46, 0x38]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]],
  "video/mp4": [
    [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70],
    [0x00, 0x00, 0x00, 0x1c, 0x66, 0x74, 0x79, 0x70],
  ],
  "application/pdf": [[0x25, 0x50, 0x44, 0x46]],
  "application/zip": [
    [0x50, 0x4b, 0x03, 0x04],
    [0x50, 0x4b, 0x05, 0x06],
  ],
}

async function validateFileSignature(buffer: ArrayBuffer, mimeType: string): Promise<boolean> {
  const signatures = FILE_SIGNATURES[mimeType]
  if (!signatures) return true // Skip validation if no signature defined

  const bytes = new Uint8Array(buffer.slice(0, 16))

  return signatures.some((signature) => {
    return signature.every((byte, index) => bytes[index] === byte)
  })
}

function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts and dangerous characters
  return filename
    .replace(/\.\./g, "")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 100) // Limit filename length
}

function getFileCategory(mimeType: string): string | null {
  for (const [category, types] of Object.entries(ALLOWED_TYPES)) {
    if (types.includes(mimeType)) return category
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createAdminClient()
    const userId = (session.user as any).discord_id || session.user.id

    // Check user permissions for certain uploads
    const { data: userData } = await supabase.from("users").select("role, membership").eq("discord_id", userId).single()

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const uploadType = (formData.get("type") as string) || "general"
    const requireAdmin = formData.get("requireAdmin") === "true"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Admin check for certain uploads
    if (requireAdmin && userData?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Validate file type
    const fileCategory = getFileCategory(file.type)
    if (!fileCategory) {
      return NextResponse.json(
        {
          error: `Invalid file type: ${file.type}. Allowed types: images, videos, documents`,
        },
        { status: 400 },
      )
    }

    // Validate file size
    const maxSize = MAX_SIZES[fileCategory]
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size for ${fileCategory}: ${maxSize / (1024 * 1024)}MB`,
        },
        { status: 400 },
      )
    }

    // Validate file signature (magic bytes)
    const buffer = await file.arrayBuffer()
    const isValidSignature = await validateFileSignature(buffer, file.type)
    if (!isValidSignature) {
      return NextResponse.json(
        {
          error: "File content does not match its extension. Possible security risk.",
        },
        { status: 400 },
      )
    }

    // Generate secure filename
    const timestamp = Date.now()
    const randomId = crypto.randomBytes(8).toString("hex")
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin"
    const sanitizedOriginal = sanitizeFilename(file.name.replace(`.${ext}`, ""))
    const filename = `${uploadType}/${userId}/${timestamp}-${randomId}-${sanitizedOriginal}.${ext}`

    // Upload to Vercel Blob
    const blob = await put(filename, new Blob([buffer]), {
      access: "public",
      contentType: file.type,
    })

    // Log upload in database
    await supabase.from("file_uploads").insert({
      user_id: userId,
      file_url: blob.url,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      upload_type: uploadType,
      checksum: crypto.createHash("md5").update(Buffer.from(buffer)).digest("hex"),
    })

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      size: file.size,
      type: file.type,
      category: fileCategory,
    })
  } catch (error: any) {
    console.error("Secure upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
