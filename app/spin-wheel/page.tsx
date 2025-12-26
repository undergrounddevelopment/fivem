"use client"

import { useAuth } from "@/components/auth-provider"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { LinkvertiseAd } from "@/components/linkvertise-ad"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useCallback } from "react"
import { Coins, Trophy, History, Gift, Sparkles, Loader2, RotateCw } from "lucide-react"
import dynamic from "next/dynamic"

const confetti = dynamic(() => import("canvas-confetti").then(mod => mod.default), { ssr: false })

const TICKET_ICON_3D = "https://cdn3d.iconscout.com/3d/premium/thumb/ticket-3d-icon-png-download-9964703.png"
const MARIO_COINS_GIF = "https://media.tenor.com/jX0Ytn_JLcIAAAAj/mario-coins.gif"

interface Prize {
  id: string
  name: string
  coins: number
  color: string
  probability: number
  rarity?: string
  image_url?: string
}

interface SpinHistoryItem {
  id: string
  prize_name: string
  coins_won: number
  spin_type: string
  created_at: string
}

const RARITY_COLORS: Record<string, string> = {
  common: "#6b7280",
  uncommon: "#22c55e",
  rare: "#3b82f6",
  epic: "#a855f7",
  legendary: "#eab308",
}

const getRarityFromCoins = (coins: number): string => {
  if (coins >= 500) return "legendary"
  if (coins >= 250) return "epic"
  if (coins >= 100) return "rare"
  if (coins >= 25) return "uncommon"
  return "common"
}

