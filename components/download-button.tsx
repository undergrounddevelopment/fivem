"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { useAuth } from "@/components/auth-provider"
import { Download, AlertTriangle, CheckCircle, Loader2, XCircle, Sparkles, Zap } from "lucide-react"
import { CoinIcon } from "@/components/coin-icon"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface DownloadButtonProps {
  assetId: string
  price: "free" | "premium"
  coinPrice?: number
  downloadLink?: string
  className?: string
}

export function DownloadButton({ assetId, price, coinPrice = 0, downloadLink, className }: DownloadButtonProps) {
  const { user, refreshSession, isLoading: authIsLoading } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState("")
  const [isPurchased, setIsPurchased] = useState(false)
  const [isCheckingPurchase, setIsCheckingPurchase] = useState(true)
  const [checkingError, setCheckingError] = useState<string | null>(null)

  const isFree = price === "free" || coinPrice === 0

  useEffect(() => {
    const checkPurchase = async () => {
      // Tambahkan pengecekan apakah user sedang loading
      if (authIsLoading) {
        return
      }

      if (!user) {
        setIsCheckingPurchase(false)
        return
      }

      try {
        const res = await fetch(`/api/assets/${assetId}/check-purchase`)
        
        if (!res.ok) {
          console.error("Failed to check purchase status:", res.status, res.statusText)
          setCheckingError(`API error: ${res.status} - ${res.statusText}`)
          return
        }
        
        const data = await res.json()
        setIsPurchased(data.purchased)
      } catch (error) {
        console.error("Failed to check purchase status", error)
        setCheckingError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      } finally {
        // Tetap set checking ke false agar tombol bisa digunakan walaupun ada error
        setIsCheckingPurchase(false)
      }
    }

    // Gunakan setTimeout untuk mencegah masalah render
    const timer = setTimeout(() => {
      checkPurchase()
    }, 0)

    return () => clearTimeout(timer)
  }, [assetId, user, authIsLoading])

  const handleDownload = async () => {
    // Tambahkan pengecekan tambahan untuk isCheckingPurchase
    if (isCheckingPurchase) {
      toast.info("Please wait", {
        description: "We're still loading your purchase status. Please wait a moment.",
      })
      return
    }

    if (checkingError) {
      toast.error("Purchase Check Error", {
        description: `There was an issue checking your purchase status: ${checkingError}. Please refresh the page or try again later.`,
      })
      return
    }

    if (!user) {
      toast.error("Login Required", {
        description: "You must be logged in to download assets. Click the Login button to continue.",
        action: {
          label: "Login",
          onClick: () => {
            const { signIn } = require("next-auth/react")
            signIn("discord")
          },
        },
        duration: 5000,
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
    if (!user) {
      toast.error("Authentication Error", {
        description: "You must be logged in to download assets. Please log in first.",
      })
      return
    }

    setIsDownloading(true)
    setError("")

    try {
      const res = await fetch(`/api/download/${assetId}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          // Tambahkan authorization header jika diperlukan
        },
        body: JSON.stringify({ userId: user.id }),
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
        
        toast.error("Download Failed", {
          description: data.error || "Download failed",
          duration: 5000,
        })
        setError(data.error || "Download failed")
        return
      }

      if (data.downloadUrl) {
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
        
        // Buka URL download di tab baru
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setShowModal(false)
      } else {
        throw new Error("No download URL received from server")
      }
    } catch (error) {
      console.error("Download error:", error)
      toast.error("Download Failed", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      })
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsDownloading(false)
    }
  }

  // Tampilkan loading state saat auth sedang loading
  if (authIsLoading || isCheckingPurchase) {
    return (
      <Button disabled className={cn("w-full rounded-xl h-12 text-base glass", className)}>
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading...
      </Button>
    )
  }

  const insufficientCoins = !isFree && !isPurchased && (user?.coins || 0) < coinPrice

  return (
    <>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={handleDownload}
          disabled={isDownloading || isCheckingPurchase} // Tambahkan isCheckingPurchase ke disabled
          className={cn(
            "w-full gap-2 rounded-xl h-12 text-base transition-all relative overflow-hidden group",
            isPurchased
              ? "text-white glow-sm"
              : insufficientCoins
                ? "border"
                : "glow",
            className,
          )}
          style={isPurchased ? { background: 'var(--primary)' } : insufficientCoins ? { background: 'rgba(255, 0, 0, 0.1)', borderColor: 'red', color: 'red' } : { background: 'var(--primary)', color: 'white' }}
          size="lg"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(90deg, var(--primary), var(--accent), var(--primary))' }} />
          {isDownloading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin relative z-10" />
              <span className="relative z-10">Downloading...</span>
            </>
          ) : isPurchased ? (
            <>
              <CheckCircle className="h-5 w-5 relative z-10" />
              <span className="relative z-10">Download Again (Owned)</span>
            </>
          ) : isFree ? (
            <>
              <Zap className="h-5 w-5 relative z-10" />
              <span className="relative z-10">Download Free</span>
            </>
          ) : insufficientCoins ? (
            <>
              <XCircle className="h-5 w-5 relative z-10" />
              <span className="flex items-center gap-1 relative z-10">
                Need <CoinIcon size="sm" /> {coinPrice} (You: {user?.coins || 0})
              </span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 relative z-10" />
              <span className="flex items-center gap-1 relative z-10">
                Purchase <CoinIcon size="sm" /> {coinPrice}
              </span>
            </>
          )}
        </Button>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogContent className="max-w-md glass border-2" style={{ background: 'rgba(0, 0, 0, 0.9)', borderColor: 'var(--primary)' }}>
              <VisuallyHidden>
                <DialogTitle>Confirm Purchase</DialogTitle>
              </VisuallyHidden>
              <motion.div 
                className="p-6 space-y-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                {error ? (
                  <>
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
                      </motion.div>
                      <h2 className="text-2xl font-bold text-[var(--text)] mb-2">Error</h2>
                      <p className="text-[var(--textDim)]">{error}</p>
                    </div>
                    <Button onClick={() => setShowModal(false)} variant="outline" className="w-full rounded-xl glass-hover">
                      Close
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      <motion.div 
                        className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ background: 'rgba(236, 72, 153, 0.2)' }}
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <CoinIcon size="lg" />
                      </motion.div>
                      <h2 className="text-2xl font-bold text-[var(--text)] mb-2">Confirm Purchase</h2>
                      <p className="text-[var(--textDim)] mb-4 flex items-center justify-center gap-1">
                        This asset costs <CoinIcon size="sm" /> {coinPrice} coins
                      </p>
                      <div className="glass rounded-xl p-4 space-y-3">
                        <motion.div 
                          className="flex items-center justify-between"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <span className="text-[var(--textDim)]">Your Balance:</span>
                          <span className="text-lg font-bold text-[var(--text)] flex items-center gap-1">
                            <CoinIcon size="sm" />
                            {user?.coins || 0}
                          </span>
                        </motion.div>
                        <motion.div 
                          className="flex items-center justify-between"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <span className="text-[var(--textDim)]">Cost:</span>
                          <span className="text-lg font-bold text-destructive flex items-center gap-1">
                            -<CoinIcon size="sm" /> {coinPrice}
                          </span>
                        </motion.div>
                        <div className="border-t border-border/50 pt-2">
                          <motion.div 
                            className="flex items-center justify-between"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <span className="font-medium text-[var(--text)]">After Purchase:</span>
                            <span
                              className={`text-lg font-bold flex items-center gap-1`}
                              style={{ color: (user?.coins || 0) - coinPrice >= 0 ? 'var(--primary)' : 'red' }}
                            >
                              <CoinIcon size="sm" /> {(user?.coins || 0) - coinPrice}
                            </span>
                          </motion.div>
                        </div>
                      </div>

                      {(user?.coins || 0) - coinPrice < 50 && (user?.coins || 0) - coinPrice >= 0 && (
                        <motion.p 
                          className="text-xs text-warning mt-3 flex items-center justify-center gap-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          <AlertTriangle className="h-3 w-3" />
                          Your balance will be low after this purchase
                        </motion.p>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={() => setShowModal(false)}
                          variant="outline"
                          className="w-full rounded-xl glass-hover"
                        >
                          Cancel
                        </Button>
                      </motion.div>
                      <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={processDownload}
                          disabled={isDownloading || (user?.coins || 0) < coinPrice}
                          className="w-full rounded-xl glow-sm"
                          style={{ background: 'var(--primary)', color: 'white' }}
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
                      </motion.div>
                    </div>
                  </>
                )}
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  )
}