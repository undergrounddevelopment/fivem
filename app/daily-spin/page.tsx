
"use client"

import React, { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import useSWR from "swr"
import { 
  ChevronDown, 
  Search, 
  ExternalLink, 
  MoreVertical, 
  Send,
  Plus,
  Loader2
} from "lucide-react"
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

import { defaultItems, f1, f2, f3, f4 } from "./wheel-data"

export default function SpinWheelPage() {
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [items, setItems] = useState(defaultItems)
  const [tickets, setTickets] = useState(0)
  const [cost, setCost] = useState(1)
  const [isEnabled, setIsEnabled] = useState(true)
  
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [userCoins, setUserCoins] = useState(0)
  const [ticketPrice, setTicketPrice] = useState(500)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch prizes and user tickets
  useEffect(() => {
    async function fetchData() {
        try {
            const res = await fetch('/api/spin')
            if (res.ok) {
                const data = await res.json()
                if (data.prizes && data.prizes.length > 0) {
                     const mappedPrizes = data.prizes.map((p: any) => ({
                         title: p.name || p.title,
                         image: p.image_url,
                         dropRate: (p.probability || p.drop_rate || 0).toString(),
                         price: (p.value || 0).toString()
                     }))
                     setItems(mappedPrizes)
                }
                setTickets(data.userTickets || 0)
                if (data.config) {
                    setCost(data.config.cost)
                    setIsEnabled(data.config.isEnabled)
                    setTicketPrice(data.config.ticketPriceCoins || 500)
                }
            }
            
            // Fetch coins for the buy modal
            const resProfile = await fetch('/api/user/profile')
            if (resProfile.ok) {
                const profile = await resProfile.json()
                setUserCoins(profile.coins || 0)
            }
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

  const { user } = useAuth()

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
                  filter: `id=eq.${user.id}`
              },
              (payload) => {
                  console.log("[DailySpin] Balance updated:", payload.new)
                  const newUser = payload.new as any
                  setUserCoins(newUser.coins || 0)
                  if (newUser.tickets !== undefined) setTickets(newUser.tickets)
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

    return () => {
      if (userChannel) supabase.removeChannel(userChannel)
      supabase.removeChannel(historyChannel)
    }
  }, [user?.id])

  // Fetch prizes and user tickets
  useEffect(() => {
    if (showHistoryModal) fetchHistory()
  }, [showHistoryModal])

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

      const prizeIndex = items.findIndex(item => item.title === data.prize.title)
      const targetIndex = prizeIndex >= 0 ? prizeIndex : 0
      
      const segmentAngle = 360 / items.length
      const loops = 5
      
      const targetRotation = loops * 360 - (targetIndex * segmentAngle) + (Math.random() * 20 - 10)
      const newRotation = rotation + targetRotation + 3600

      setRotation(newRotation)
      
      await new Promise(r => setTimeout(r, 4000))
      
      toast.success(data.message)
      // Refresh balance in case of coin win or ticket win
      const resProfile = await fetch('/api/user/profile')
      if (resProfile.ok) {
           const profile = await resProfile.json()
           setUserCoins(profile.coins || 0)
      }
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

  return (
    <div className="bg-[#161920] min-h-screen text-white overflow-hidden font-sans">
      <style jsx global>{`
        body {
          background-color: #161920;
          background-image: url('https://assets.codepen.io/3685267/wheel-of-fortune-smwdyono.png');
          background-repeat: repeat;
          background-size: 500px 500px;
        }
        /* ... existing styles ... */
        .circ-title { stroke: none; fill: #fff; font-weight: 400; font-size: 32px; }
        .circl-desc { stroke: none; fill: #8f939c; font-weight: 100; font-size: 26px; }
        .scale-on-hover { transition: transform 0.3s ease-in-out; transform-origin: center; transform-box: fill-box; }
        .scale-on-hover:hover { transform: scale(1.2); }
        .plus-icon-bg { background: linear-gradient(180deg, #7A90FF 0%, #455AFF 100%); }
        .buy-button { background: linear-gradient(180deg, #6579FE 0%, #3C57FF 100%); border-radius: 8px; }
        .cancel-button { background: #2f3647; border-radius: 8px; }
        .glass-modal { background: rgba(30, 34, 45, 0.95); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); }
      `}</style>
      
      {/* Sidebar Left ... */}
      <div className="w-64 fixed inset-y-0 left-0 pt-16 bg-[#242834] hidden xl:block z-20 border-r border-[#3b4253]">
        <div className="px-4 flex items-center justify-between">
          <span className="font-semibold text-white">Royal Game</span>
           <button onClick={() => setShowHistoryModal(true)} className="border border-[#3f4453] px-2 py-0.5 rounded-full text-[#9198ae] text-xs hover:text-white hover:border-white transition-colors">History</button>
        </div>
        <div className="flex flex-col space-y-3 mt-4 px-4">
             {/* ... existing sidebar items ... */}
            <div className="bg-[#1d212c] text-[#93969d] flex items-center px-1 py-1 rounded-md cursor-pointer hover:bg-[#2e3442] transition-colors">
                 <img src="https://assets.codepen.io/3685267/wheel-of-fortune-xvtrdzgw.png" className="size-8 object-cover"/>
                 <div className="ml-2 font-semibold text-sm">Dashboard</div>
            </div>
            <div className="bg-[#8291f2] pt-0.5 rounded-md cursor-pointer">
                <div className="flex items-center px-1 py-1 rounded-md bg-gradient-to-b from-[#667AFF] to-[#3951E5] text-white">
                    <img src="https://assets.codepen.io/3685267/wheel-of-fortune-zileulop.png" className="size-8 object-cover"/>
                     <div className="ml-2 font-semibold text-sm">Daily Spin</div>
                </div>
            </div>
        </div>
      </div>

      {/* Navbar */}
      <div className="bg-[#31353e] text-[#393f4d] border-b border-b-[#3b4253] fixed inset-x-0 top-0 h-16 flex items-center px-4 z-30 justify-between">
        <div className="flex items-center">
            <img src="https://assets.codepen.io/3685267/wheel-of-fortune-fxjdpdcn.png" alt="" className="size-11 object-cover shrink-0" />
            <span className="shrink-0 ml-2 uppercase font-bold text-lg text-white hidden sm:block">Wager</span>
        </div>
        
        {/* Ticket & Coin Balance */}
        <div className="flex items-center gap-4">
             {/* Tickets */}
             <div className="flex items-center text-xs pl-2 pr-2 h-9 rounded-full relative bg-[#25282f] text-[#94979c] border-[2px] border-[#404859e5] group">
                <div className="size-6 bg-purple-500/20 rounded-full flex items-center justify-center mr-2">
                    <span className="text-purple-400 font-bold">T</span>
                </div>
                <div className="text-base font-semibold mr-2 text-white">{tickets}</div>
                <div 
                    onClick={() => setShowBuyModal(true)}
                    className="size-6 bg-blue-600 rounded-md grid place-items-center cursor-pointer hover:bg-blue-500 transition-colors"
                >
                    <Plus className="size-3 text-white"/>
                </div>
             </div>

             {/* Coins */}
             <div className="hidden md:flex items-center text-xs pl-2 pr-6 h-9 rounded-full relative bg-[#25282f] text-[#94979c] border-[2px] border-[#404859e5]">
                <img src="https://assets.codepen.io/3685267/wheel-of-fortune-aetkeerk.png" className="size-7 object-cover"/>
                <div className="ml-2 text-base font-semibold"><span className="text-white">{userCoins.toLocaleString()}</span></div>
             </div>
             
             {/* User Avatar - Connected to real profile */}
             <div className="size-10 rounded-full bg-[#25282f] border-[2px] border-[#404859e5] overflow-hidden"> 
                 <img src={user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "https://cdn.discordapp.com/embed/avatars/0.png"} className="w-full h-full object-cover"/>
             </div>
        </div>
      </div>

      {/* Main Wheel Area */}
      {isLoading ? (
        <div className="fixed inset-0 flex items-center justify-center bg-[#161920] z-40">
            <div className="flex flex-col items-center gap-4">
                 <Loader2 className="size-10 text-blue-500 animate-spin" />
                 <p className="text-gray-400">Loading Royal Game...</p>
            </div>
        </div>
      ) : (
      <div className="fixed top-24 inset-x-0 xl:left-64 bottom-24 flex justify-center items-center overflow-hidden z-10 pointer-events-none">
         <div className="relative size-[740px] scale-[0.6] md:scale-75 lg:scale-90 xl:scale-100 pointer-events-auto">
             {/* ... SVG Wheel Content ... */}
            <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-[100px] -z-10"></div>
            <svg className="absolute inset-0" viewBox="0 0 2000 2000" fill="none" xmlns="http://www.w3.org/2000/svg">
                <mask id="wheel-mask" fill="white">
                     <path d="M1922 1005C1922 1514.21 1509.21 1927 1000 1927C490.793 1927 78 1514.21 78 1005C78 495.793 490.793 83 1000 83C1509.21 83 1922 495.793 1922 1005ZM471.592 1005C471.592 1296.83 708.168 1533.41 1000 1533.41C1291.83 1533.41 1528.41 1296.83 1528.41 1005C1528.41 713.168 1291.83 476.592 1000 476.592C708.168 476.592 471.592 713.168 471.592 1005Z" />
                </mask>
                <path d="M1922 1005C1922 1514.21 1509.21 1927 1000 1927C490.793 1927 78 1514.21 78 1005C78 495.793 490.793 83 1000 83C1509.21 83 1922 495.793 1922 1005ZM471.592 1005C471.592 1296.83 708.168 1533.41 1000 1533.41C1291.83 1533.41 1528.41 1296.83 1528.41 1005C1528.41 713.168 1291.83 476.592 1000 476.592C708.168 476.592 471.592 713.168 471.592 1005Z" style={{ fill: "#272b35e8", stroke: "#3d445291", strokeWidth: "13px" }} mask="url(#wheel-mask)" />
                <motion.g style={{ originX: "1000px", originY: "1000px" }} animate={{ rotate: rotation }} transition={{ duration: 4, type: "tween", ease: "circOut" }}>
                    <g transform="translate(1000, 1000)">
                        {f1.map((d, i) => <path key={`seg-${i}`} d={d} style={{fill: "#343a46c2", stroke: "#444c59c2", strokeWidth: "6"}} />)}
                        {f3.map(([path, id], idx) => (<React.Fragment key={`title-${idx}`}><path d={path} stroke="none" strokeWidth={5} id={id} /><text dy={20} className="circ-title"><textPath xlinkHref={`#${id}`} textAnchor="middle" startOffset="50%" style={{ textAnchor: "middle" }}>{items[idx] ? items[idx].title : ''}</textPath></text></React.Fragment>))}
                        {/* Drop rates hidden from users - only visible in admin panel */}
                        {f2.map(({x, y, rt}, idx) => (<g key={`img-${idx}`} transform={`translate(${x-90}, ${y-90})`}><g transform={`rotate(${rt}, 90, 90)`}><image href={items[idx] ? items[idx].image : ''} height="180" width="180" className="scale-on-hover"/></g></g>))}
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
             <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform w-80 flex items-center flex-col px-5 py-4 space-y-2 bg-[#272b35] text-[#7d8ba8] border-[2px] border-[#3d44528c] rounded-[23px] shadow-2xl z-50">
               <div className="text-xl font-bold text-white">Witch Chest</div>
               <div className="text-center text-sm">Win amazing prizes!</div>
               <button onClick={handleSpin} disabled={spinning} className="w-full py-3 mt-2 text-base font-bold text-white uppercase tracking-wider buy-button shadow-lg transform transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {spinning ? <Loader2 className="animate-spin" /> : `Spin x ${cost} Ticket${cost > 1 ? 's' : ''}`}
               </button>
            </div>
         </div>
      </div>
      )}

       {/* Bottom Bar: Prizes List */}
       <div className="fixed bottom-0 inset-x-0 xl:left-64 bg-[#12161f] border-t border-[#373e51] z-30 hidden lg:block">
            <div className="flex justify-center -mt-3.5"> <div className="bg-[#12161f] text-[#667088] px-4 font-semibold text-xs border border-[#373e51] rounded-full uppercase py-1">Items from the chest</div> </div>
            <div className="flex gap-4 p-4 overflow-x-auto justify-center">
                 {items.slice(0, 8).map((item, i) => (
                     <div key={i} className="flex-shrink-0 w-32 bg-[#212530] border border-[#393f51] rounded-md p-3 pt-8 relative flex flex-col items-center group">
                          <img src={item.image} className="size-16 object-cover absolute -top-6 group-hover:scale-110 transition-transform duration-300"/>
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
                        <div className="overflow-y-auto flex-1 space-y-3 pr-2 custom-scrollbar">
                           {history.length === 0 ? <p className="text-gray-500 text-center py-8">No spins yet.</p> : history.map((h, i) => (
                               <div key={i} className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                                   <div className="size-10 rounded-md bg-black/20 flex items-center justify-center border border-white/10">
                                       <img src={(h as any).prize?.image_url} className="size-8 object-contain"/>
                                   </div>
                                   <div>
                                       <div className="font-semibold text-sm text-white">{(h as any).prize?.name}</div>
                                       <div className="text-[10px] text-gray-400">{new Date(h.created_at).toLocaleString()}</div>
                                   </div>
                               </div>
                           ))}
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

    const handleBuy = async () => {
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
        <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
                <div className="text-xs text-gray-400">Current Balance</div>
                <div className="text-lg font-bold text-yellow-400">{coins.toLocaleString()} Coins</div>
            </div>
            
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Quantity ({PRICE.toLocaleString()} Coins/ea)</label>
                <div className="flex gap-2">
                     <button onClick={() => setQty(Math.max(1, qty-1))} className="size-10 rounded-md bg-[#25282f] border border-white/10 hover:bg-white/10">-</button>
                     <input type="number" value={qty} onChange={e => setQty(Math.max(1, parseInt(e.target.value)||1))} className="flex-1 bg-black/20 border border-white/10 rounded-md text-center outline-none focus:border-blue-500" />
                     <button onClick={() => setQty(qty+1)} className="size-10 rounded-md bg-[#25282f] border border-white/10 hover:bg-white/10">+</button>
                </div>
            </div>

            <div className="pt-2">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Total Cost:</span>
                    <span className="font-bold text-white">{(qty * PRICE).toLocaleString()} Coins</span>
                </div>
                <button onClick={handleBuy} disabled={loading || (qty * PRICE) > coins} className="w-full py-2.5 buy-button font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? <Loader2 className="animate-spin size-4" /> : "Purchase Tickets"}
                </button>
            </div>
        </div>
    )
}
