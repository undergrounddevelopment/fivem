"use client"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useCallback, useRef } from "react"
import { Loader2, Plus, Trophy, Crown, User } from "lucide-react"
import { CoinIcon, COIN_ICON_URL } from "@/components/coin-icon"
import Image from "next/image"

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

interface WinnerHistory {
  id: string
  user_id: string
  username: string
  avatar_url?: string
  prize_name: string
  coins_won: number
  created_at: string
}

// Wheel segment paths for 10 segments
const SEGMENT_PATHS = [
  "M862.865,5.263A10,10,0,0,1,872.863,15.44A873,873,0,0,1,715.237,500.565A10,10,0,0,1,701.166,502.922L486.728,347.123A10,10,0,0,1,484.368,333.364A588,588,0,0,0,587.808,15.008A10,10,0,0,1,597.805,5.263Z",
  "M694.979,511.437A10,10,0,0,1,697.086,525.547A873,873,0,0,1,284.414,825.371A10,10,0,0,1,271.645,819.007L189.737,566.92A10,10,0,0,1,195.916,554.401A588,588,0,0,0,466.726,357.646A10,10,0,0,1,480.541,355.639Z",
  "M261.635,822.26A10,10,0,0,1,255.046,834.914A873,873,0,0,1,-255.046,834.914A10,10,0,0,1,-261.635,822.26L-179.727,570.173A10,10,0,0,1,-167.37,563.677A588,588,0,0,0,167.37,563.677A10,10,0,0,1,179.727,570.173Z",
  "M-271.645,819.007A10,10,0,0,1,-284.414,825.371A873,873,0,0,1,-697.086,525.547A10,10,0,0,1,-694.979,511.437L-480.541,355.639A10,10,0,0,1,-466.726,357.646A588,588,0,0,0,-195.916,554.401A10,10,0,0,1,-189.737,566.92Z",
  "M-701.166,502.922A10,10,0,0,1,-715.237,500.565A873,873,0,0,1,-872.863,15.44A10,10,0,0,1,-862.865,5.263L-597.805,5.263A10,10,0,0,1,-587.808,15.008A588,588,0,0,0,-484.368,333.364A10,10,0,0,1,-486.728,347.123Z",
  "M-862.865,-5.263A10,10,0,0,1,-872.863,-15.44A873,873,0,0,1,-715.237,-500.565A10,10,0,0,1,-701.166,-502.922L-486.728,-347.123A10,10,0,0,1,-484.368,-333.364A588,588,0,0,0,-587.808,-15.008A10,10,0,0,1,-597.805,-5.263Z",
  "M-694.979,-511.437A10,10,0,0,1,-697.086,-525.547A873,873,0,0,1,-284.414,-825.371A10,10,0,0,1,-271.645,-819.007L-189.737,-566.92A10,10,0,0,1,-195.916,-554.401A588,588,0,0,0,-466.726,-357.646A10,10,0,0,1,-480.541,-355.639Z",
  "M-261.635,-822.26A10,10,0,0,1,-255.046,-834.914A873,873,0,0,1,255.046,-834.914A10,10,0,0,1,261.635,-822.26L179.727,-570.173A10,10,0,0,1,167.37,-563.677A588,588,0,0,0,-167.37,-563.677A10,10,0,0,1,-179.727,-570.173Z",
  "M271.645,-819.007A10,10,0,0,1,284.414,-825.371A873,873,0,0,1,697.086,-525.547A10,10,0,0,1,694.979,-511.437L480.541,-355.639A10,10,0,0,1,466.726,-357.646A588,588,0,0,0,195.916,-554.401A10,10,0,0,1,189.737,-566.92Z",
  "M701.166,-502.922A10,10,0,0,1,715.237,-500.565A873,873,0,0,1,872.863,-15.44A10,10,0,0,1,862.865,-5.263L597.805,-5.263A10,10,0,0,1,587.808,-15.008A588,588,0,0,0,484.368,-333.364A10,10,0,0,1,486.728,-347.123Z",
]

