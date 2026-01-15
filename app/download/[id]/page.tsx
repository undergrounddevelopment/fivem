"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { autoConvertToLinkvertise, generateLinkvertiseUrl } from "@/lib/linkvertise"

export default function DirectDownloadPage() {
  const params = useParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [downloadUrl, setDownloadUrl] = useState<string>("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const fetchDownload = async () => {
      try {
        // Generate Linkvertise link from server to respect Admin settings
        const res = await fetch('/api/linkvertise/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assetId: params.id })
        })
        const data = await res.json()

        if (res.ok && data.url) {
          setDownloadUrl(data.url)
          setStatus("success")
          setMessage("Download ready!")

          // Auto-redirect to Linkvertise after 2 seconds
          setTimeout(() => {
            window.location.href = data.url
          }, 2000)
        } else {
          setStatus("error")
          setMessage(data.error || "Download failed")
        }
      } catch (error) {
        setStatus("error")
        setMessage("Failed to fetch download")
      }
    }

    if (params.id) {
      fetchDownload()
    }
  }, [params.id])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-6">
          {status === "loading" && (
            <>
              <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
              <h2 className="text-2xl font-bold">Preparing Download...</h2>
              <p className="text-muted-foreground">Please wait</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold">Download Ready!</h2>
              <p className="text-muted-foreground">{message}</p>
              <p className="text-sm text-muted-foreground">Download will start automatically...</p>
              {downloadUrl && (
                <Button onClick={() => window.location.href = downloadUrl} className="w-full gap-2">
                  <Download className="h-4 w-4" />
                  Download Now
                </Button>
              )}
            </>
          )}

          {status === "error" && (
            <>
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
              <h2 className="text-2xl font-bold">Download Failed</h2>
              <p className="text-muted-foreground">{message}</p>
              <Button onClick={() => router.back()} variant="outline" className="w-full">
                Go Back
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
