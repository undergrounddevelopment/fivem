"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { useAuth } from "@/components/auth-provider"
import { Gift, Loader2, CheckCircle, Clock, Sparkles } from "lucide-react"
import { CoinIcon } from "@/components/coin-icon"
import { motion, AnimatePresence } from "framer-motion"

export function DailyCoinsButton() {
  const { user, refreshSession } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Show static button during SSR
  if (!mounted) {
    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          disabled
          className="w-full rounded-xl gap-2 glow relative overflow-hidden group shimmer"
          style={{ background: 'linear-gradient(90deg, var(--primary), var(--accent))', color: 'white' }}
        >
          <Gift className="h-4 w-4 relative z-10" />
          <span className="relative z-10">Daily Coins</span>
          <Sparkles className="h-3 w-3 relative z-10 animate-pulse" />
        </Button>
      </motion.div>
    )
  }

  const handleClaim = async () => {
    if (!user) return

    setIsClaiming(true)
    try {
      const res = await fetch("/api/coins/daily", { method: "POST" })
      const data = await res.json()

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to claim coins")
      }

      setResult({ success: true, coinsAdded: data.coinsEarned, newBalance: data.totalCoins })

      await refreshSession()
      setTimeout(() => {
        setShowModal(false)
        setResult(null)
      }, 2000)
    } catch (error: any) {
      setResult({ error: error.message || "Failed to claim coins" })
    } finally {
      setIsClaiming(false)
    }
  }

  if (!user) return null

  return (
    <>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={() => setShowModal(true)}
          className="w-full rounded-xl gap-2 glow relative overflow-hidden group shimmer"
          style={{ background: 'linear-gradient(90deg, var(--primary), var(--accent))', color: 'white' }}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(90deg, var(--primary), var(--accent), var(--primary))' }} />
          <Gift className="h-4 w-4 relative z-10" />
          <span className="relative z-10">Daily Coins</span>
          <Sparkles className="h-3 w-3 relative z-10 animate-pulse" />
        </Button>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogContent className="max-w-md glass border-2" style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'var(--primary)' }}>
              <VisuallyHidden>
                <DialogTitle>Daily Coins</DialogTitle>
              </VisuallyHidden>
              <motion.div 
                className="p-6 space-y-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <div className="text-center">
                  <motion.div 
                    className="h-20 w-20 rounded-2xl flex items-center justify-center mx-auto mb-4 relative"
                    style={{ background: 'rgba(236, 72, 153, 0.2)' }}
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <CoinIcon size="xl" />
                    <motion.div
                      className="absolute inset-0 rounded-2xl"
                      style={{ background: 'var(--primary)', opacity: 0.3 }}
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-[var(--text)] mb-2">Daily Coins</h2>
                  <p className="text-[var(--textDim)]">Claim your free 100 coins every 24 hours!</p>
                </div>

                <AnimatePresence mode="wait">
                  {result ? (
                    result.success ? (
                      <motion.div 
                        className="text-center space-y-3"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <CheckCircle className="h-16 w-16 text-[var(--primary)] mx-auto" />
                        </motion.div>
                        <motion.div 
                          className="flex items-center justify-center gap-2"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <CoinIcon size="md" />
                          <p className="text-lg font-semibold text-[var(--primary)]">+{result.coinsAdded} Coins Claimed!</p>
                        </motion.div>
                        <motion.p 
                          className="text-[var(--textDim)]"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          New Balance: {result.newBalance}
                        </motion.p>
                      </motion.div>
                    ) : (
                      <motion.div 
                        className="text-center space-y-3"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <Clock className="h-16 w-16 text-[var(--primary)] mx-auto" />
                        <p className="text-lg font-semibold text-[var(--text)]">Already Claimed</p>
                        <p className="text-[var(--textDim)]">{result.error}</p>
                        {result.canClaimIn && (
                          <p className="text-sm text-[var(--textDim)]">Come back in {result.canClaimIn}</p>
                        )}
                      </motion.div>
                    )
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                    >
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={handleClaim}
                          disabled={isClaiming}
                          className="w-full rounded-xl h-12 glow-sm relative overflow-hidden group shimmer"
                          style={{ background: 'var(--primary)', color: 'white' }}
                        >
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(90deg, var(--primary), var(--accent), var(--primary))' }} />
                          {isClaiming ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin relative z-10" />
                              <span className="relative z-10">Claiming...</span>
                            </>
                          ) : (
                            <>
                              <CoinIcon size="sm" className="mr-2 relative z-10" />
                              <span className="relative z-10">Claim 100 Coins</span>
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  )
}
