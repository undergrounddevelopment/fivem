"use client"

import React, { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import useSWR from "swr"
import { Loader2, Sparkles, X, Gift, Package, Check, HelpCircle, Backpack, Plus } from "lucide-react"
import { defaultItems, f1, f2, f3, f4 } from "./wheel-data"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"

// --- Custom SVGs from the design to maintain 100% fidelity ---

function PawIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.5 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM9 8a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM15 8a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM19.5 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM17.34 14.86c-.87-1.02-1.6-1.89-2.48-2.91-.46-.54-1.05-1.08-1.75-1.32-.11-.04-.22-.07-.33-.09-.25-.04-.52-.04-.78-.04s-.53 0-.79.05c-.11.02-.22.05-.33.09-.7.24-1.28.78-1.75 1.32-.87 1.02-1.6 1.89-2.48 2.91-1.31 1.31-2.92 2.76-2.62 4.79.29 1.02 1.02 2.03 2.33 2.32.73.15 3.06-.44 5.54-.44h.18c2.48 0 4.81.58 5.54.44 1.31-.29 2.04-1.31 2.33-2.32.31-2.04-1.3-3.49-2.61-4.8z" fill="currentColor"/>
    </svg>
  )
}

function BallIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 3.3l1.35-.95a8.01 8.01 0 014.38 3.34l-.39 1.34-1.35.46L13 6.7V5.3zm-3.35-.95L11 5.3v1.4L7.01 9.49l-1.35-.46-.39-1.34a8.103 8.103 0 014.38-3.34zM7.08 17.11l-1.14.1A7.938 7.938 0 014 12c0-.12.01-.23.02-.35l1-.73 1.38.48 1.46 4.34-.78 1.37zm7.42 2.48c-.79.26-1.63.41-2.5.41-.87 0-1.71-.15-2.5-.41l-.69-1.49.64-1.1h5.11l.64 1.11-.7 1.48zM14.27 15H9.73l-1.35-4.02L12 8.44l3.63 2.54L14.27 15zm3.79 2.21l-1.14-.1-.79-1.37 1.46-4.34 1.39-.47 1 .73c.01.11.02.22.02.34 0 1.99-.73 3.81-1.94 5.21z" fill="currentColor"/>
    </svg>
  )
}

function CustomBellIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" fill="currentColor"/>
    </svg>
  )
}

// Fallback image in case of broken links
const FALLBACK_IMAGE = "https://assets.codepen.io/3685267/wheel-of-fortune-lmvdrrhl.png"
const TICKET_IMG = "https://assets.codepen.io/3685267/wheel-of-fortune-aetkeerk.png"
const COIN_IMG = "https://assets.codepen.io/3685267/wheel-of-fortune-smwdyono.png" // Crow Skull as generic fallback

interface Prize {
    id: string
    name: string
    type: string
    value: number
    color: string
    image_url?: string
}