export default function SpinWheelPage() {
  const { user } = useAuth()

  const [prizes, setPrizes] = useState<Prize[]>([])
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<Prize | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [history, setHistory] = useState<SpinHistoryItem[]>([])
  const [userCoins, setUserCoins] = useState(0)
  const [userTickets, setUserTickets] = useState(0)
  const [loading, setLoading] = useState(true)
  const [canClaimDaily, setCanClaimDaily] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [streak, setStreak] = useState(0)
  const [baseRotation, setBaseRotation] = useState(0)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      
      const prizesRes = await fetch("/api/spin-wheel/prizes", {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      
      if (prizesRes.ok) {
        const prizesData = await prizesRes.json()
        const fetchedPrizes = prizesData.prizes || []
        setPrizes(fetchedPrizes)
      }

      if (user) {
        const [userRes, historyRes, dailyRes] = await Promise.all([
          fetch("/api/user/balance"),
          fetch("/api/spin-wheel/history"),
          fetch("/api/spin-wheel/daily-status"),
        ])

        if (userRes.ok) {
          const userData = await userRes.json()
          setUserCoins(userData.coins || 0)
          setUserTickets(userData.spin_tickets || 0)
        }

        if (historyRes.ok) {
          const historyData = await historyRes.json()
          setHistory(historyData.history || [])
        }

        if (dailyRes.ok) {
          const dailyData = await dailyRes.json()
          setCanClaimDaily(dailyData.canClaim || false)
          setStreak(dailyData.streak || 0)
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [])

  const claimDailyTicket = async () => {
    if (claiming || !canClaimDaily) return
    setClaiming(true)

    try {
      const res = await fetch("/api/spin-wheel/claim-daily", { method: "POST" })
      const data = await res.json()

      if (data.success) {
        setUserTickets(data.newTickets)
        setCanClaimDaily(false)
        setStreak(data.newStreak)
        if (typeof confetti === "function") {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } })
        }
      }
    } catch (error) {
      console.error("Error claiming daily:", error)
    } finally {
      setClaiming(false)
    }
  }

  const handleSpin = async () => {
    if (spinning || !user || userTickets < 1) return

    setSpinning(true)
    setResult(null)
    setShowResult(false)

    try {
      const res = await fetch("/api/spin-wheel/spin", {
        method: "POST",
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || "Spin failed")
        setSpinning(false)
        return
      }

      const data = await res.json()
      const activePrizes = prizes.filter((p) => p.coins >= 0)
      const prizeIndex = activePrizes.findIndex((p) => p.id === data.prize.id)
      const segmentAngle = 360 / activePrizes.length

      // Pointer is at RIGHT (0 degrees / 3 o'clock position)
      // Calculate rotation to land winning segment at pointer
      const targetAngle = prizeIndex * segmentAngle
      const fullRotations = 360 * (5 + Math.floor(Math.random() * 3)) // 5-7 full spins
      const finalRotation = fullRotations - targetAngle // Rotate counter to target

      setRotation(finalRotation)

      setTimeout(() => {
        setBaseRotation(finalRotation % 360)
        setResult(data.prize)
        setShowResult(true)
        setSpinning(false)

        // Update from server response
        setUserTickets(data.newTickets)
        setUserCoins(data.newBalance)

        setHistory((prev) => [
          {
            id: Date.now().toString(),
            prize_name: data.prize.name,
            coins_won: data.prize.coins,
            spin_type: "ticket",
            created_at: new Date().toISOString(),
          },
          ...prev.slice(0, 9),
        ])

        // Confetti for big wins
        if (typeof confetti === "function") {
          if (data.prize.coins >= 100) {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
          } else if (data.prize.coins >= 25) {
            confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } })
          }
        }
      }, 5000)
    } catch (error) {
      console.error("Spin error:", error)
      setSpinning(false)
    }
  }

  const activePrizes = prizes.filter((p) => p.coins >= 0)
  const segmentAngle = activePrizes.length > 0 ? 360 / activePrizes.length : 45

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="md:ml-72 transition-all duration-300">
          <Header />
          <div className="p-6 flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="md:ml-72 transition-all duration-300">
        <Header />
        <div className="p-4 md:p-6">
          <LinkvertiseAd />
          {/* Header Stats */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-yellow-500" />
                Spin Wheel
              </h1>
              <p className="text-muted-foreground text-sm mt-1">Spin to win coins daily</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/20 border border-yellow-500/30">
                <img src={MARIO_COINS_GIF} alt="Coins" className="h-6 w-6 object-contain" />
                <span className="font-bold text-yellow-500">{userCoins.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 border border-primary/30">
                <img src={TICKET_ICON_3D} alt="Tickets" className="h-6 w-6 object-contain" />
                <span className="font-bold text-primary">{userTickets} Tickets</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Wheel Section */}
            <div className="lg:col-span-2 flex flex-col items-center">
              {activePrizes.length === 0 ? (
                <Card className="w-full">
                  <CardContent className="p-12 text-center">
                    <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-bold mb-2">No Prizes Available</h3>
                    <p className="text-muted-foreground mb-4">Prizes are being set up. Please check back soon!</p>
                    <Button onClick={fetchData} variant="outline">
                      <RotateCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
              {/* Wheel Container with 3D */}
              <div 
                className="relative w-72 h-72 md:w-96 md:h-96"
                style={{
                  transform: "perspective(1000px) rotateX(5deg)",
                  transformStyle: "preserve-3d"
                }}
              >
                {/* Outer glow ring */}
                <div 
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-500/30 via-orange-500/30 to-red-500/30 blur-2xl animate-pulse"
                  style={{ transform: "translateZ(-20px)" }}
                />

                {/* Wheel border */}
                <div 
                  className="absolute inset-0 rounded-full border-4 border-yellow-500/50 shadow-2xl shadow-yellow-500/20"
                  style={{ transform: "translateZ(10px)" }}
                />

                {/* Wheel */}
                <div
                  className="absolute inset-3 rounded-full overflow-hidden transition-transform"
                  style={{
                    transform: `translateZ(20px) rotate(${rotation}deg)`,
                    transitionDuration: spinning ? "5000ms" : "0ms",
                    transitionTimingFunction: "cubic-bezier(0.17, 0.67, 0.12, 0.99)",
                  }}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {activePrizes.map((prize, i) => {
                      const startAngle = i * segmentAngle
                      const endAngle = startAngle + segmentAngle
                      const startRad = (startAngle - 90) * (Math.PI / 180)
                      const endRad = (endAngle - 90) * (Math.PI / 180)

                      const x1 = 50 + 48 * Math.cos(startRad)
                      const y1 = 50 + 48 * Math.sin(startRad)
                      const x2 = 50 + 48 * Math.cos(endRad)
                      const y2 = 50 + 48 * Math.sin(endRad)

                      const largeArc = segmentAngle > 180 ? 1 : 0
                      const pathD = `M 50 50 L ${x1} ${y1} A 48 48 0 ${largeArc} 1 ${x2} ${y2} Z`

                      const midAngle = (startAngle + endAngle) / 2
                      const midRad = (midAngle - 90) * (Math.PI / 180)
                      const textX = 50 + 32 * Math.cos(midRad)
                      const textY = 50 + 32 * Math.sin(midRad)

                      const rarity = prize.rarity || getRarityFromCoins(prize.coins)
                      const color = RARITY_COLORS[rarity] || prize.color

                      return (
                        <g key={prize.id}>
                          <path d={pathD} fill={color} stroke="#1a1a2e" strokeWidth="0.5" />
                          <text
                            x={textX}
                            y={textY}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="white"
                            fontSize="5"
                            fontWeight="bold"
                            transform={`rotate(${midAngle}, ${textX}, ${textY})`}
                            style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
                          >
                            {prize.coins}
                          </text>
                        </g>
                      )
                    })}
                  </svg>
                </div>

                {/* Center coin - ANIMATED */}
                <div 
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ transform: "translateZ(40px)" }}
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-500/20 shadow-2xl flex items-center justify-center border-4 border-yellow-300/30 backdrop-blur-sm">
                    <img 
                      src={MARIO_COINS_GIF} 
                      alt="Coin" 
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                </div>

                {/* Pointer - positioned at right side (3 o'clock) */}
                <div 
                  className="absolute top-1/2 -right-2 transform -translate-y-1/2 z-10"
                  style={{ transform: "translateZ(50px) translateY(-50%)" }}
                >
                  <div className="w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-r-[20px] border-r-red-500 drop-shadow-lg" />
                </div>
              </div>

              {/* Spin Button */}
              <div className="mt-8 flex flex-col items-center gap-4">
                <Button
                  onClick={handleSpin}
                  disabled={spinning || !user || userTickets < 1}
                  size="lg"
                  className="px-12 py-6 text-xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 gap-3"
                >
                  {spinning ? (
                    <>
                      <RotateCw className="h-6 w-6 animate-spin" />
                      Spinning...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-6 w-6" />
                      SPIN ({userTickets} tickets)
                    </>
                  )}
                </Button>

                {/* Daily Claim */}
                {user && canClaimDaily && (
                  <Button
                    onClick={claimDailyTicket}
                    disabled={claiming}
                    variant="outline"
                    className="border-primary/50 hover:bg-primary/10 bg-transparent gap-2"
                  >
                    {claiming ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <img src={TICKET_ICON_3D} alt="Ticket" className="h-5 w-5 object-contain" />
                    )}
                    Claim Daily Ticket {streak > 0 && `(${streak} day streak)`}
                  </Button>
                )}

                {!user && <p className="text-sm text-muted-foreground">Sign in to spin the wheel</p>}
              </div>

              {/* Result Modal */}
              {showResult && result && (
                <div
                  className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
                  onClick={() => setShowResult(false)}
                >
                  <Card className="bg-card border-border max-w-sm mx-4 animate-in zoom-in-95">
                    <CardContent className="p-8 text-center">
                      <div className="mb-4">
                        <div
                          className="w-24 h-24 mx-auto rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: `${RARITY_COLORS[result.rarity || getRarityFromCoins(result.coins)]}30`,
                          }}
                        >
                          <img 
                            src={MARIO_COINS_GIF} 
                            alt="Prize" 
                            className="w-20 h-20 object-contain"
                          />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold mb-2">You Won!</h3>
                      <p className="text-4xl font-bold text-yellow-500 mb-2">+{result.coins} Coins</p>
                      <Badge
                        className="capitalize"
                        style={{
                          backgroundColor: `${RARITY_COLORS[result.rarity || getRarityFromCoins(result.coins)]}30`,
                          color: RARITY_COLORS[result.rarity || getRarityFromCoins(result.coins)],
                        }}
                      >
                        {result.rarity || getRarityFromCoins(result.coins)}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-4">Click anywhere to close</p>
                    </CardContent>
                  </Card>
                </div>
              )}
                </>
              )}
            </div>

            {/* Prize Pool & History */}
            <div className="space-y-4">
              {/* Prize Pool */}
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-bold">PRIZE POOL</h3>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {activePrizes.map((prize) => {
                      const rarity = prize.rarity || getRarityFromCoins(prize.coins)
                      return (
                        <div
                          key={prize.id}
                          className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-secondary/50"
                          style={{ backgroundColor: `${RARITY_COLORS[rarity]}15` }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: RARITY_COLORS[rarity] }} />
                            <span className="font-medium text-sm">{prize.name}</span>
                            {rarity === "legendary" && (
                              <Badge className="bg-yellow-500/20 text-yellow-400 text-xs px-1.5">JACKPOT</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <img src={MARIO_COINS_GIF} alt="Coins" className="w-5 h-5 object-contain" />
                            <span className="font-bold text-yellow-500">{prize.coins}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* History */}
              {user && history.length > 0 && (
                <Card className="bg-card/50 backdrop-blur border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <History className="w-5 h-5 text-primary" />
                      <h3 className="font-bold">YOUR HISTORY</h3>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {history.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                          <div>
                            <p className="text-sm font-medium">{item.prize_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(item.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <img src={MARIO_COINS_GIF} alt="Coins" className="w-4 h-4 object-contain" />
                            <span className="font-bold text-yellow-500 text-sm">{item.coins_won}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
