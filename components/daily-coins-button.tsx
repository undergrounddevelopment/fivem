"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useAuth } from "@/components/auth-provider"
import { Gift, Loader2, CheckCircle, Clock } from "lucide-react"
import { CoinIcon } from "@/components/coin-icon"

export function DailyCoinsButton() {
  const { user, refreshSession } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleClaim = async () => {
    if (!user) return

    setIsClaiming(true)
    try {
      const res = await fetch("/api/coins/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await res.json()
      setResult(data)

      if (data.success) {
        await refreshSession()
        setTimeout(() => {
          setShowModal(false)
          setResult(null)
        }, 1500)
      }
    } catch (error) {
      setResult({ error: "Failed to claim coins" })
    } finally {
      setIsClaiming(false)
    }
  }

  if (!user) return null

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        className="w-full bg-gradient-to-r from-warning to-chart-5 hover:from-warning/90 hover:to-chart-5/90 rounded-xl gap-2 glow-sm"
      >
        <Gift className="h-4 w-4" />
        Daily Coins
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md glass border-2 border-warning/30">
          <div className="p-6 space-y-4">
            <div className="text-center">
              <div className="h-20 w-20 rounded-2xl bg-warning/20 flex items-center justify-center mx-auto mb-4">
                <CoinIcon size="xl" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Daily Coins</h2>
              <p className="text-muted-foreground">Claim your free 25 coins every 24 hours!</p>
            </div>

            {result ? (
              result.success ? (
                <div className="text-center space-y-3">
                  <CheckCircle className="h-16 w-16 text-success mx-auto" />
                  <div className="flex items-center justify-center gap-2">
                    <CoinIcon size="md" />
                    <p className="text-lg font-semibold text-success">+{result.coinsAdded} Coins Claimed!</p>
                  </div>
                  <p className="text-muted-foreground">New Balance: {result.newBalance}</p>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <Clock className="h-16 w-16 text-warning mx-auto" />
                  <p className="text-lg font-semibold text-foreground">Already Claimed</p>
                  <p className="text-muted-foreground">{result.error}</p>
                  {result.canClaimIn && (
                    <p className="text-sm text-muted-foreground">Come back in {result.canClaimIn}</p>
                  )}
                </div>
              )
            ) : (
              <Button
                onClick={handleClaim}
                disabled={isClaiming}
                className="w-full bg-warning hover:bg-warning/90 rounded-xl h-12"
              >
                {isClaiming ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  <>
                    <CoinIcon size="sm" className="mr-2" />
                    Claim 25 Coins
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