// Win Modal Component
const WinModal = ({ isOpen, onClose, prize }: { isOpen: boolean; onClose: () => void; prize: Prize | null }) => {
    if (!prize) return null
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                >
                    <motion.div 
                        initial={{ scale: 0.5, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.5, opacity: 0, y: 50 }}
                        transition={{ type: "spring", damping: 15 }}
                        className="relative w-full max-w-md bg-[#151820] border border-white/10 rounded-2xl p-6 overflow-hidden text-center shadow-2xl shadow-yellow-500/10"
                    >
                        {/* Glow Effect */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-yellow-500/20 blur-[60px] -z-10" />

                        <div className="mb-6 relative inline-block">
                             <motion.div 
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                className="size-32 mx-auto bg-black/40 rounded-xl border border-white/10 flex items-center justify-center p-4 relative z-10"
                             >
                                <img src={prize.image_url || "https://r2.fivemanage.com/w7oyrZqqBoxEiG7UVDfhV/logo.gif"} className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]" />
                             </motion.div>
                             
                             {/* Star Burst */}
                             <Sparkles className="absolute -top-4 -right-4 text-yellow-500 w-8 h-8 animate-pulse" />
                             <Sparkles className="absolute -bottom-4 -left-4 text-yellow-500 w-6 h-6 animate-pulse delay-75" />
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">YOU WON!</h2>
                        <h3 className="text-xl font-medium text-yellow-400 mb-6">{prize.name || (prize as any).title}</h3>

                        <div className="flex flex-col gap-3">
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onClose}
                                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold rounded-xl shadow-lg shadow-yellow-500/20 transition-all font-mono tracking-wide"
                            >
                                CLAIM PRIZE
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default function SpinWheelPage() {
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [items, setItems] = useState(defaultItems)
  const [tickets, setTickets] = useState(0)
  const [cost, setCost] = useState(1)
  const [isEnabled, setIsEnabled] = useState(true)
  
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showInventory, setShowInventory] = useState(false)
  const [userItems, setUserItems] = useState<any[]>([])
  
  // Win Modal State
  const [showWinModal, setShowWinModal] = useState(false)
  const [winData, setWinData] = useState<{ prize: Prize, message: string } | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [inventory, setInventory] = useState<any[]>([])
  const [userCoins, setUserCoins] = useState(0)
  const [ticketPrice, setTicketPrice] = useState(500)
  const [isLoading, setIsLoading] = useState(true)

  const { user } = useAuth()

  const fetchUser = async () => {
    try {
        const resProfile = await fetch('/api/user/profile')
        if (resProfile.ok) {
            const profile = await resProfile.json()
            setUserCoins(profile.coins || 0)
            if (profile.spin_tickets !== undefined) setTickets(profile.spin_tickets)
        }
    } catch (e) {
        console.error("Failed to fetch user profile:", e)
    }
  }

  // Fetch prizes and user tickets
  useEffect(() => {
    async function fetchData() {
        try {
            const res = await fetch('/api/spin')
            if (res.ok) {
                const data = await res.json()
                if (data.prizes && data.prizes.length > 0) {
                     let mappedPrizes = data.prizes.map((p: any) => ({
                         title: p.name || p.title,
                         image: p.image_url || FALLBACK_IMAGE,
                         dropRate: (p.probability || p.drop_rate || 0).toString(),
                         price: (p.value || 0).toString(),
                         type: p.type,
                         color: p.color
                     }))

                     // Pad to 10 items to fit the wheel segments
                     while (mappedPrizes.length < 10) {
                         mappedPrizes.push({
                             title: "Zonk",
                             image: FALLBACK_IMAGE,
                             dropRate: "0",
                             price: "0",
                             type: "item",
                             color: "#666"
                         })
                     }
                     // If more than 10, slice to 10
                     if (mappedPrizes.length > 10) mappedPrizes = mappedPrizes.slice(0, 10)

                     setItems(mappedPrizes)
                }
                setTickets(data.userTickets || 0)
                if (data.config) {
                    setCost(Number(data.config.ticket_cost || 1))
                    setIsEnabled(data.config.is_enabled === 'true')
                    setTicketPrice(Number(data.config.ticket_price_coins || 500))
                }
            }
            
            // Fetch coins for the buy modal
            await fetchUser()
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }
    fetchData()
  }, [])

  const fetchHistory = async () => {
      try {
          const res = await fetch('/api/spin/history')
          if (res.ok) setHistory(await res.json())
      } catch (e) { console.error(e) }
  }

  const fetchInventory = async () => {
    if(!user?.id) return
    const supabase = createClient()
    const { data } = await supabase
        .from('spin_wheel_history')
        .select('*, spin_wheel_prizes(title, image_url, type, value, color)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
    
    if (data) {
         // Include items and tickets in inventory
         const items = data.filter((h: any) => 
            h.spin_wheel_prizes?.type === 'item' || 
            h.spin_wheel_prizes?.type === 'ticket' || 
            h.spin_wheel_prizes?.type === 'license'
         )
         setInventory(items)
    }
  }

  const handleClaim = async (historyId: string) => {
      toast.info("Processing claim...")
      try {
          const res = await fetch('/api/spin/claim', {
              method: 'POST',
              body: JSON.stringify({ history_id: historyId })
          })
          const json = await res.json()
          if(res.ok) {
              toast.success("Claim request sent! Admin will verify.")
              fetchInventory() // Refresh
          } else {
              toast.error(json.error || "Claim failed")
          }
      } catch(e) {
          toast.error("Network error")
      }
  }

  // Realtime Subscription for Balance & Winners
  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return

    // 1. Listen for current user balance changes
    let userChannel: any = null
    if (user?.id) {
        userChannel = supabase
          .channel(`daily_user_balance_${user.id}`)
          .on(
              'postgres_changes',
              {
                  event: 'UPDATE',
                  schema: 'public',
                  table: 'users',
                  filter: `discord_id=eq.${user?.id}`
              },
              (payload) => {
                  console.log("[DailySpin] Balance updated:", payload.new)
                  const newUser = payload.new as any
                  setUserCoins(newUser.coins || 0)
                  if (newUser.spin_tickets !== undefined) setTickets(newUser.spin_tickets)
              }
          )
          .subscribe()
    }

    // 2. Optional: Toast for global winners while on this page
    const historyChannel = supabase
      .channel('daily_live_winners')
      .on(
        'postgres_changes',
        {
            event: 'INSERT',
            schema: 'public',
            table: 'spin_wheel_history'
        },
        (payload) => {
            const newWinner = payload.new as any
            if (newWinner.user_id !== user?.id) {
                toast.info(`Another user just won ${newWinner.prize_name}!`)
            }
        }
      )
      .subscribe()

    // 3. Listen for Prize Updates (Admin Changes)
    const prizesChannel = supabase
      .channel('daily_prizes_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'spin_wheel_prizes'
        },
        () => {
          console.log("[DailySpin] Prizes updated, refreshing...")
          // Re-fetch all data including prizes and config
          async function refetchAllData() {
            try {
                const res = await fetch('/api/spin')
                if (res.ok) {
                    const data = await res.json()
                    if (data.prizes && data.prizes.length > 0) {
                         let mappedPrizes = data.prizes.map((p: any) => ({
                             title: p.name || p.title,
                             image: p.image_url || FALLBACK_IMAGE,
                             dropRate: (p.probability || p.drop_rate || 0).toString(),
                             price: (p.value || 0).toString(),
                             type: p.type,
                             color: p.color
                         }))
                         while (mappedPrizes.length < 10) {
                             mappedPrizes.push({
                                 title: "Zonk",
                                 image: FALLBACK_IMAGE,
                                 dropRate: "0",
                                 price: "0",
                                 type: "item",
                                 color: "#666"
                             })
                         }
                         if (mappedPrizes.length > 10) mappedPrizes = mappedPrizes.slice(0, 10)
                         setItems(mappedPrizes)
                    }
                    if (data.config) {
                        setCost(data.config.cost)
                        setIsEnabled(data.config.isEnabled)
                        setTicketPrice(data.config.ticketPriceCoins || 500)
                    }
                }
            } catch (e) {
                console.error("Failed to refetch prizes data:", e)
            }
          }
          refetchAllData()
        }
      )
      .subscribe()

    // 4. Listen for My History Updates (Claims)
    const myHistoryChannel = user?.id ? supabase
      .channel(`my_history_updates_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'spin_wheel_history',
          filter: `user_id=eq.${user.id}`
        },
        () => {
             // Refresh Inventory if active
             fetchInventory()
        }
      )
      .subscribe() : null

      // 3. Listen for global settings changes
      const settingsChannel = supabase
        .channel('spin_settings_sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'spin_settings' },
          (payload: any) => {
             // Handle both UPDATE and INSERT
             const item = payload.new || payload.old
             if (item.key === 'ticket_cost') setCost(Number(item.value))
             if (item.key === 'is_enabled') setIsEnabled(item.value === 'true')
             if (item.key === 'ticket_price_coins') setTicketPrice(Number(item.value))
          }
        )
        .subscribe()

      return () => {
        if (userChannel) supabase.removeChannel(userChannel)
        supabase.removeChannel(historyChannel)
        supabase.removeChannel(prizesChannel)
        if (myHistoryChannel) supabase.removeChannel(myHistoryChannel)
        supabase.removeChannel(settingsChannel)
      }
  }, [user?.id])

  // Fetch prizes and user tickets
  useEffect(() => {
    if (showHistoryModal) fetchHistory()
  }, [showHistoryModal])

  useEffect(() => {
    if (showInventory) fetchInventory()
  }, [showInventory])

  const handleSpin = async () => {
    if (spinning) return
    if (!isEnabled) {
        toast.error("Event is currently disabled.")
        return
    }
    
    setSpinning(true)

    try {
      const res = await fetch('/api/spin', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
          if (data.error && data.error.includes("Insufficient tickets")) {
              toast.error("Insufficient tickets! Buy more to spin.")
              setShowBuyModal(true)
          } else {
              toast.error(data.error || "Failed to spin")
          }
          setSpinning(false)
          return
      }
      
      setTickets(t => Math.max(0, t - cost))
      
      const wonPrize = data.prize
      const prizeIndex = items.findIndex(item => (item.title === (wonPrize.name || wonPrize.title)))
      const targetIndex = prizeIndex >= 0 ? prizeIndex : 0
      
      const segmentAngle = 360 / items.length
      const loops = 8 // More spins for dramatic effect
      const offset = 162 // Align Item 0 (108deg) to Pointer (270deg) -> 270 - 108 = 162
      
      // Calculate final rotation
      // random * 30 - 15 adds some randomness within the segment (segment is 36 deg)
      // We subtract because wheel rotates Clockwise (increasing degrees), so to bring a segment "back" to top, we need target.
      // Actually: Target Rotation = Current + Distance.
      // Position of Index i is (108 + i*36).
      // We want Position to be 270 (mod 360).
      // So (StartPos + Rotation) % 360 = 270.
      // Rotation = 270 - StartPos.
      // Rotation = 162 - i*36.
      // Add loops * 360.
      const spinAngle = loops * 360 + (162 - (targetIndex * segmentAngle)) + (Math.random() * 20 - 10)
      
      const newRotation = rotation + spinAngle

      setRotation(newRotation)
      
      // Pre-load audio objects to avoid lag during loop
      const tickAudio = new Audio("https://r2.fivemanage.com/w7oyrZqqBoxEiG7UVDfhV/tick-sound.mp3")
      tickAudio.volume = 0.2
      const winAudio = new Audio("https://r2.fivemanage.com/w7oyrZqqBoxEiG7UVDfhV/win-fanfare.mp3")
      winAudio.volume = 0.5

      // Play Spin Sound (Tick) - Simulating Ticks
      const totalTicks = 80 // 8 seconds roughly
      let tickCount = 0
      
      const tickInterval = setInterval(() => {
          if (tickCount >= totalTicks) {
              clearInterval(tickInterval)
          } else {
             // Play light tick sound - Reuse the same object for performance
             tickAudio.pause()
             tickAudio.currentTime = 0
             tickAudio.play().catch(e => {}) 
             tickCount++
          }
      }, 100)

      await new Promise(r => setTimeout(r, 8000)) // Match duration
      clearInterval(tickInterval)
      
      // Play Win Sound
      winAudio.play().catch(e => {})
      
      // Trigger Confetti safely
      try {
        const confetti = (await import("canvas-confetti")).default
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: [data.prize.color || '#FCD34D', '#ffffff', '#FFD700'],
            zIndex: 9999
        })
      } catch (e) {
        console.warn("Confetti failed to load", e)
      }

      // Show Win Modal
      setWinData({
          prize: data.prize,
          message: data.message
      })
      setShowWinModal(true)
      
      // Refresh balance in case of coin win or ticket win
      await fetchUser()
      setSpinning(false)
      // Also refresh tickets if won tickets
      if(data.prize.type === 'ticket') {
          setTickets(t => t + data.prize.value)
      }
      
    } catch(e) {
      console.error(e)
      toast.error("An unexpected error occurred")
      setSpinning(false)
    } finally {
      setSpinning(false)
    }
  }

  // ... existing logic ...

  return (
    <div className="w-full relative min-h-[85vh] bg-[#161920] rounded-3xl overflow-hidden shadow-2xl border border-white/5 font-sans">
      <style jsx global>{`
        /* Scoped background for this container if needed, or just inline */
        .wheel-bg-pattern {
          background-image: url('https://assets.codepen.io/3685267/wheel-of-fortune-smwdyono.png');
          background-repeat: repeat;
          background-size: 500px 500px;
        }
        .circ-title { stroke: none; fill: #fff; font-weight: 400; font-size: 32px; }
        .circl-desc { stroke: none; fill: #8f939c; font-weight: 100; font-size: 26px; }
        .scale-on-hover { transition: transform 0.3s ease-in-out; transform-origin: center; transform-box: fill-box; }
        .scale-on-hover:hover { transform: scale(1.2); }
        .plus-icon-bg { background: linear-gradient(180deg, #7A90FF 0%, #455AFF 100%); }
        .buy-button { background: linear-gradient(180deg, #6579FE 0%, #3C57FF 100%); border-radius: 8px; }
        .cancel-button { background: #2f3647; border-radius: 8px; }
        .glass-modal { background: rgba(30, 34, 45, 0.95); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); }
      `}</style>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 wheel-bg-pattern opacity-100 pointer-events-none"></div>

      {/* Page Header (Local) */}
      <div className="relative z-20 flex justify-between items-center p-6 bg-gradient-to-b from-black/40 to-transparent">
        <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-600/20 rounded-xl border border-blue-500/30">
                <img src="https://assets.codepen.io/3685267/wheel-of-fortune-fxjdpdcn.png" className="size-8 object-contain" />
             </div>
             <div>
                <h1 className="text-2xl font-bold text-white">Daily Spin</h1>
                <p className="text-xs text-gray-400">Test your luck daily!</p>
             </div>
        </div>
        <div className="flex items-center gap-3">
             <div className="hidden md:flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg border border-white/5">
                 <span className="text-xs text-gray-400">Tickets:</span>
                 <span className="font-bold text-purple-400">{tickets}</span>
                 <button onClick={() => setShowBuyModal(true)} className="ml-2 bg-blue-600 hover:bg-blue-500 p-1 rounded transition-colors"><Plus className="size-3"/></button>
             </div>
             <button onClick={() => setShowHistoryModal(true)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors border border-white/5">
                History
             </button>
             <button onClick={() => setShowInventory(true)} className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 rounded-lg text-sm font-bold transition-all shadow-lg flex items-center gap-2">
                <Backpack className="size-4" /> Inventory
             </button>
        </div>
      </div>

      {/* Main Wheel Area */}
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-[#161920] z-40">
            <div className="flex flex-col items-center gap-4">
                 <Loader2 className="size-10 text-blue-500 animate-spin" />
                 <p className="text-gray-400">Loading Royal Game...</p>
            </div>
        </div>
      ) : (
      <div className="absolute inset-0 flex justify-center items-center overflow-hidden z-10 pointer-events-none top-10">
         <div className="relative size-[600px] md:size-[700px] lg:size-[740px] scale-[0.6] md:scale-75 lg:scale-90 xl:scale-90 pointer-events-auto">
             {/* ... SVG Wheel Content ... */}
            <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-[100px] -z-10"></div>
            <svg className="absolute inset-0" viewBox="0 0 2000 2000" fill="none" xmlns="http://www.w3.org/2000/svg">
                <mask id="wheel-mask" fill="white">
                     <path d="M1922 1005C1922 1514.21 1509.21 1927 1000 1927C490.793 1927 78 1514.21 78 1005C78 495.793 490.793 83 1000 83C1509.21 83 1922 495.793 1922 1005ZM471.592 1005C471.592 1296.83 708.168 1533.41 1000 1533.41C1291.83 1533.41 1528.41 1296.83 1528.41 1005C1528.41 713.168 1291.83 476.592 1000 476.592C708.168 476.592 471.592 713.168 471.592 1005Z" />
                </mask>
                <motion.g 
                    style={{ transformOrigin: "1000px 1000px" }}
                    initial={{ rotate: 0 }}
                    animate={{ rotate: rotation }} 
                    transition={{ 
                        duration: 8, 
                        ease: [0.25, 0.1, 0.25, 1] 
                    }}
                >
                    <path d="M1922 1005C1922 1514.21 1509.21 1927 1000 1927C490.793 1927 78 1514.21 78 1005C78 495.793 490.793 83 1000 83C1509.21 83 1922 495.793 1922 1005ZM471.592 1005C471.592 1296.83 708.168 1533.41 1000 1533.41C1291.83 1533.41 1528.41 1296.83 1528.41 1005C1528.41 713.168 1291.83 476.592 1000 476.592C708.168 476.592 471.592 713.168 471.592 1005Z" style={{ fill: "#272b35e8", stroke: "#3d445291", strokeWidth: "13px" }} />
                    <g transform="translate(1000, 1000)">
                        {f1.map((d, i) => <path key={`seg-${i}`} d={d} style={{fill: "#1e293b", stroke: "#334155", strokeWidth: "6"}} />)}
                        {f3.map(([path, id], idx) => (<React.Fragment key={`title-${idx}`}><path d={path} stroke="none" strokeWidth={5} id={id} /><text dy={20} className="circ-title"><textPath xlinkHref={`#${id}`} textAnchor="middle" startOffset="50%" style={{ textAnchor: "middle" }}>{items[idx] ? items[idx].title : ''}</textPath></text></React.Fragment>))}
                        {/* Drop rates hidden from users - only visible in admin panel */}
{f2.map(({x, y, rt}, idx) => (<g key={`img-${idx}`} transform={`translate(${x-90}, ${y-90})`}><g transform={`rotate(${rt}, 90, 90)`}><image href={items[idx] && items[idx].image ? items[idx].image : FALLBACK_IMAGE} onError={(e: any) => { e.target.href.baseVal = FALLBACK_IMAGE }} height="180" width="180" className="scale-on-hover"/></g></g>))}
                    </g>
                </motion.g>
                <g filter="url(#filter0_d_28_19)">
                  <path d="M729.884 144.395C907.122 88.7643 1097.26 89.2052 1274.29 145.717L1274.76 145.872C1284.34 149.202 1289.59 159.486 1286.73 169.18L1286.59 169.648L1199.04 440.732C1195.86 450.593 1185.44 455.981 1175.66 453.146L1175.2 453.005C1062.09 417.106 940.707 416.827 827.473 452.165L824.799 453.007C815.044 456.103 804.522 450.918 801.109 441.2L800.952 440.734L713.403 169.651C710.179 159.666 715.663 148.924 725.7 145.72L729.884 144.395ZM1252.1 172.325C1087.72 122.557 912.272 122.559 747.895 172.328L827.473 418.729C876.16 404.401 926.189 396.267 976.399 394.327C976.597 393.926 976.852 393.537 977.176 393.174L996.768 371.189C998.756 368.958 1002.24 368.958 1004.23 371.189L1023.82 393.174C1024.16 393.549 1024.42 393.951 1024.62 394.366C1074.49 396.376 1124.16 404.497 1172.52 418.728L1252.1 172.325Z" fill="url(#paint0_linear_28_19)" />
                </g>
                <defs>
                   <filter id="filter0_d_28_19" x="708.079" y="98.6" width="593.833" height="369.701" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB"><feFlood floodOpacity="0" result="BackgroundImageFix" /><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" /><feOffset dx="5" dy="5" /><feGaussianBlur stdDeviation="4.7" /><feComposite in2="hardAlpha" operator="out" /><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" /><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_28_19" /><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_28_19" result="shape" /></filter>
                   <linearGradient id="paint0_linear_28_19" x1="999.996" y1="103" x2="999.996" y2="453.901" gradientUnits="userSpaceOnUse"><stop stopColor="#8D919C" /><stop offset="1" stopColor="#4F5563" /></linearGradient>
                </defs>
            </svg> 
             <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform w-80 flex items-center flex-col px-5 py-4 space-y-2 bg-[#1b2230] text-[#7d8ba8] border-[2px] border-[#3b82f68c] rounded-[23px] shadow-[0_0_50px_rgba(59,130,246,0.2)] z-50">
               <div className="text-xl font-bold text-white tracking-widest uppercase">Elite Chest</div>
               <div className="text-center text-xs opacity-60">Win Premium Tools & Coins</div>
               <button onClick={handleSpin} disabled={spinning} className="w-full py-3 mt-2 text-base font-bold text-white uppercase tracking-wider buy-button shadow-lg transform transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {spinning ? <Loader2 className="animate-spin" /> : `Spin x ${cost} Ticket${cost > 1 ? 's' : ''}`}
               </button>
            </div>
         </div>
      </div>
      )}



       {/* Bottom Bar: Prizes List - Adjusted positioning */}
       <div className="absolute bottom-0 inset-x-0 bg-[#12161f]/90 border-t border-[#373e51] z-30 hidden lg:block backdrop-blur-md">
            <div className="flex justify-center -mt-3.5"> <div className="bg-[#12161f] text-[#667088] px-4 font-semibold text-xs border border-[#373e51] rounded-full uppercase py-1">Items from the chest</div> </div>
            <div className="flex gap-4 p-4 overflow-x-auto justify-center">
                 {items.slice(0, 8).map((item, i) => (
                     <div key={i} className="flex-shrink-0 w-32 bg-[#212530] border border-[#393f51] rounded-md p-3 pt-8 relative flex flex-col items-center group">
                          <img src={item.image || FALLBACK_IMAGE} onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE }} className="size-16 object-cover absolute -top-6 group-hover:scale-110 transition-transform duration-300"/>
                          <span className="text-white text-xs font-semibold text-center mt-2 line-clamp-1">{item.title}</span>
                          {/* Drop rate hidden - users only see prize name */}
                          <span className="text-[10px] text-[#667088] mt-1">Prize</span>
                     </div>
                 ))}
            </div>
       </div>

       {/* Buy Tickets Modal */}
       <AnimatePresence>
            {showBuyModal && (
                <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.div initial={{scale: 0.95}} animate={{scale: 1}} exit={{scale: 0.95}} className="w-full max-w-sm glass-modal rounded-xl p-6 shadow-2xl relative">
                        <button onClick={() => setShowBuyModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><div className="rotate-45"><Plus/></div></button>
                        <h2 className="text-xl font-bold mb-4">Buy Tickets</h2>
                        <BuyTicketForm coins={userCoins} price={ticketPrice} onSuccess={(t, c) => { setTickets(tickets+t); setUserCoins(c); setShowBuyModal(false); }} />
                    </motion.div>
                </motion.div>
            )}
       </AnimatePresence>

       {/* History Modal */}
       <AnimatePresence>
            {showHistoryModal && (
                <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                     <motion.div initial={{scale: 0.95}} animate={{scale: 1}} exit={{scale: 0.95}} className="w-full max-w-md glass-modal rounded-xl p-6 shadow-2xl relative max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                           <h2 className="text-xl font-bold">My History</h2>
                           <button onClick={() => setShowHistoryModal(false)} className="text-gray-400 hover:text-white"><div className="rotate-45"><Plus/></div></button>
                        </div>
                         <div className="overflow-y-auto flex-1 space-y-2 pr-2 custom-scrollbar">
                           {history.length === 0 ? (
                               <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                                   <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-2">
                                        <img src={FALLBACK_IMAGE} className="w-10 h-10 grayscale opacity-30" />
                                   </div>
                                   <p className="text-gray-500 text-sm">No spin history found.<br/>Start your winning streak today!</p>
                               </div>
                           ) : (
                               history.map((h, i) => (
                               <div key={i} className="flex items-center justify-between bg-[#1c1f2e]/50 hover:bg-[#252935] p-3 rounded-xl border border-white/5 transition-all group">
                                   <div className="flex items-center gap-3">
                                       <div className={`size-12 rounded-xl flex items-center justify-center border border-white/5 ${h.claim_status === 'auto_awarded' ? 'bg-yellow-500/10' : 'bg-black/20'}`}>
                                           <img src={(h as any).prize?.image_url || FALLBACK_IMAGE} onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE }} className="size-8 object-contain group-hover:scale-110 transition-transform duration-300"/>
                                       </div>
                                       <div>
                                           <div className="font-semibold text-sm text-white group-hover:text-blue-400 transition-colors">{h.prize_name || (h as any).prize?.name || "Mystery Item"}</div>
                                           <div className="text-[10px] text-gray-500 font-mono mt-0.5">{new Date(h.created_at).toLocaleString()}</div>
                                       </div>
                                   </div>
                                    {(h.prize_value > 0 || (h as any).prize?.value > 0) && (
                                        <div className={`text-xs font-bold px-2.5 py-1 rounded-lg border shadow-sm flex items-center gap-1.5 ${(h as any).prize?.type === 'ticket' ? 'text-purple-400 bg-purple-500/10 border-purple-500/20' : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'}`}>
                                            +{(h.prize_value || (h as any).prize?.value).toLocaleString()} 
                                            <img src={(h as any).prize?.type === 'ticket' ? TICKET_IMG : COIN_IMG} className="size-3.5 object-contain" />
                                        </div>
                                    )}
                               </div>
                           ))
                           )}
                         </div>
                    </motion.div>
                </motion.div>
            )}
       </AnimatePresence>
            {/* Win Modal */}
            <WinModal 
                isOpen={showWinModal} 
                onClose={() => setShowWinModal(false)} 
                prize={winData?.prize || null} 
            />

        {/* Inventory Modal */}
        <AnimatePresence>
             {showInventory && (
                 <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                      <motion.div initial={{scale: 0.95}} animate={{scale: 1}} exit={{scale: 0.95}} className="w-full max-w-2xl glass-modal rounded-xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
                         <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                                    <Backpack className="size-6 text-emerald-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">My Inventory</h2>
                                    <p className="text-xs text-gray-400">Claim your won items here</p>
                                </div>
                            </div>
                            <button onClick={() => setShowInventory(false)} className="text-gray-400 hover:text-white"><div className="rotate-45"><Plus/></div></button>
                         </div>
                         
                         <div className="overflow-y-auto flex-1 p-1 custom-scrollbar">
                            {inventory.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                    <Backpack className="size-16 text-gray-700" />
                                    <p className="text-gray-500">Your inventory is empty.<br/>Spin the wheel to win items!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {inventory.map((item, i) => {
                                        const isAuto = item.claim_status === 'auto_awarded'
                                        const isClaimed = item.claim_status === 'claimed'
                                        const isPending = item.claim_status === 'pending'
                                        const isUnclaimed = !item.claim_status || item.claim_status === 'unclaimed'
                                        
                                        return (
                                        <div key={i} className="flex gap-4 p-3 rounded-xl bg-[#151820] border border-white/5 hover:border-white/10 transition-colors">
                                            <div className="size-20 bg-black/40 rounded-lg border border-white/5 flex items-center justify-center flex-shrink-0 relative">
                                                <img src={item.spin_wheel_prizes?.image_url || FALLBACK_IMAGE} className="size-14 object-contain" onError={(e) => e.currentTarget.src = FALLBACK_IMAGE} />
                                                {item.spin_wheel_prizes?.type === 'ticket' && (
                                                    <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-purple-400">
                                                        x{item.prize_value || item.spin_wheel_prizes?.value}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <h3 className="font-bold text-white leading-tight">{item.prize_name || item.spin_wheel_prizes?.title}</h3>
                                                    <p className="text-xs text-gray-500 mt-1">Won: {new Date(item.created_at).toLocaleDateString()}</p>
                                                </div>
                                                
                                                <div className="mt-2 text-right">
                                                    {isAuto && (
                                                        <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-md text-xs font-medium flex items-center gap-1 w-fit ml-auto">
                                                            <Check className="size-3" /> Received
                                                        </span>
                                                    )}
                                                    {isUnclaimed && !isAuto && (
                                                        <button 
                                                            onClick={() => handleClaim(item.id)}
                                                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-md transition-colors shadow-lg shadow-emerald-500/20"
                                                        >
                                                            Claim Prize
                                                        </button>
                                                    )}
                                                    {isPending && (
                                                        <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-md text-xs font-medium flex items-center gap-1 w-fit ml-auto">
                                                            <Loader2 className="size-3 animate-spin" /> Pending
                                                        </span>
                                                    )}
                                                    {isClaimed && (
                                                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-xs font-medium flex items-center gap-1 w-fit ml-auto">
                                                            <Check className="size-3" /> Claimed
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        )
                                    })}
                                </div>
                            )}
                         </div>
                      </motion.div>
                 </motion.div>
             )}
        </AnimatePresence>
    </div>
  )
}

function BuyTicketForm({ coins, price, onSuccess }: { coins: number, price: number, onSuccess: (amt: number, coins: number) => void }) {
    const [qty, setQty] = useState(1)
    const [loading, setLoading] = useState(false)
    const PRICE = price
    const maxAffordable = Math.max(0, Math.floor(coins / PRICE))

    const handleBuy = async () => {
        if (qty > maxAffordable) {
             toast.error("Insufficient coins!")
             return
        }
        setLoading(true)
        try {
            const res = await fetch('/api/spin/buy-tickets', {
                method: 'POST',
                body: JSON.stringify({ quantity: qty })
            })
            const data = await res.json()
            if (res.ok) {
                toast.success(data.message)
                onSuccess(qty, data.newCoins)
            } else {
                toast.error(data.error)
            }
        } catch (e) {
            toast.error("Failed to purchase")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden bg-gradient-to-br from-[#1c1f2e] to-[#161821] rounded-2xl p-4 border border-white/5 shadow-inner group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <img src="https://assets.codepen.io/3685267/wheel-of-fortune-aetkeerk.png" className="w-16 h-16" />
                </div>
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Your Balance</div>
                <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-amber-500 font-mono flex items-center gap-2">
                    <img src={COIN_IMG} className="size-6 object-contain" />
                    <span>{coins.toLocaleString()}</span>
                </div>
            </div>
            
            <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <label className="font-medium text-gray-300">Quantity</label>
                    <span className="text-purple-400 text-xs bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">{PRICE.toLocaleString()} Coins / Ticket</span>
                </div>
                
                {/* Quick Select Buttons */}
                <div className="grid grid-cols-4 gap-2">
                    {[1, 5, 10].map(n => (
                        <button 
                            key={n}
                            onClick={() => setQty(n)}
                            className={`py-2 rounded-lg text-sm font-medium transition-all ${
                                qty === n 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                                : 'bg-[#25282f] text-gray-400 hover:bg-[#2e323b] hover:text-white border border-white/5'
                            }`}
                        >
                            {n}
                        </button>
                    ))}
                    <button 
                        onClick={() => setQty(maxAffordable)}
                        className={`py-2 rounded-lg text-sm font-medium transition-all ${
                           qty === maxAffordable && qty > 10
                           ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20'
                           : 'bg-[#25282f] text-amber-500 hover:bg-amber-900/20 border border-amber-500/20'
                        }`}
                    >
                        Max
                    </button>
                </div>

                <div className="flex gap-2">
                     <button onClick={() => setQty(Math.max(1, qty-1))} className="size-12 rounded-xl bg-[#1c1f2e] border border-white/10 hover:border-white/20 hover:bg-[#252935] flex items-center justify-center transition-colors">
                        <span className="text-xl text-gray-400">-</span>
                     </button>
                     <div className="flex-1 bg-black/30 border border-white/10 rounded-xl flex items-center justify-center relative group focus-within:border-blue-500/50 transition-colors">
                        <input 
                            type="number" 
                            value={qty} 
                            onChange={e => setQty(Math.max(1, parseInt(e.target.value)||1))} 
                            className="w-full bg-transparent text-center text-xl font-bold outline-none text-white z-10" 
                        />
                        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-focus-within:opacity-100 rounded-xl transition-opacity pointer-events-none" />
                     </div>
                     <button onClick={() => setQty(qty+1)} className="size-12 rounded-xl bg-[#1c1f2e] border border-white/10 hover:border-white/20 hover:bg-[#252935] flex items-center justify-center transition-colors">
                        <span className="text-xl text-gray-400">+</span>
                     </button>
                </div>
            </div>

            <div className="pt-2 border-t border-white/5 space-y-3">
                <div className="flex justify-between items-end">
                    <span className="text-sm text-gray-400">Total Cost</span>
                    <div className={`text-xl font-bold flex items-center gap-1.5 ${qty * PRICE > coins ? 'text-red-400' : 'text-white'}`}>
                        <img src={COIN_IMG} className="size-4 object-contain" />
                        <span>{(qty * PRICE).toLocaleString()}</span>
                    </div>
                </div>
                <button 
                    onClick={handleBuy} 
                    disabled={loading || (qty * PRICE) > coins} 
                    className="w-full h-12 buy-button font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_25px_rgba(59,130,246,0.5)] active:scale-[0.98] transition-all rounded-xl"
                >
                    {loading ? <Loader2 className="animate-spin size-5" /> : "Confirm Purchase"}
                </button>
                {(qty * PRICE) > coins && (
                    <p className="text-xs text-center text-red-500/80 animate-pulse">Insufficient balance. Earn more coins!</p>
                )}
            </div>
        </div>
    )
}
