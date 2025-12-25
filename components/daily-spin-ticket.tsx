"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Gift, Sparkles, Flame } from "lucide-react"
import confetti from "canvas-confetti"

const SPIN_TICKET_ICON = "https://cdn3d.iconscout.com/3d/premium/thumb/ticket-3d-icon-png-download-9964703.png"

export function DailySpinTicket() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<{
    canClaim: boolean
    claimedToday: boolean
    totalTickets: number
    currentStreak: number
    nextClaimAt: string | null
  } | null>(null)
  const [claiming, setClaiming] = useState(false)
  const [claimResult, setClaimResult] = useState<{
    ticketsReceived: number
    streak: number
    message: string
  } | null>(null)
  const [countdown, setCountdown] = useState("")

  useEffect(() => {
    if (session?.user) {
      fetchStatus()
    }
  }, [session])

  useEffect(() => {
    if (status?.nextClaimAt) {
      const interval = setInterval(() => {
        const now = new Date()
        const next = new Date(status.nextClaimAt!)
        const diff = next.getTime() - now.getTime()

        if (diff <= 0) {
          setCountdown("Ready!")
          fetchStatus()
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60))
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((diff % (1000 * 60)) / 1000)
          setCountdown(
            `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
          )
        }
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [status?.nextClaimAt])

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/spin-tickets/claim")
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
      }
    } catch (error) {
      console.error("Failed to fetch status:", error)
    }
  }

  const handleClaim = async () => {
    if (!status?.canClaim || claiming) return

    setClaiming(true)
    try {
      const res = await fetch("/api/spin-tickets/claim", { method: "POST" })
      if (res.ok) {
        const data = await res.json()
        setClaimResult(data)

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#fbbf24", "#f59e0b", "#d97706"],
        })

        await fetchStatus()
      }
    } catch (error) {
      console.error("Failed to claim:", error)
    } finally {
      setClaiming(false)
    }
  }

  if (!session?.user) return null

  const streakDays = [1, 2, 3, 4, 5, 6, 7]

  return (
    <>
      {/* Floating Button - More compact and modern */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm ${
          status?.canClaim
            ? "bg-gradient-to-r from-amber-500/90 to-orange-500/90 shadow-amber-500/40"
            : "bg-card/90 border border-border/50"
        }`}
      >
        <img
          src={SPIN_TICKET_ICON || "/placeholder.svg"}
          alt="Spin Ticket"
          className="w-7 h-7"
          loading="lazy"
          decoding="async"
        />
        <div className="text-left">
          <p className="text-[10px] font-bold text-foreground">{status?.canClaim ? "Claim Now!" : "Daily Ticket"}</p>
          <p className="text-[10px] text-muted-foreground">{status?.totalTickets || 0} Tickets</p>
        </div>
        {status?.canClaim && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />}
      </button>

      {/* Modal - Modern glassmorphism design */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-gradient-to-b from-background/95 to-background border-amber-500/20 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-lg">
              <img src={SPIN_TICKET_ICON || "/placeholder.svg"} alt="Spin Ticket" className="w-8 h-8" loading="lazy" />
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent font-bold">
                Daily Spin Ticket
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Streak Calendar - More compact */}
            <div className="bg-accent/30 rounded-xl p-3 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="font-medium text-sm">Login Streak</span>
                <span className="ml-auto text-amber-400 font-bold text-sm">Day {status?.currentStreak || 0}</span>
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {streakDays.map((day) => {
                  const isCompleted = (status?.currentStreak || 0) >= day
                  const isCurrent = (status?.currentStreak || 0) + 1 === day && status?.canClaim
                  const bonusTickets = day >= 7 ? 3 : day >= 3 ? 2 : 1

                  return (
                    <div
                      key={day}
                      className={`relative flex flex-col items-center p-1.5 rounded-lg transition-all ${
                        isCompleted
                          ? "bg-gradient-to-b from-amber-500/20 to-orange-500/20 border border-amber-500/40"
                          : isCurrent
                            ? "bg-amber-500/10 border border-amber-500 border-dashed"
                            : "bg-muted/30 border border-border/30"
                      }`}
                    >
                      <span className="text-[9px] text-muted-foreground">D{day}</span>
                      <img
                        src={SPIN_TICKET_ICON || "/placeholder.svg"}
                        alt="Ticket"
                        className={`w-5 h-5 ${isCompleted ? "" : "opacity-30 grayscale"}`}
                        loading="lazy"
                      />
                      {bonusTickets > 1 && (
                        <span
                          className={`text-[8px] font-bold ${isCompleted ? "text-amber-400" : "text-muted-foreground"}`}
                        >
                          x{bonusTickets}
                        </span>
                      )}
                      {isCompleted && (
                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Claim Result */}
            {claimResult && (
              <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-3 border border-amber-500/20 text-center">
                <Sparkles className="w-6 h-6 text-amber-400 mx-auto mb-1" />
                <p className="text-sm font-bold text-amber-400">{claimResult.message}</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <img src={SPIN_TICKET_ICON || "/placeholder.svg"} alt="Ticket" className="w-6 h-6" loading="lazy" />
                  <span className="text-xl font-bold">+{claimResult.ticketsReceived}</span>
                </div>
              </div>
            )}

            {/* Your Tickets */}
            <div className="bg-accent/30 rounded-xl p-3 border border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Your Tickets</span>
                <div className="flex items-center gap-2">
                  <img src={SPIN_TICKET_ICON || "/placeholder.svg"} alt="Ticket" className="w-5 h-5" loading="lazy" />
                  <span className="text-xl font-bold">{status?.totalTickets || 0}</span>
                </div>
              </div>
            </div>

            {/* Claim Button */}
            {status?.canClaim ? (
              <Button
                onClick={handleClaim}
                disabled={claiming}
                className="w-full h-12 font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl shadow-lg shadow-amber-500/20"
              >
                {claiming ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Claiming...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    Claim Daily Ticket
                  </div>
                )}
              </Button>
            ) : (
              <div className="text-center py-2">
                <p className="text-muted-foreground text-xs mb-1">Next claim in</p>
                <div className="text-2xl font-mono font-bold text-amber-400">{countdown || "..."}</div>
              </div>
            )}

            <p className="text-[10px] text-center text-muted-foreground">
              Login daily to build streak & earn bonus tickets!
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
