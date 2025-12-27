import { createUploadthing, type FileRouter } from "uploadthing/next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { security, validateFileUpload } from "@/lib/security"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

const f = createUploadthing()

export const ourFileRouter = {
  assetUploader: f({
    "application/zip": { maxFileSize: "256MB" },
  })
    .middleware(async ({ req }) => {
      const session = await getServerSession(authOptions)
      if (!session?.user) {
        security.logSecurityEvent("Unauthorized upload attempt", { userId: "unknown" }, "medium")
        throw new Error("Unauthorized")
      }

      if (!security.checkRateLimit(`upload_${session.user.id}`, 20, 300000)) {
        security.logSecurityEvent("Upload rate limit exceeded", { userId: session.user.id }, "medium")
        throw new Error("Upload rate limit exceeded")
      }

      return {
        userId: session.user.id,
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Validate file after upload
      const fileValidation = validateFileUpload({
        name: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
      })

      if (!fileValidation.valid) {
        security.logSecurityEvent(
          "Invalid file uploaded",
          {
            userId: metadata.userId,
            fileName: file.name,
            error: fileValidation.error,
          },
          "high",
        )
        throw new Error(fileValidation.error || "Invalid file")
      }

      // Log successful upload
      security.logSecurityEvent(
        "File upload completed",
        {
          userId: metadata.userId,
          fileName: file.name,
          fileSize: file.size,
          fileUrl: file.url,
        },
        "low",
      )

      try {
        const supabase = getSupabaseAdminClient()
        await supabase.from("coin_transactions").insert({
          user_id: metadata.userId,
          amount: 0,
          type: "file_upload",
          description: `Uploaded: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
        })
      } catch (err) {
        console.error("Failed to log upload transaction:", err)
      }

      return {
        uploadedBy: metadata.userId,
        fileUrl: file.url,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
      }
    }),

  thumbnailUploader: f({
    "image/jpeg": { maxFileSize: "4MB" },
    "image/png": { maxFileSize: "4MB" },
    "image/webp": { maxFileSize: "4MB" },
  })
    .middleware(async ({ req }) => {
      const session = await getServerSession(authOptions)
      if (!session?.user) throw new Error("Unauthorized")
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        uploadedBy: metadata.userId,
        thumbnailUrl: file.url,
      }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
