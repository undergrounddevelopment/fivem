'use client'

import { useState } from 'react'
import { Download, ExternalLink, Shield, Coins, CheckCircle, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { generateLinkvertiseUrl, autoConvertToLinkvertise } from '@/lib/linkvertise'

interface LinkvertiseDownloadButtonProps {
  assetId: string
  downloadUrl: string
  title: string
  className?: string
}

export function LinkvertiseDownloadButton({
  assetId,
  downloadUrl,
  title,
  className
}: LinkvertiseDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)

    try {
      // 1. Generate Linkvertise URL from server (respects Admin settings)
      const res = await fetch('/api/linkvertise/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate link')
      }

      // 2. Open Linkvertise in new tab
      const linkvertiseWindow = window.open(data.url, '_blank')

      if (linkvertiseWindow) {
        toast.success('Opening secure download...', {
          description: 'Complete the verification to start download'
        })
      } else {
        toast.error('Popup blocked', {
          description: 'Please allow popups for this site'
        })
      }

      // 3. Track download attempt separately if needed (optional since generate logs it?)
      // We can keeping the tracking here if we want to confirm the button press
      fetch(`/api/assets/${assetId}/download`, { method: 'POST' }).catch(() => { })

    } catch (error) {
      console.error(error)
      toast.error('Download failed', {
        description: 'Please check your configuration or try again later'
      })
    }

    setTimeout(() => setIsDownloading(false), 2000)
  }

  return (
    <div className={className}>
      <Button
        onClick={handleDownload}
        disabled={isDownloading}
        className="w-full h-14 text-lg font-bold rounded-xl gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
        size="lg"
      >
        {isDownloading ? (
          <>
            <Download className="h-5 w-5 animate-bounce" />
            Opening Secure Link...
          </>
        ) : (
          <>
            <Download className="h-5 w-5" />
            Download Now
          </>
        )}
      </Button>

      {/* Security badges */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3 w-3 text-green-400" />
          <span>Protected by Linkvertise</span>
          <ExternalLink className="h-3 w-3" />
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-1 text-green-400">
            <CheckCircle className="h-3 w-3" />
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-1 text-blue-400">
            <Zap className="h-3 w-3" />
            <span>Fast</span>
          </div>
          <div className="flex items-center gap-1 text-purple-400">
            <Coins className="h-3 w-3" />
            <span>Verified</span>
          </div>
        </div>
      </div>
    </div>
  )
}