// Image positions for each segment
const IMAGE_POSITIONS = [
  { x: 741.82, y: 241.03, rt: 108 },
  { x: 458.47, y: 631.03, rt: 144 },
  { x: 0, y: 780, rt: 180 },
  { x: -458.47, y: 631.03, rt: 216 },
  { x: -741.82, y: 241.03, rt: 252 },
  { x: -741.82, y: -241.03, rt: 288 },
  { x: -458.47, y: -631.03, rt: 324 },
  { x: 0, y: -780, rt: 360 },
  { x: 458.47, y: -631.03, rt: 396 },
  { x: 741.82, y: -241.03, rt: 432 },
]

// Title paths for text on wheel
const TITLE_PATHS = [
  ["M690,0A690,690,0,0,1,558.22,405.57", "title_0"],
  ["M558.22,405.57A690,690,0,0,1,213.22,656.23", "title_1"],
  ["M213.22,656.23A690,690,0,0,1,-213.22,656.23", "title_2"],
  ["M-213.22,656.23A690,690,0,0,1,-558.22,405.57", "title_3"],
  ["M-558.22,405.57A690,690,0,0,1,-690,0", "title_4"],
  ["M-690,0A690,690,0,0,1,-558.22,-405.57", "title_5"],
  ["M-558.22,-405.57A690,690,0,0,1,-213.22,-656.23", "title_6"],
  ["M-213.22,-656.23A690,690,0,0,1,213.22,-656.23", "title_7"],
  ["M213.22,-656.23A690,690,0,0,1,558.22,-405.57", "title_8"],
  ["M558.22,-405.57A690,690,0,0,1,690,0", "title_9"],
]

// Drop rate paths
const DROPRATE_PATHS = [
  ["M650,0A650,650,0,0,1,525.86,382.06", "drop_0"],
  ["M525.86,382.06A650,650,0,0,1,200.86,618.19", "drop_1"],
  ["M200.86,618.19A650,650,0,0,1,-200.86,618.19", "drop_2"],
  ["M-200.86,618.19A650,650,0,0,1,-525.86,382.06", "drop_3"],
  ["M-525.86,382.06A650,650,0,0,1,-650,0", "drop_4"],
  ["M-650,0A650,650,0,0,1,-525.86,-382.06", "drop_5"],
  ["M-525.86,-382.06A650,650,0,0,1,-200.86,-618.19", "drop_6"],
  ["M-200.86,-618.19A650,650,0,0,1,200.86,-618.19", "drop_7"],
  ["M200.86,-618.19A650,650,0,0,1,525.86,-382.06", "drop_8"],
  ["M525.86,-382.06A650,650,0,0,1,650,0", "drop_9"],
]

// Default items with images
const DEFAULT_ITEMS = [
  { name: "5 Coins", coins: 5, dropRate: 30, image: "https://assets.codepen.io/3685267/wheel-of-fortune-lmvdrrhl.png" },
  { name: "10 Coins", coins: 10, dropRate: 25, image: "https://assets.codepen.io/3685267/wheel-of-fortune-lboxprxz.png" },
  { name: "25 Coins", coins: 25, dropRate: 15, image: "https://assets.codepen.io/3685267/wheel-of-fortune-gydimcwp.png" },
  { name: "50 Coins", coins: 50, dropRate: 12, image: "https://assets.codepen.io/3685267/wheel-of-fortune-csqvlgov.png" },
  { name: "100 Coins", coins: 100, dropRate: 8, image: "https://assets.codepen.io/3685267/wheel-of-fortune-nxffhdul.png" },
  { name: "250 Coins", coins: 250, dropRate: 5, image: "https://assets.codepen.io/3685267/wheel-of-fortune-xiquzhpo.png" },
  { name: "500 Coins", coins: 500, dropRate: 3, image: "https://assets.codepen.io/3685267/wheel-of-fortune-lmvdrrhl.png" },
  { name: "750 Coins", coins: 750, dropRate: 1.5, image: "https://assets.codepen.io/3685267/wheel-of-fortune-lboxprxz.png" },
  { name: "1000 Coins", coins: 1000, dropRate: 0.4, image: "https://assets.codepen.io/3685267/wheel-of-fortune-gydimcwp.png" },
  { name: "JACKPOT!", coins: 2500, dropRate: 0.1, image: "https://assets.codepen.io/3685267/wheel-of-fortune-csqvlgov.png" },
]

