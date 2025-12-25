import { NextResponse } from "next/server"
import crypto from "crypto"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { security, validateFileUpload } from "@/lib/security"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY || ""

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!security.checkRateLimit(`virus_scan_${session.user.id}`, 50, 300000)) {
      return NextResponse.json({ error: "Scan rate limit exceeded" }, { status: 429 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.size > 256 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const hash = crypto.createHash("sha256").update(buffer).digest("hex")

    const fileValidation = validateFileUpload({
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
    })

    if (!fileValidation.valid) {
      security.logSecurityEvent(
        "Invalid file submitted for virus scan",
        {
          userId: session.user.id,
          fileName: file.name,
          error: fileValidation.error,
        },
        "medium",
      )
      return NextResponse.json(
        {
          error: fileValidation.error,
          clean: false,
        },
        { status: 400 },
      )
    }

    security.logSecurityEvent(
      "Virus scan initiated",
      {
        userId: session.user.id,
        fileName: file.name,
        fileSize: file.size,
        hash: hash.substring(0, 16),
      },
      "low",
    )

    const supabase = getSupabaseAdminClient()
    await supabase.from("coin_transactions").insert({
      user_id: session.user.id,
      amount: 0,
      type: "virus_scan",
      description: `Scanned: ${file.name} (${hash.substring(0, 8)}...)`,
    })

    if (!VIRUSTOTAL_API_KEY) {
      return NextResponse.json({
        clean: true,
        message: "VirusTotal API not configured - file accepted with warning",
        hash,
        warning: "No virus scanning available",
      })
    }

    try {
      const checkResponse = await fetch(`https://www.virustotal.com/api/v3/files/${hash}`, {
        headers: { "x-apikey": VIRUSTOTAL_API_KEY },
        signal: AbortSignal.timeout(10000),
      })

      if (checkResponse.status === 404) {
        const uploadFormData = new FormData()
        uploadFormData.append("file", file)

        const uploadResponse = await fetch("https://www.virustotal.com/api/v3/files", {
          method: "POST",
          headers: { "x-apikey": VIRUSTOTAL_API_KEY },
          body: uploadFormData,
          signal: AbortSignal.timeout(30000),
        })

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${uploadResponse.status}`)
        }

        const uploadData = await uploadResponse.json()

        return NextResponse.json({
          clean: false,
          scanning: true,
          analysisId: uploadData.data?.id,
          message: "File uploaded for scanning - manual review required",
          hash,
        })
      }

      if (!checkResponse.ok) {
        throw new Error(`Check failed: ${checkResponse.status}`)
      }

      const data = await checkResponse.json()
      const stats = data.data?.attributes?.last_analysis_stats || {}
      const malicious = stats.malicious || 0
      const suspicious = stats.suspicious || 0
      const harmless = stats.harmless || 0
      const undetected = stats.undetected || 0

      const isClean = malicious === 0 && suspicious === 0
      const totalScans = harmless + undetected + malicious + suspicious
      const confidence = totalScans > 0 ? harmless / totalScans : 0
      const finalResult = isClean && confidence > 0.8 && totalScans >= 10

      security.logSecurityEvent(
        "Virus scan completed",
        {
          userId: session.user.id,
          fileName: file.name,
          hash: hash.substring(0, 16),
          result: finalResult ? "clean" : "suspicious",
          stats,
          confidence: Math.round(confidence * 100),
        },
        finalResult ? "low" : "high",
      )

      return NextResponse.json({
        clean: finalResult,
        stats,
        hash,
        confidence: Math.round(confidence * 100),
        totalScans,
        permalink: data.data?.links?.self,
        scanDate: data.data?.attributes?.last_analysis_date,
        recommendation: finalResult ? "File appears safe" : "Manual review recommended",
      })
    } catch (apiError: any) {
      logger.error("VirusTotal API error", apiError, {
        userId: (await getServerSession(authOptions))?.user?.id,
        hash,
        endpoint: "/api/upload/virus-scan",
        ip: request.headers.get("x-forwarded-for") || "unknown",
      })
      return NextResponse.json({
        clean: false,
        message: "Virus scan service unavailable - manual review required",
        hash,
        error: "API_ERROR",
      })
    }
  } catch (error: any) {
    logger.error("Virus scan error", error, {
      userId: (await getServerSession(authOptions))?.user?.id,
      endpoint: "/api/upload/virus-scan",
      ip: request.headers.get("x-forwarded-for") || "unknown",
    })
    return NextResponse.json(
      {
        clean: false,
        message: "Scan failed - manual review required",
        error: "SCAN_ERROR",
      },
      { status: 500 },
    )
  }
}
