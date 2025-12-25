"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useAuth } from "@/components/auth-provider"
import { Download, AlertTriangle, CheckCircle, Loader2, XCircle, Sparkles } from "lucide-react"
import { CoinIcon } from "@/components/coin-icon"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface DownloadButtonProps {
  assetId: string
  price: "free" | "premium"
  coinPrice?: number
  downloadLink?: string
  className?: string
}

export function DownloadButton({ assetId, price, coinPrice = 0, downloadLink, className }: DownloadButtonProps) {
  const { user, refreshSession } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState("")
  const [isPurchased, setIsPurchased] = useState(false)
  const [isCheckingPurchase, setIsCheckingPurchase] = useState(true)

  const isFree = price === "free" || coinPrice === 0

  useEffect(() => {
    const checkPurchase = async () => {
      if (!user) {
        setIsCheckingPurchase(false)
        return
      }

      try {
        const res = await fetch(`/api/assets/${assetId}/check-purchase`)
        const data = await res.json()
        setIsPurchased(data.purchased)
      } catch (error) {
        console.error("Failed to check purchase status")
      } finally {
        setIsCheckingPurchase(false)
      }
    }

    checkPurchase()
  }, [assetId, user])

  const handleDownload = async () => {
    if (!user) {
      toast.error("Please login to download", {
        description: "You need to be logged in to download assets",
      })
      return
    }

    if (isFree || isPurchased) {
      await processDownload()
      return
    }

    if ((user?.coins || 0) < coinPrice) {
      toast.error("Insufficient Coins", {
        description: `You need ${coinPrice} coins but only have ${user?.coins || 0} coins. Get more coins from daily rewards!`,
        duration: 5000,
        action: {
          label: "Get Coins",
          onClick: () => (window.location.href = "/dashboard"),
        },
      })
      return
    }

    setShowModal(true)
  }

  const processDownload = async () => {
    setIsDownloading(true)
    setError("")

    try {
      const res = await fetch(`/api/download/${assetId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error === "Insufficient coins") {
          toast.error("Insufficient Coins", {
            description: `You need ${data.required} coins but only have ${data.available} coins`,
            duration: 5000,
          })
          setShowModal(false)
          return
        }
        setError(data.error || "Download failed")
        return
      }

      if ((data.coinsSpent || 0) > 0) {
        await refreshSession()
        toast.success("Purchase Successful!", {
          description: `You spent ${data.coinsSpent} coins. Download starting...`,
        })
        setIsPurchased(true)
      } else if (data.message === "Already purchased") {
        toast.info("Re-downloading", {
          description: "You already own this asset. Download starting...",
        })
      } else {
        toast.success("Download Starting", {
          description: "Your download will begin shortly",
        })
      }

      window.open(data.downloadUrl, "_blank")
      setShowModal(false)
    } catch (error) {
      toast.error("Download Failed", {
        description: "Something went wrong. Please try again.",
      })
      setError("Download failed. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  if (isCheckingPurchase) {
    return (
      <Button disabled className={cn("w-full rounded-xl h-12 text-base", className)}>
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Checking...
      </Button>
    )
  }

  const insufficientCoins = !isFree && !isPurchased && (user?.coins || 0) < coinPrice

  return (
    <>
      <Button
        onClick={handleDownload}
        disabled={isDownloading}
        className={cn(
          "w-full gap-2 rounded-xl h-12 text-base transition-all",
          isPurchased
            ? "bg-success hover:bg-success/90 text-white"
            : insufficientCoins
              ? "bg-destructive/20 hover:bg-destructive/30 text-destructive border border-destructive/50"
              : "bg-primary hover:bg-primary/90 glow-sm",
          className,
        )}
        size="lg"
      >
        {isDownloading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Downloading...
          </>
        ) : isPurchased ? (
          <>
            <CheckCircle className="h-5 w-5" />
            Download Again (Owned)
          </>
        ) : isFree ? (
          <>
            <Download className="h-5 w-5" />
            Download Free
          </>
        ) : insufficientCoins ? (
          <>
            <XCircle className="h-5 w-5" />
            <span className="flex items-center gap-1">
              Need <CoinIcon size="sm" /> {coinPrice} (You: {user?.coins || 0})
            </span>
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            <span className="flex items-center gap-1">
              Purchase <CoinIcon size="sm" /> {coinPrice}
            </span>
          </>
        )}
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md glass border-2 border-primary/30">
          <div className="p-6 space-y-4">
            {error ? (
              <>
                <div className="text-center">
                  <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-foreground mb-2">Error</h2>
                  <p className="text-muted-foreground">{error}</p>
                </div>
                <Button onClick={() => setShowModal(false)} variant="outline" className="w-full rounded-xl">
                  Close
                </Button>
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="h-16 w-16 rounded-2xl bg-warning/20 flex items-center justify-center mx-auto mb-4">
                    <CoinIcon size="lg" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Confirm Purchase</h2>
                  <p className="text-muted-foreground mb-4 flex items-center justify-center gap-1">
                    This asset costs <CoinIcon size="sm" /> {coinPrice} coins
                  </p>
                  <div className="glass rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground">Your Balance:</span>
                      <span className="text-lg font-bold text-foreground flex items-center gap-1">
                        <CoinIcon size="sm" />
                        {user?.coins || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground">Cost:</span>
                      <span className="text-lg font-bold text-destructive flex items-center gap-1">
                        -<CoinIcon size="sm" /> {coinPrice}
                      </span>
                    </div>
                    <div className="border-t border-border/50 pt-2 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">After Purchase:</span>
                        <span
                          className={`text-lg font-bold flex items-center gap-1 ${(user?.coins || 0) - coinPrice >= 0 ? "text-success" : "text-destructive"}`}
                        >
                          <CoinIcon size="sm" /> {(user?.coins || 0) - coinPrice}
                        </span>
                      </div>
                    </div>
                  </div>

                  {(user?.coins || 0) - coinPrice < 50 && (user?.coins || 0) - coinPrice >= 0 && (
                    <p className="text-xs text-warning mt-3 flex items-center justify-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Your balance will be low after this purchase
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowModal(false)}
                    variant="outline"
                    className="flex-1 rounded-xl bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={processDownload}
                    disabled={isDownloading || (user?.coins || 0) < coinPrice}
                    className="flex-1 bg-primary hover:bg-primary/90 rounded-xl"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm Purchase
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