export default function SpinWheelPage() {
  const { user } = useAuth()
  const wheelRef = useRef<SVGGElement>(null)
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [spinning, setSpinning] = useState(false)
  const [wheelRotation, setWheelRotation] = useState(0)
  const [result, setResult] = useState<Prize | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [history, setHistory] = useState<SpinHistoryItem[]>([])
  const [userCoins, setUserCoins] = useState(0)
  const [userTickets, setUserTickets] = useState(0)
  const [loading, setLoading] = useState(true)
  const [canClaimDaily, setCanClaimDaily] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [winners, setWinners] = useState<WinnerHistory[]>([])

  // Items for display (use API prizes or defaults)
  const displayItems = prizes.length >= 10 
    ? prizes.slice(0, 10).map((p, i) => ({
        name: p.name,
        coins: p.coins,
        dropRate: p.probability || DEFAULT_ITEMS[i]?.dropRate || 10,
        image: p.image_url || DEFAULT_ITEMS[i]?.image || DEFAULT_ITEMS[0].image
      }))
    : DEFAULT_ITEMS

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      
      const prizesRes = await fetch("/api/spin-wheel/prizes", {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      
      if (prizesRes.ok) {
        const prizesData = await prizesRes.json()
        setPrizes(prizesData.prizes || [])
      }

      // Fetch public winners history
      const winnersRes = await fetch("/api/spin-wheel/winners")
      if (winnersRes.ok) {
        const winnersData = await winnersRes.json()
        setWinners(winnersData.winners || [])
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
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchData()
  }, [fetchData])


  const claimDailyTicket = async () => {
    if (claiming || !canClaimDaily) return
    setClaiming(true)

    try {
      const res = await fetch("/api/spin-wheel/claim-daily", { method: "POST" })
      const data = await res.json()

      if (data.success) {
        setUserTickets(data.newTickets)
        setCanClaimDaily(false)
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
      const res = await fetch("/api/spin-wheel/spin", { method: "POST" })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || "Spin failed")
        setSpinning(false)
        return
      }

      const data = await res.json()
      
      // Calculate spin animation
      const numSpins = 5 + Math.floor(Math.random() * 5)
      const segmentAngle = 36 // 360 / 10 segments
      const prizeIndex = displayItems.findIndex(item => item.coins === data.prize.coins)
      const targetAngle = prizeIndex * segmentAngle
      const targetRotation = wheelRotation + (numSpins * 360) + targetAngle + (Math.random() * 20 - 10)

      // Animate using requestAnimationFrame for smooth animation
      const startRotation = wheelRotation
      const duration = 5000
      const startTime = performance.now()

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Easing function - cubic ease out
        const easeOut = 1 - Math.pow(1 - progress, 3)
        const currentRotation = startRotation + (targetRotation - startRotation) * easeOut
        
        setWheelRotation(currentRotation)

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setResult(data.prize)
          setShowResult(true)
          setSpinning(false)
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
        }
      }

      requestAnimationFrame(animate)
    } catch (error) {
      console.error("Spin error:", error)
      setSpinning(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#161920" }}>
        <Loader2 className="h-12 w-12 animate-spin text-[#6579FE]" />
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{ 
        background: "#161920",
        backgroundImage: "url('/back1.png')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      {/* Main Wheel Area */}
      <div className="flex flex-col items-center justify-center min-h-[70vh] pt-8 px-4">
        {/* Balance Display */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center text-sm px-4 py-2 h-10 rounded-full bg-[#25282f] text-[#94979c] border-2 border-[#404859]">
            <CoinIcon size="sm" />
            <div className="ml-2 font-semibold text-base">
              <span className="text-white">{userCoins.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center text-sm px-4 py-2 h-10 rounded-full bg-[#25282f] text-[#94979c] border-2 border-[#404859]">
            <span className="text-white font-semibold">{userTickets} Tickets</span>
            {canClaimDaily && (
              <button 
                onClick={claimDailyTicket}
                disabled={claiming}
                className="ml-2 size-6 rounded-md grid place-items-center"
                style={{ background: "linear-gradient(180deg, #7A90FF 0%, #455AFF 100%)" }}
              >
                <Plus className="size-4 text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Wheel Container */}
        <div className="relative w-[600px] h-[600px] max-w-[90vw] max-h-[90vw]">
          <svg
            className="w-full h-full"
            viewBox="0 0 2000 2000"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Ring */}
            <mask id="ring-mask" fill="white">
              <path d="M1922 1005C1922 1514.21 1509.21 1927 1000 1927C490.793 1927 78 1514.21 78 1005C78 495.793 490.793 83 1000 83C1509.21 83 1922 495.793 1922 1005ZM471.592 1005C471.592 1296.83 708.168 1533.41 1000 1533.41C1291.83 1533.41 1528.41 1296.83 1528.41 1005C1528.41 713.168 1291.83 476.592 1000 476.592C708.168 476.592 471.592 713.168 471.592 1005Z" />
            </mask>
            <path
              d="M1922 1005C1922 1514.21 1509.21 1927 1000 1927C490.793 1927 78 1514.21 78 1005C78 495.793 490.793 83 1000 83C1509.21 83 1922 495.793 1922 1005ZM471.592 1005C471.592 1296.83 708.168 1533.41 1000 1533.41C1291.83 1533.41 1528.41 1296.83 1528.41 1005C1528.41 713.168 1291.83 476.592 1000 476.592C708.168 476.592 471.592 713.168 471.592 1005Z"
              style={{
                fill: "#272b35e8",
                stroke: "#3d445291",
                strokeWidth: "13px",
              }}
              mask="url(#ring-mask)"
            />

            {/* Rotating Wheel */}
            <g 
              ref={wheelRef}
              style={{ 
                transform: `rotate(${wheelRotation}deg)`,
                transformOrigin: "1000px 1000px"
              }}
            >
              <g transform="translate(1000, 1000)">
                {/* Segments */}
                {SEGMENT_PATHS.map((path, idx) => (
                  <path
                    key={idx}
                    d={path}
                    style={{
                      fill: "#343a46c2",
                      stroke: "#444c59c2",
                      strokeWidth: "6",
                    }}
                  />
                ))}

                {/* Title Paths and Text */}
                {TITLE_PATHS.map(([path, id], idx) => (
                  <g key={id}>
                    <path d={path} stroke="none" strokeWidth={5} id={id} fill="none" />
                    <text dy={20} fill="#fff" fontWeight="400" fontSize="32">
                      <textPath
                        xlinkHref={`#${id}`}
                        textAnchor="middle"
                        startOffset="50%"
                      >
                        {displayItems[idx]?.name || `${displayItems[idx]?.coins} Coins`}
                      </textPath>
                    </text>
                  </g>
                ))}

                {/* Drop Rate Paths and Text */}
                {DROPRATE_PATHS.map(([path, id], idx) => (
                  <g key={id}>
                    <path d={path} stroke="none" strokeWidth={5} id={id} fill="none" />
                    <text dy={16} fill="#8f939c" fontWeight="100" fontSize="26">
                      <textPath
                        xlinkHref={`#${id}`}
                        textAnchor="middle"
                        startOffset="50%"
                      >
                        {displayItems[idx]?.dropRate}% drop rate
                      </textPath>
                    </text>
                  </g>
                ))}

                {/* Images */}
                {IMAGE_POSITIONS.map((pos, idx) => (
                  <g key={idx} transform={`translate(${pos.x - 90}, ${pos.y - 90})`}>
                    <g transform={`rotate(${pos.rt}, 90, 90)`}>
                      <image
                        href={displayItems[idx]?.image}
                        height="180"
                        width="180"
                        className="transition-transform hover:scale-150"
                        style={{ transformOrigin: "center", transformBox: "fill-box" }}
                      />
                    </g>
                  </g>
                ))}
              </g>
            </g>

            {/* Pointer Arrow */}
            <g filter="url(#pointer-shadow)">
              <path
                d="M729.884 144.395C907.122 88.7643 1097.26 89.2052 1274.29 145.717L1274.76 145.872C1284.34 149.202 1289.59 159.486 1286.73 169.18L1286.59 169.648L1199.04 440.732C1195.86 450.593 1185.44 455.981 1175.66 453.146L1175.2 453.005C1062.09 417.106 940.707 416.827 827.473 452.165L824.799 453.007C815.044 456.103 804.522 450.918 801.109 441.2L800.952 440.734L713.403 169.651C710.179 159.666 715.663 148.924 725.7 145.72L729.884 144.395Z"
                fill="url(#pointer-gradient)"
              />
            </g>

            <defs>
              <filter id="pointer-shadow" x="708" y="98" width="594" height="370" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                <feOffset dx="5" dy="5" />
                <feGaussianBlur stdDeviation="4.7" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1" />
                <feBlend mode="normal" in="SourceGraphic" in2="effect1" result="shape" />
              </filter>
              <linearGradient id="pointer-gradient" x1="1000" y1="103" x2="1000" y2="454" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8D919C" />
                <stop offset="1" stopColor="#4F5563" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Display */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 flex items-center flex-col px-5 py-4 space-y-2 bg-[#272b35c2] text-[#7d8ba8] border-2 border-[#3d44528c] rounded-[23px]">
            <div className="text-base font-semibold text-white">Treasure Chest</div>
            <div className="text-center text-sm">
              Spin the wheel to win amazing prizes!
            </div>
            <div className="bg-[#7d8cff] pt-0.5 w-full rounded-lg">
              <button
                onClick={handleSpin}
                disabled={spinning || !user || userTickets < 1}
                className="text-base font-semibold w-full py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(180deg, #6579FE 0%, #3C57FF 100%)" }}
              >
                {spinning ? "Spinning..." : `Spin x1 (${userTickets} left)`}
              </button>
            </div>
            {!user && (
              <p className="text-xs text-[#94979c]">Sign in to spin</p>
            )}
          </div>
        </div>
      </div>

      {/* Winners History Sidebar */}
      <div className="fixed right-4 top-20 bottom-4 w-72 rounded-xl bg-[#282c37] border-2 border-[#3d4452] hidden xl:flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b-2 border-[#414653]">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="font-bold text-white">Recent Winners</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {winners.length === 0 ? (
            <p className="text-center text-[#94979c] text-sm py-4">No winners yet</p>
          ) : (
            winners.map((winner) => (
              <div key={winner.id} className="bg-[#1f232e] p-3 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    {winner.avatar_url ? (
                      <img
                        src={winner.avatar_url}
                        alt={winner.username}
                        className="w-10 h-10 rounded-full object-cover border-2 border-[#404859]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6579FE] to-[#3C57FF] flex items-center justify-center border-2 border-[#404859]">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                    {winner.coins_won >= 100 && (
                      <Crown className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{winner.username}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-400 font-bold text-sm">+{winner.coins_won}</span>
                      <Image src={COIN_ICON_URL} alt="coins" width={16} height={16} unoptimized />
                    </div>
                    <p className="text-[10px] text-[#667088] mt-1">
                      {new Date(winner.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mobile Winners - Bottom Bar */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-[#12161f] border-t-2 border-[#373e51] p-3">
        <div className="flex items-center gap-2 mb-2 justify-center">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-semibold text-white">Recent Winners</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {winners.slice(0, 5).map((winner) => (
            <div key={winner.id} className="flex-shrink-0 bg-[#1f232e] px-3 py-2 rounded-lg flex items-center gap-2">
              {winner.avatar_url ? (
                <img src={winner.avatar_url} alt={winner.username} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6579FE] to-[#3C57FF] flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-white truncate max-w-[80px]">{winner.username}</p>
                <p className="text-xs text-yellow-400 font-bold">+{winner.coins_won}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Result Modal */}
      {showResult && result && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setShowResult(false)}
        >
          <div className="bg-[#272b35] border-2 border-[#3d4452] rounded-2xl p-8 max-w-sm mx-4 text-center animate-in zoom-in-95">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#6579FE] to-[#3C57FF] flex items-center justify-center">
              <CoinIcon size="lg" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">You Won!</h3>
            <p className="text-4xl font-bold text-[#6579FE] mb-2">+{result.coins} Coins</p>
            <p className="text-sm text-[#94979c]">{result.name}</p>
            <p className="text-xs text-[#667088] mt-4">Click anywhere to close</p>
          </div>
        </div>
      )}
    </div>
  )
}
