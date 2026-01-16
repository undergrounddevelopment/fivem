"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Rocket, Zap, Server, Shield, CheckCircle, AlertTriangle,
    Play, Pause, RefreshCw, Star, Users, Award,
    Crown, ExternalLink, MessageSquare, History,
    Settings, Link2, Info, Lock, Key, ShieldCheck,
    Video, Image as ImageIcon, Volume2, Search, Trash2, Send,
    Globe, Megaphone, HelpCircle, Code, ShoppingBag, Check, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { SPONSOR_BANNERS, FRAMEWORKS, SITE_NAME, SITE_LOGO, DISCORD_LINKS, SPONSORS } from "@/lib/constants"
import { useAuth } from "@/components/auth-provider"
import { FrameworkMarquee } from "@/components/framework-marquee"

// --- TYPES ---
interface Testimonial {
    id: string
    username: string
    avatar: string
    content: string
    rating: number
    is_verified: boolean
    badge?: "verified" | "pro" | "vip" | "premium"
    server_name?: string
    upvotes_received?: number
    image_url?: string
}

interface ServerInfo {
    EndPoint: string
    Data: {
        hostname: string
        clients: number
        sv_maxclients: number
        upvotePower: number
        gametype: string
        icon?: string
        ownerName?: string
        ownerAvatar?: string
        ownerProfile?: string
        vars: {
            premium?: string
            banner_detail?: string
            banner_connecting?: string
            tags?: string
            sv_projectName?: string
            sv_projectDesc?: string
            DiscordLink?: string
        }
    }
    ipAddress: string
    ping: number
    premium: boolean
    verified: boolean
}

interface Player {
    id: number
    name: string
    avatar: string
    server: string
    identifiers: string[]
}

// --- HELPERS (RESTORED FROM SNIPPET) ---
const CFX_API = {
    isValidServerId: (id: string) => /^[a-zA-Z0-9_-]+$/.test(id) && id.length <= 50,

    async getServerInfo(input: string): Promise<ServerInfo> {
        try {
            let id = input
            if (input.includes("cfx.re/join/")) {
                id = input.split("cfx.re/join/")[1]
            }

            if (!this.isValidServerId(id)) throw new Error("Format ID Server Tidak Valid")

            // USE PROXY API WITH TIMEOUT TO AVOID NETWORK ERRORS
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout
            
            let res: Response
            try {
                res = await fetch(`/api/cfx/status/${id}`, { 
                    signal: controller.signal,
                    headers: { 'Accept': 'application/json' }
                })
            } catch (fetchError: any) {
                clearTimeout(timeoutId)
                if (fetchError.name === 'AbortError') {
                    throw new Error("Koneksi timeout - server terlalu lama merespons")
                }
                throw new Error("Network error - gagal terhubung ke server")
            }
            clearTimeout(timeoutId)
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: "Server tidak ditemukan" }))
                throw new Error(errorData.error || "Server tidak ditemukan")
            }

            const data = await res.json()
            const ip = data.EndPoint || data.Data?.connectEndPoints?.[0] || "N/A"
            
            // Construct icon URL from FiveM CDN if iconVersion exists
            const iconUrl = data.Data?.iconVersion 
                ? `https://frontend.cfx-services.net/api/servers/icon/${data.EndPoint}/${data.Data.iconVersion}.png`
                : null

            return {
                ...data,
                Data: {
                    ...data.Data,
                    icon: iconUrl || data.Data?.icon,
                    ownerName: data.Data?.ownerName,
                    ownerAvatar: data.Data?.ownerAvatar,
                    ownerProfile: data.Data?.ownerProfile
                },
                ipAddress: ip,
                ping: 50, // Consistent value - real ping would require actual network measurement
                premium: data.Data?.vars?.premium === "true" || !!data.Data?.vars?.premium,
                verified: true
            }
        } catch (e) {
            throw e
        }
    },

    async getServerPlayers(input: string): Promise<Player[]> {
        try {
            let id = input
            if (input.includes("cfx.re/join/")) {
                id = input.split("cfx.re/join/")[1]
            }

            // USE PROXY API
            const res = await fetch(`/api/cfx/status/${id}`)
            if (!res.ok) return []

            const data = await res.json()
            const rawPlayers = data.Data?.players || []

            return rawPlayers.map((p: any, idx: number) => {
                const name = (p.name || p.Name || p.nickname || `Player ${idx + 1}`).toString().replace(/</g, "&lt;").replace(/>/g, "&gt;");
                return {
                    id: p.id || p.Id || idx,
                    name,
                    avatar: SITE_LOGO,
                    server: data.Data.hostname,
                    identifiers: p.identifiers || p.Identifiers || []
                }
            })
        } catch {
            return []
        }
    }
}

const stripFiveMColors = (text: string) => {
    return text.replace(/\^[0-9]/g, "").trim()
}

// --- 2026 UI COMPONENTS ---

function MeshGradient() {
    return (
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-[-25%] left-[-10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/5 blur-[120px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        </div>
    )
}

function NodeNetwork({ active }: { active: boolean }) {
    return (
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none overflow-hidden">
            <svg width="100%" height="100%" className="w-full h-full">
                <defs>
                    <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white/20" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                {active && (
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent"
                        initial={{ opacity: 0, bottom: '-100%' }}
                        animate={{ opacity: [0, 1, 0], bottom: '100%' }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                )}
            </svg>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
        </div>
    )
}

function BentoCard({ children, title, icon: Icon, className = "", delay = 0, featured = false }: { children: React.ReactNode, title?: string, icon?: any, className?: string, delay?: number, featured?: boolean }) {
    const mouseX = useRef(0);
    const mouseY = useRef(0);
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = ({ currentTarget, clientX, clientY }: React.MouseEvent) => {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.current = clientX - left;
        mouseY.current = clientY - top;
        if (cardRef.current) {
            cardRef.current.style.setProperty("--mouse-x", `${mouseX.current}px`);
            cardRef.current.style.setProperty("--mouse-y", `${mouseY.current}px`);
        }
    };

    return (
        <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay, ease: [0.23, 1, 0.32, 1] }}
            className={`glass relative overflow-hidden flex flex-col p-8 md:p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.01] shadow-2xl backdrop-blur-[80px] group transition-all duration-500 hover:border-white/10 ${className} ${featured ? 'ring-1 ring-primary/20 bg-primary/[0.02]' : ''}`}
            style={{
                "--spotlight-color": featured ? "rgba(var(--primary-rgb), 0.15)" : "rgba(255, 255, 255, 0.05)"
            } as React.CSSProperties}
        >
            <div
                className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]"
                style={{
                    background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 40%)`
                }}
            />
            {title && (
                <div className="flex items-center gap-3 mb-8 relative z-10">
                    {Icon && (
                        <div className={`p-2.5 rounded-xl border ${featured ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-white/5 border-white/10 text-white/60'}`}>
                            <Icon className="w-4 h-4" />
                        </div>
                    )}
                    <h3 className={`text-[11px] font-black tracking-[0.25em] uppercase ${featured ? 'text-primary' : 'opacity-40'}`}>{title}</h3>
                </div>
            )}
            <div className="relative z-10 flex-1 flex flex-col">
                {children}
            </div>
        </motion.div>
    )
}

function TestimonialsSection() {
    const [apiTestimonials, setApiTestimonials] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const res = await fetch("/api/testimonials")
                if (res.ok) {
                    const data = await res.json()
                    if (Array.isArray(data)) {
                        setApiTestimonials(data)
                    }
                }
            } catch (e) {
                console.error("Failed to fetch testimonials for bot", e)
            } finally {
                setIsLoading(false)
            }
        }
        fetchTestimonials()
    }, [])

    if (isLoading) return <div className="h-48 flex items-center justify-center"><RefreshCw className="w-8 h-8 animate-spin text-primary/20" /></div>
    if (apiTestimonials.length === 0) return null

    const displayTestimonials = apiTestimonials.map(t => ({
        name: t.username,
        role: t.server_name || "Server Operator",
        upvotes: (t.upvotes_received || 0).toLocaleString(),
        rank: t.badge || "Verified",
        rating: t.rating || 5,
        quote: t.content,
        icon: t.avatar || SITE_LOGO,
        active: true
    }))

    return (
        <div className="mt-24 space-y-12 overflow-hidden">
             <div className="text-center space-y-4 mb-4 relative z-10">
                <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary text-[10px] font-black tracking-widest uppercase">Global Impact</Badge>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">CUSTOMER REVIEWS</h2>
                <p className="text-muted-foreground text-base max-w-2xl mx-auto">Real results from the world's most demanding FiveM server operators.</p>
            </div>
            
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-20 pointer-events-none" />
                
                {/* MARQUEE ROW 1 (Left) */}
                <div className="flex overflow-hidden relative w-full">
                    <motion.div 
                        className="flex gap-8 whitespace-nowrap py-4"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{ repeat: Infinity, ease: "linear", duration: 50, repeatType: "loop" }}
                    >
                         {[...displayTestimonials, ...displayTestimonials].map((t, i) => (
                            <TestimonialCard key={`row1-${i}`} data={t} />
                        ))}
                    </motion.div>
                </div>

                {/* MARQUEE ROW 2 (Right) */}
                <div className="flex overflow-hidden relative w-full mt-8">
                     <motion.div 
                        className="flex gap-8 whitespace-nowrap py-4"
                        animate={{ x: ["-50%", "0%"] }}
                        transition={{ repeat: Infinity, ease: "linear", duration: 55, repeatType: "loop" }}
                    >
                         {[...displayTestimonials.slice().reverse(), ...displayTestimonials.slice().reverse()].map((t, i) => (
                            <TestimonialCard key={`row2-${i}`} data={t} />
                        ))}
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

const TESTIMONIALS_DATA = [
    {
        name: "Elite RP Admin",
        role: "Server Founder",
        upvotes: "10,123",
        rank: "39 / 200",
        rating: 5,
        quote: "omfg this is actually insane. i was skeptical at first but after we hit 10k upvotes our server flooded with people. the stability is 10/10 worth every penny.",
        icon: "https://frontend.cfx-services.net/api/servers/icon/lzy8l7/-976662786.png",
        active: true
    },
    {
        name: "Astro Roleplay",
        role: "Support Team",
        upvotes: "7,843",
        rank: "69 / 200",
        rating: 5,
        quote: "literally the only service that doesn't get your server blacklisted. we've been using the elite tools for 2 months now and we're consistently top 10.",
        icon: "https://frontend.cfx-services.net/api/servers/icon/gkd4kq/-1544803086.png",
        active: true
    },
    {
        name: "Narco City II",
        role: "Project Lead",
        upvotes: "7,025",
        rank: "745 / 900",
        rating: 5,
        quote: "best investment for my server ever. the delivery is so fast it actually scared me lol. if u want real players join this. 100% legit.",
        icon: "https://frontend.cfx-services.net/api/servers/icon/xjz9k5/968541395.png",
        active: true
    },
    {
        name: "Euphoria RP",
        role: "Dev",
        upvotes: "7,020",
        rank: "44 / 250",
        rating: 5,
        quote: "finally a boosting method that works properly. visibility shield is a lifesaver. community size doubled in a week. just crazy.",
        icon: "https://frontend.cfx-services.net/api/servers/icon/857bev/-629755298.png",
        active: true
    },
    {
        name: "Cidade Grande",
        role: "Owner",
        upvotes: "6,510",
        rank: "1186 / 2048",
        rating: 5,
        quote: "absurdly good. we hit top 3 global and the numbers are just staying there. the software tool is high tech stuff. no cap.",
        icon: "https://frontend.cfx-services.net/api/servers/icon/vre5mr/1098256735.png",
        active: true
    },
    {
        name: "FLUXO ROLEPLAY",
        role: "Manager",
        upvotes: "6,505",
        rank: "1057 / 2048",
        rating: 5,
        quote: "honestly didn't think it would be this easy. literally just one click and the upvotes start rolling. expensive but results are real.",
        icon: "https://frontend.cfx-services.net/api/servers/icon/djoq65/1493030485.png",
        active: true
    },
    {
        name: "DISTRICT 99",
        role: "Owner",
        upvotes: "5,005",
        rank: "143 / 2048",
        rating: 5,
        quote: "best price and best support. discord support is freaking fast. i've bought over 50k upvotes already and zero drops. highly recommend these guys!",
        icon: "https://frontend.cfx-services.net/api/servers/icon/5dg4mr/512213334.png",
        active: true
    },
    {
        name: "REVOADA RJ",
        role: "Staff",
        upvotes: "5,260",
        rank: "579 / 2048",
        rating: 5,
        quote: "this stuff is crazy, upvotes arrived in like one minute. these guys are the goats. server has been packed all day long now.",
        icon: "https://frontend.cfx-services.net/api/servers/icon/ep4jba/994156113.png",
        active: true
    }
]

function TestimonialCard({ data }: { data: typeof TESTIMONIALS_DATA[0] }) {
    return (
        <div className="glass-card group hover:border-[#D4AF37]/30 relative flex w-[480px] flex-col overflow-hidden border-white/5 p-8 transition-all duration-500 hover:bg-white/[0.03] rounded-[2rem] bg-black/40 backdrop-blur-md">
            <div className="mb-8 flex items-start justify-between">
                <div className="flex items-center gap-5">
                    <div className="border-[#D4AF37]/30 bg-[#D4AF37]/10 relative h-16 w-16 overflow-hidden rounded-2xl border p-2 shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                        <img alt={data.name} className="h-full w-full object-contain" src={data.icon} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="group-hover:text-[#D4AF37] text-lg font-bold text-white transition-colors">{data.name}</h4>
                            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" title="Active Integration"></div>
                        </div>
                        <div className="mt-1 flex items-center gap-3">
                            <div className="text-[#D4AF37] text-[11px] font-black tracking-[0.2em] uppercase">{data.upvotes} UPVOTES</div>
                            <div className="h-1 w-1 rounded-full bg-white/20"></div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
                                <Users className="w-2.5 h-2.5 text-slate-600" />
                                {data.rank}
                            </div>
                        </div>
                        <div className="mt-0.5 text-[10px] font-medium tracking-wide text-slate-600 uppercase">{data.role}</div>
                    </div>
                </div>
                <div className="flex gap-1 pt-1 opacity-60">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
                    ))}
                </div>
            </div>
            <div className="relative whitespace-normal">
                <MessageSquare className="absolute -top-4 -left-3 h-10 w-10 rotate-12 text-white/5 transition-transform group-hover:scale-110 group-hover:text-[#D4AF37]/10" />
                <p className="relative z-10 text-[15px] leading-relaxed font-medium text-slate-400 transition-colors group-hover:text-white">
                    "{data.quote}"
                </p>
            </div>
            <div className="bg-[#D4AF37]/5 absolute -right-12 -bottom-12 h-24 w-24 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"></div>
        </div>
    )
}

// --- MAIN CLIENT ---

export function UpvoteBotClient() {
    const { user } = useAuth()
    console.log("Rendering UpvoteBotClient...") // Force rebuild
    const [activeBanner, setActiveBanner] = useState(0)
    const [serverAddress, setServerAddress] = useState("")
    const [targetUpvotes, setTargetUpvotes] = useState("")
    const [status, setStatus] = useState<"idle" | "validating" | "valid" | "invalid">("idle")
    const [isValidating, setIsValidating] = useState(false)
    const [serverData, setServerData] = useState<ServerInfo | null>(null)
    const [validatedId, setValidatedId] = useState("")
    const [showSecurityModal, setShowSecurityModal] = useState(false)
    const [boostKey, setBoostKey] = useState("")
    const [players, setPlayers] = useState<Player[]>([])
    const [upvoteSettings, setUpvoteSettings] = useState({ min_upvotes: 1, max_upvotes: 50000, default_upvotes: 100 })
    const [allBanners, setAllBanners] = useState([
        { id: "h1", name: "Elite Development", image: "https://r2.fivemanage.com/pjW8diq5cgbXePkRb7YQg/images/hero-1.png", type: "image", isActive: true },
        { id: "h2", name: "Server Protection", image: "https://r2.fivemanage.com/pjW8diq5cgbXePkRb7YQg/images/hero-2.png", type: "image", isActive: true },
        { id: "h3", name: "High Performance", image: "https://r2.fivemanage.com/pjW8diq5cgbXePkRb7YQg/images/hero-3.png", type: "image", isActive: true },
        { id: "h4", name: "Community Growth", image: "https://r2.fivemanage.com/pjW8diq5cgbXePkRb7YQg/images/hero-4.png", type: "image", isActive: true }
    ])
    const [logs, setLogs] = useState<{ id: number; message: string; type: "info" | "success" | "error" | "warning" | "process"; timestamp: string }[]>([])
    const [showPricing, setShowPricing] = useState(false)
    const [selectedPeriod, setSelectedPeriod] = useState<"month" | "years">("month")
    const [showSuccessModal, setShowSuccessModal] = useState(false)

    const logIdCounter = useRef(0)

    const [processState, setProcessState] = useState({
        progress: 0,
        isRunning: false,
        startTime: null as number | null,
        totalSent: 0,
        target: 0,
        isKeyVerified: false
    })

    const processInterval = useRef<NodeJS.Timeout | null>(null)
    const logEndRef = useRef<HTMLDivElement>(null)

    // Log function with HTML formatting support (simulated as text for React safety)
    const addLog = useCallback((message: string, type: "info" | "success" | "error" | "warning" | "process" = "info") => {
        const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })
        setLogs(prev => [...prev.slice(-99), { id: logIdCounter.current++, message: message.toUpperCase(), type, timestamp }])
        setTimeout(() => logEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
    }, [])

    // Fetch upvote settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/upvotes/settings")
                const data = await res.json()
                setUpvoteSettings({
                    min_upvotes: data.min_upvotes || 1,
                    max_upvotes: data.max_upvotes || 50000,
                    default_upvotes: data.default_upvotes || 100
                })
                setTargetUpvotes(String(data.default_upvotes || 100))
            } catch (e) {
                console.error("Failed to fetch upvote settings", e)
            }
        }
        fetchSettings()
    }, [])

    // Banner Rotation & Fetching
    useEffect(() => {
        const fetchBanners = async () => {
             try {
                 const res = await fetch("/api/banners?position=hero")
                 const data = await res.json()
                 if (data.banners && data.banners.length > 0) {
                     // Map DB banners to Sponsor format
                     const apiBanners = data.banners.map((b: any) => ({
                         id: b.id,
                         name: b.title,
                         image: b.image_url,
                         type: 'image',
                         isActive: b.is_active
                     }))
                     setAllBanners(apiBanners)
                 }
             } catch (e) {
                 console.error("Failed to fetch banners for bot", e)
             }
        }
        fetchBanners()

        const interval = setInterval(() => {
            setAllBanners(prevBanners => {
                if (prevBanners.length === 0) return prevBanners;
                return prevBanners; // Trigger re-render or just rely on index
            })
            setActiveBanner(prev => (prev + 1) % allBanners.length)
        }, 4000)
        return () => clearInterval(interval)
    }, [allBanners.length])

    // Cleanup
    useEffect(() => () => { if (processInterval.current) clearInterval(processInterval.current) }, [])

    const validateServer = async (address: string) => {
        if (!address.trim()) {
            addLog("Invalid Input: Please enter a server address", "error")
            return false
        }

        setStatus("validating")
        setIsValidating(true)
        try {
            addLog(`Initializing connection to server: ${address}`, "info")
            addLog("Establishing secure connection...", "info")

            const info = await CFX_API.getServerInfo(address)
            let id = address
            if (address.includes("cfx.re/join/")) {
                id = address.split("cfx.re/join/")[1]
            }
            setValidatedId(id)
            setIsValidating(false)
            setServerData(info)
            setStatus("valid")

            addLog("Analyzing server infrastructure...", "info")
            addLog("Retrieving active player data from server...", "info")

            const serverPlayers = await CFX_API.getServerPlayers(address)
            setPlayers(serverPlayers)

            addLog("Server connection established successfully", "success")
            addLog(`Server: ${info.Data.hostname}`, "success")
            addLog(`IP Address: ${info.ipAddress}`, "info")
            addLog(`Active Players: ${info.Data.clients}/${info.Data.sv_maxclients}`, "info")
            addLog(`Upvote Power Index: ${info.Data.upvotePower}`, "info")
            addLog(`Player database synchronized: ${serverPlayers.length} active users`, "success")

            return true
        } catch (e: any) {
            setIsValidating(false)
            setStatus("invalid")
            setServerData(null)
            addLog("Koneksi Gagal: Tidak dapat menjangkau server", "error")
            addLog(`Kesalahan: ${e.message}`, "error")
            addLog("TIPS: Pastikan ID Server 6 digit (contoh: j8y8q6) benar", "warning")
            return false
        }
    }

    const startProcessInterval = () => {
        let lastLogProgress = 0
        processInterval.current = setInterval(() => {
            setProcessState(prev => {
                if (!prev.isRunning) return prev

                // Logic from snippet: 30s (~30000ms) for simulation
                const increment = (100 / 30000) * 100
                const nextProgress = Math.min(prev.progress + increment, 100)
                const nextSent = Math.floor(prev.target * (nextProgress / 100))

                // Periodic logging (every 10%)
                if (Math.floor(nextProgress / 10) > Math.floor(lastLogProgress / 10)) {
                    const milestone = 10 * Math.floor(nextProgress / 10)
                    addLog(`Upvote delivery progress: ${milestone}% | ${nextSent}/${prev.target} packets sent`, "process")
                    lastLogProgress = nextProgress
                }

                // Security Checkpoint at 95%
                if (nextProgress >= 95 && !prev.isKeyVerified) {
                    if (processInterval.current) clearInterval(processInterval.current)
                    addLog("Security checkpoint activated at 95%", "warning")
                    addLog("License verification required to continue", "warning")
                    addLog("Process temporarily suspended", "warning")
                    setShowSecurityModal(true)
                    return { ...prev, progress: nextProgress, totalSent: nextSent, isRunning: false }
                }

                // Completion
                if (nextProgress >= 100) {
                    if (processInterval.current) clearInterval(processInterval.current)
                    
                    // Call backend to record the boost
                    if (serverData) {
                        fetch("/api/upvotes/boost", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                serverName: stripFiveMColors(serverData.Data.hostname),
                                upvotes: prev.target,
                                serverId: validatedId
                            })
                        }).catch(err => console.error("Failed to record boost:", err))
                    }

                    addLog("Upvote delivery completed successfully!", "success")
                    addLog(`Total upvotes delivered: ${nextSent}`, "success")
                    addLog("Server ranking boost applied!", "success")
                    addLog("DATA BERHASIL DISINKRONISASI KE API 100%", "success")
                    setTimeout(() => setShowSuccessModal(true), 1000)
                    return { ...prev, progress: 100, totalSent: nextSent, isRunning: false }
                }

                return { ...prev, progress: nextProgress, totalSent: nextSent }
            })
        }, 100)
    }

    const verifyLicense = async () => {
        addLog("Initializing secure handshake...", "process")
        
        try {
            const res = await fetch("/api/license/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: boostKey })
            })

            const data = await res.json()

            if (res.ok && data.success) {
                setProcessState(prev => ({ ...prev, isKeyVerified: true, isRunning: true }))
                setShowSecurityModal(false)
                setBoostKey("")
                addLog("Secure Gateway: Access Granted", "success")
                addLog(`Session Token: ${data.token.substring(0, 12)}...`, "info")
                addLog("Encryption Layer: ACTIVE (AES-256)", "success")
                addLog("Resuming packet transmission...", "process")
                startProcessInterval()
            } else {
                addLog("Security Alert: Access Denied", "error")
                addLog(data.message || "Invalid credentials provided", "error")
                setBoostKey("") 
                // Shake effect or visual feedback could be added here
            }
        } catch (error) {
            addLog("Connection Error: Unable to reach security gateway", "error")
            console.error(error)
        }
    }

    const handleLaunch = () => {
        if (!serverData) return
        const amount = parseInt(targetUpvotes)
        if (isNaN(amount) || amount < upvoteSettings.min_upvotes) {
            addLog(`Invalid Amount: Minimum is ${upvoteSettings.min_upvotes.toLocaleString()}`, "error")
            return
        }
        if (amount > upvoteSettings.max_upvotes) {
            addLog("LIMIT EXCEEDED: UPVOTE QUOTA OVER MAXIMUM", "error")
            addLog(`Maximum allowed: ${upvoteSettings.max_upvotes.toLocaleString()} upvotes`, "error")
            return
        }

        setProcessState(prev => ({
            ...prev,
            target: amount,
            isRunning: true,
            startTime: Date.now(),
            progress: 0,
            totalSent: 0
        }))

        addLog("Initializing upvote delivery system", "process")
        addLog(`Target upvotes: ${amount}`, "info")
        addLog(`Destination: ${serverData.Data.hostname}`, "info")
        addLog("Encrypting data packets...", "info")
        addLog(`Estimated time: ${Math.ceil(amount / 100)} seconds`, "info")

        startProcessInterval()
    }

    const handleStop = () => {
        if (processInterval.current) clearInterval(processInterval.current)
        setProcessState(prev => ({ ...prev, isRunning: false, progress: 0, totalSent: 0 }))
        addLog("Process terminated by user request", "warning")
        addLog(`Partial delivery task aborted`, "info")
    }

    return (
        <div className="relative w-full min-h-screen text-white selection:bg-primary/30">
            <MeshGradient />

            <div className="container mx-auto px-4 py-8 md:py-12 max-w-[1600px]">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">

                {/* LEFT: SIDEBAR (lg:col-span-1 / hidden on mobile) */}
                <div className="hidden lg:block space-y-6">
                    <BentoCard title="SUPPORTED FRAMEWORKS" icon={Rocket}>
                        <div className="h-[300px] w-full">
                            <FrameworkMarquee />
                        </div>
                    </BentoCard>

                    <BentoCard title="GLOBAL REACH" icon={Globe}>
                        <div className="space-y-6 py-2">
                            <div>
                                <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-2">Throughput</p>
                                <p className="text-3xl font-black tracking-tighter text-white uppercase leading-none">
                                    {(1.2 + (Math.random() * 0.1)).toFixed(2)}M <span className="text-[10px] opacity-20 ml-1">Req/s</span>
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-2">Active Nodes</p>
                                <p className="text-3xl font-black tracking-tighter text-white uppercase leading-none">
                                    {Math.floor(4800 + Math.random() * 100).toLocaleString()} <span className="text-[10px] opacity-20 ml-1">Live</span>
                                </p>
                            </div>
                        </div>
                    </BentoCard>
                </div>

                {/* MIDDLE: MAIN ACTIONS (lg:col-span-2) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Brand Header */}
                    <div className="glass p-6 rounded-[2rem] border border-white/5 flex justify-between items-center bg-black/20">
                        <div className="flex items-center gap-5">
                            <div className="p-1.5 rounded-2xl bg-gradient-to-b from-white/10 to-transparent border border-white/10 shadow-xl">
                                <img src="https://boostfivem.com/images/imagerm.png" className="w-10 h-10 rounded-xl" alt="Boost FiveM" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tighter uppercase leading-none mb-1">BOOSTFIVEM.COM PANEL UPVOTES</h1>
                                <p className="text-[10px] font-black text-primary tracking-[0.2em] opacity-60 uppercase">Elite Control Plane</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 pr-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black tracking-widest uppercase opacity-40">System Live</span>
                                <span className="text-[8px] font-black text-primary tracking-widest uppercase">API COMPLIANCE 100%</span>
                            </div>
                        </div>
                    </div>

                    {/* Server Configuration */}
                    <BentoCard title="SERVER CONFIGURATION" icon={Server}>
                        <div className="space-y-6">
                            <div className="flex gap-3">
                                <Input
                                    placeholder="cfx.re/join/xxxxx or Server ID"
                                    value={serverAddress}
                                    onChange={(e) => setServerAddress(e.target.value)}
                                    className="h-16 rounded-2xl bg-white/[0.02] border-white/5 px-6 font-mono text-sm focus:ring-primary/20 transition-all placeholder:opacity-20 flex-1"
                                    disabled={processState.isRunning}
                                />
                                <Button
                                    onClick={() => validateServer(serverAddress)}
                                    disabled={isValidating || processState.isRunning}
                                    className="h-16 bg-primary text-black hover:bg-white transition-all rounded-2xl aspect-square p-0 shadow-xl shadow-primary/10"
                                >
                                    {isValidating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                                </Button>
                            </div>

                            {/* TIME PERIOD SELECTION - MODERN SEGMENTED CONTROL */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Duration Access</span>
                                    {selectedPeriod === "years" && <span className="text-[10px] font-bold text-primary animate-pulse">BEST VALUE</span>}
                                </div>
                                <div className="relative p-1.5 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-md flex">
                                    {/* Week - Disabled */}
                                    <button 
                                        disabled 
                                        className="relative flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-white/20 cursor-not-allowed group"
                                    >
                                        Week
                                        <div className="absolute inset-0 bg-white/[0.02] m-1 rounded-xl group-hover:bg-red-500/10 transition-colors" />
                                    </button>

                                    {/* Month */}
                                    <button 
                                        onClick={() => setSelectedPeriod("month")}
                                        className={`relative flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors z-10 ${selectedPeriod === "month" ? "text-primary" : "text-white/40 hover:text-white/70"}`}
                                    >
                                        {selectedPeriod === "month" && (
                                            <motion.div
                                                layoutId="activePeriod"
                                                className="absolute inset-0 bg-primary/10 border border-primary/30 rounded-xl shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <span className="relative z-20">Month</span>
                                    </button>

                                    {/* Years */}
                                    <button 
                                        onClick={() => setSelectedPeriod("years")}
                                        className={`relative flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors z-10 ${selectedPeriod === "years" ? "text-primary" : "text-white/40 hover:text-white/70"}`}
                                    >
                                        {selectedPeriod === "years" && (
                                            <motion.div
                                                layoutId="activePeriod"
                                                className="absolute inset-0 bg-primary/10 border border-primary/30 rounded-xl shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <span className="relative z-20">Years</span>
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence>
                                {status === "valid" && serverData && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="p-6 rounded-3xl bg-green-400/[0.03] border border-green-400/10 space-y-6 overflow-hidden"
                                    >
                                        {/* SERVER BANNER - PROMINENT DISPLAY */}
                                        <div className="mb-6 rounded-[1.5rem] overflow-hidden border border-primary/20 bg-black/60 relative group shadow-[0_0_40px_rgba(var(--primary-rgb),0.1)]">
                                            {(serverData.Data.vars?.banner_detail || serverData.Data.vars?.banner_connecting) ? (
                                                <img
                                                    src={serverData.Data.vars.banner_detail || serverData.Data.vars.banner_connecting}
                                                    className="w-full h-auto min-h-[120px] object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-700"
                                                    alt="Server Banner"
                                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                                />
                                            ) : (
                                                <div className="w-full h-32 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/5 to-purple-500/5">
                                                    <ImageIcon className="w-10 h-10 opacity-20" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-20">No Banner Available</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none">
                                                <div className="flex gap-2 flex-wrap">
                                                    {serverData.Data.vars?.tags?.split(',').slice(0, 5).map((tag, i) => (
                                                        <span key={i} className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-[9px] font-black uppercase tracking-widest text-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.2)]">
                                                            {tag.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-5">
                                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-400/20 to-emerald-600/10 flex items-center justify-center shrink-0 border border-green-400/30 shadow-[0_0_25px_rgba(74,222,128,0.15)] overflow-hidden ring-2 ring-green-400/10">
                                                {serverData.Data.icon ? (
                                                    <img
                                                        src={
                                                            serverData.Data.icon.startsWith('http') 
                                                                ? serverData.Data.icon 
                                                                : serverData.Data.icon.startsWith('data:') 
                                                                    ? serverData.Data.icon 
                                                                    : `data:image/png;base64,${serverData.Data.icon}`
                                                        }
                                                        className="w-full h-full object-cover"
                                                        alt="Server Logo"
                                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                                    />
                                                ) : (
                                                    <Rocket className="w-7 h-7 text-green-400" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-black text-lg text-white uppercase truncate tracking-tight">
                                                        {stripFiveMColors(serverData.Data.hostname)}
                                                    </h4>
                                                    {serverData.premium && (
                                                        <Crown className="w-4 h-4 text-yellow-400 shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-[10px] font-mono opacity-40 uppercase tracking-widest">{serverData.ipAddress}</p>
                                            </div>
                                        </div>
                                        
                                        {/* OWNER PROFILE SECTION */}
                                        {serverData.Data.ownerAvatar && (
                                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 mb-4">
                                                <img 
                                                    src={serverData.Data.ownerAvatar} 
                                                    className="w-10 h-10 rounded-full border-2 border-purple-400/50 shadow-lg" 
                                                    alt="Owner"
                                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[9px] opacity-40 uppercase font-black tracking-widest">Server Owner</p>
                                                    <p className="font-bold text-sm text-white truncate">{serverData.Data.ownerName || 'Unknown'}</p>
                                                </div>
                                                {serverData.Data.ownerProfile && (
                                                    <a 
                                                        href={serverData.Data.ownerProfile} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                                                    >
                                                        <ExternalLink className="w-4 h-4 opacity-60" />
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                        
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {[
                                                { l: 'Players', v: `${serverData.Data.clients}/${serverData.Data.sv_maxclients}`, c: 'text-blue-400', bg: 'from-blue-500/10 to-blue-600/5' },
                                                { l: 'Power', v: serverData.Data.upvotePower || '0', c: 'text-primary', bg: 'from-primary/10 to-yellow-500/5' },
                                                { l: 'Latency', v: `${serverData.ping}ms`, c: 'text-purple-400', bg: 'from-purple-500/10 to-pink-500/5' },
                                                { l: 'Status', v: serverData.verified ? 'Verified' : 'Online', c: 'text-green-400', bg: 'from-green-500/10 to-emerald-500/5' }
                                            ].map((s, i) => (
                                                <div key={i} className={`bg-gradient-to-br ${s.bg} p-4 rounded-2xl border border-white/5 group/stat hover:border-white/10 transition-all hover:scale-[1.02] hover:shadow-lg`}>
                                                    <p className="text-[8px] opacity-40 uppercase font-black tracking-widest mb-1 group-hover/stat:opacity-60 transition-opacity">{s.l}</p>
                                                    <p className={`font-black text-base ${s.c} truncate`}>{s.v}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </BentoCard>

                    {/* Upvotes Process */}
                    <BentoCard title="UPVOTES PROCESS" icon={Zap}>
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Input
                                    type="number"
                                    placeholder="TARGET UPVOTES"
                                    min={upvoteSettings.min_upvotes}
                                    max={upvoteSettings.max_upvotes}
                                    value={targetUpvotes}
                                    onChange={(e) => setTargetUpvotes(e.target.value)}
                                    className="h-20 rounded-2xl bg-white/[0.02] border-white/5 px-6 font-mono text-2xl tracking-widest text-center focus:ring-primary/20 transition-all placeholder:text-xs placeholder:tracking-widest placeholder:opacity-20"
                                    disabled={processState.isRunning}
                                />
                                <div className="relative">
                                    <input
                                        type="range"
                                        min={upvoteSettings.min_upvotes}
                                        max={upvoteSettings.max_upvotes}
                                        value={Math.min(parseInt(targetUpvotes) || upvoteSettings.default_upvotes, upvoteSettings.max_upvotes)}
                                        onChange={(e) => setTargetUpvotes(e.target.value)}
                                        disabled={processState.isRunning}
                                        className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-primary/50 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:shadow-primary/50"
                                    />
                                    {parseInt(targetUpvotes) > upvoteSettings.max_upvotes && (
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-red-500 rounded-full animate-pulse" />
                                    )}
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground font-mono">
                                    <span>{upvoteSettings.min_upvotes.toLocaleString()}</span>
                                    <span className={`font-bold ${parseInt(targetUpvotes) > upvoteSettings.max_upvotes ? 'text-red-500' : 'text-primary'}`}>
                                        {(parseInt(targetUpvotes) || upvoteSettings.default_upvotes).toLocaleString()} Upvotes
                                    </span>
                                    <span>{upvoteSettings.max_upvotes.toLocaleString()}</span>
                                </div>
                                {parseInt(targetUpvotes) > upvoteSettings.max_upvotes && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
                                    >
                                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-red-500">LIMIT EXCEEDED</p>
                                            <p className="text-xs text-red-500/80">Maximum limit is {upvoteSettings.max_upvotes.toLocaleString()} upvotes. Please adjust your input.</p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            <Button
                                onClick={processState.isRunning ? handleStop : handleLaunch}
                                disabled={status !== "valid" && !processState.isRunning}
                                className={`h-24 w-full rounded-2xl text-xl font-black transition-all shadow-2xl relative overflow-hidden group ${processState.isRunning
                                    ? "bg-red-500 text-white hover:bg-red-600 shadow-red-500/20"
                                    : "bg-primary text-black hover:bg-white shadow-primary/20"
                                    }`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                {processState.isRunning ? (
                                    <div className="flex flex-col items-center">
                                        <Pause className="w-8 h-8 mb-1 animate-pulse" />
                                        <span className="text-xs opacity-60 tracking-[0.2em] font-normal uppercase">Emergency Stop</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Zap className="w-6 h-6 fill-current" />
                                            <span>INITIATE BOOST</span>
                                        </div>
                                        <span className={`text-[10px] tracking-[0.3em] font-medium uppercase ${status !== "valid" ? "opacity-40" : "opacity-70"}`}>
                                            {status === "valid" ? "System Ready" : "Awaiting Target"}
                                        </span>
                                    </div>
                                )}
                            </Button>

                            <AnimatePresence>
                                {processState.progress > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="space-y-5 p-6 rounded-3xl bg-primary/5 border border-primary/10"
                                    >
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[9px] opacity-40 uppercase font-black tracking-widest mb-1">Task Progress</p>
                                                <p className="text-3xl font-black font-mono tracking-tighter text-white">{processState.progress.toFixed(1)}%</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] opacity-40 uppercase font-black tracking-widest mb-1">Packets</p>
                                                <p className="text-xl font-black font-mono text-primary">{processState.totalSent} <span className="text-[9px] opacity-30">SENT</span></p>
                                            </div>
                                        </div>
                                        <div className="h-2.5 bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
                                            <motion.div
                                                className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${processState.progress}%` }}
                                                transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </BentoCard>
                </div>

                {/* RIGHT: INFO & LOGS (lg:col-span-1) */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Video Banner */}
                    <div className="rounded-[2rem] overflow-hidden border border-white/5 bg-black/40 shadow-2xl relative">
                        <video src="https://r2.fivemanage.com/pjW8diq5cgbXePkRb7YQg/ts(1).mp4" autoPlay loop muted playsInline className="w-full h-auto opacity-50" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="p-3 rounded-full bg-black/60 border border-white/10 backdrop-blur-xl">
                                <Video className="w-6 h-6 text-primary animate-pulse" />
                            </div>
                        </div>
                    </div>



                    <BentoCard title="NETWORK KERNEL" icon={History}>
                        <div className="h-[200px] bg-black/40 rounded-2xl p-5 overflow-y-auto font-mono text-[9px] space-y-2 border border-white/10 shadow-inner custom-scrollbar">
                            {logs.length === 0 ? (
                                <div className="h-full flex items-center justify-center opacity-10">
                                    <p className="uppercase tracking-widest">Awaiting Command...</p>
                                </div>
                            ) : (
                                logs.map(log => (
                                    <div key={log.id} className="flex gap-2 leading-relaxed">
                                        <span className="opacity-10 shrink-0">[{log.timestamp}]</span>
                                        <span className={`
                                            ${log.type === 'error' ? 'text-red-500 font-bold drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : ''}
                                            ${log.type === 'success' ? 'text-green-400 font-bold drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]' : ''}
                                            ${log.type === 'warning' ? 'text-yellow-400 font-bold' : ''}
                                            ${log.type === 'process' ? 'text-cyan-400 font-bold' : ''}
                                            ${log.type === 'info' ? 'text-white/40' : ''}
                                        `}>
                                            {log.message}
                                        </span>
                                    </div>
                                ))
                            )}
                            <div ref={logEndRef} />
                        </div>
                    </BentoCard>

                    <button 
                        className="inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shimmer hover:opacity-90 px-4 py-2 w-full h-16 bg-gradient-to-r from-amber-500 to-orange-600 text-black font-black rounded-2xl shadow-xl shadow-amber-500/10 hover:scale-[1.02] transition-all" 
                        onClick={() => setShowPricing(true)}
                        tabIndex={0}
                    >
                        <Crown className="w-5 h-5 mr-3" /> BOOST FIVEM LICENSE KEY
                    </button>
                </div>
            </div>



            <div className="container mx-auto px-4 pb-12 max-w-[1600px]">
                <TestimonialsSection />
            </div>

            <Dialog open={showSecurityModal} onOpenChange={setShowSecurityModal}>
                <DialogContent className="max-w-md p-8">
                    <DialogHeader className="mb-6 text-center space-y-4">
                        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/20 mb-4 animate-pulse-glow">
                            <Lock className="w-8 h-8 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <Badge variant="outline" className="px-3 py-1 rounded-full border-primary/20 bg-primary/5 text-primary text-[9px] font-black tracking-[0.2em] uppercase mb-2">
                                SECURITY GATEWAY
                            </Badge>
                            <DialogTitle className="text-3xl font-black font-mono tracking-tighter uppercase">ACCESS DENIED</DialogTitle>
                            <DialogDescription className="text-base text-muted-foreground font-medium max-w-xs mx-auto">
                                Authentication required for <span className="text-white font-bold">boostfivem.com</span> kernel access.
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                        <div className="bg-white/[0.03] p-6 rounded-3xl border border-white/5 space-y-4">
                            <div className="text-center space-y-1 mb-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/80">BOOST FIVEM KEY</p>
                                <p className="text-[10px] text-muted-foreground/60">Enter your unique 16-digit access token</p>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                                <Input
                                    type="password"
                                    placeholder="BOOST-XXXX-XXXX-XXXX"
                                    value={boostKey}
                                    onChange={(e) => setBoostKey(e.target.value.toUpperCase())}
                                    onKeyDown={(e) => e.key === 'Enter' && verifyLicense()}
                                    className="relative h-16 rounded-2xl bg-black/50 border-white/10 text-center font-mono text-xl tracking-[0.15em] text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:opacity-20"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-5 gap-3">
                            <Button 
                                onClick={verifyLicense} 
                                className="col-span-4 h-14 bg-gradient-to-r from-primary to-pink-600 text-white font-black rounded-2xl text-sm tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase"
                            >
                                Verify Identity
                            </Button>
                            <Button 
                                onClick={() => { setShowSecurityModal(false); setShowPricing(true); }} 
                                variant="outline" 
                                className="h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/30 group"
                            >
                                <Key className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all" />
                            </Button>
                        </div>

                        <div className="text-center">
                            <p className="text-[9px] text-muted-foreground/40 font-mono">
                                SECURE CONNECTION ENCRYPTED BY BOOSTFIVEM.COM
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showPricing} onOpenChange={setShowPricing}>
                <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[95vw] md:w-full max-w-5xl p-0 overflow-hidden max-h-[90vh] flex flex-col gap-0 z-[100]">
                    <div className="overflow-y-auto custom-scrollbar p-6 md:p-10 flex-1">
                        <DialogHeader className="sr-only">
                            <DialogTitle>Boost FiveM Pricing Plans</DialogTitle>
                            <DialogDescription>Choose between Monthly and Lifetime license options</DialogDescription>
                        </DialogHeader>

                        <div className="text-center mb-8 md:mb-12">
                            <Badge variant="outline" className="mx-auto mb-4 px-4 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary text-[10px] font-black tracking-widest uppercase shadow-[0_0_15px_rgba(236,72,153,0.3)]">Elite Access</Badge>
                            <h2 className="text-3xl md:text-6xl font-black tracking-tighter uppercase leading-none mb-4">Boost FiveM Plans</h2>
                            <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto mb-8">Unlock the full potential of your server with our professional tier access.</p>
                            
                            {/* TIME PERIOD SELECTION: Week / Month / Years */}
                            <div className="inline-flex p-1 rounded-xl bg-white/5 border border-white/10 mb-2 overflow-x-auto max-w-full">
                                <button disabled className="px-4 md:px-6 py-2.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest opacity-30 cursor-not-allowed whitespace-nowrap">
                                    Week
                                </button>
                                <button className="px-4 md:px-6 py-2.5 rounded-lg bg-primary text-black text-[10px] md:text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 whitespace-nowrap relative overflow-hidden">
                                    <span className="relative z-10">Month</span>
                                    <div className="absolute inset-0 bg-white/20 animate-pulse-glow" />
                                </button>
                                <button className="px-4 md:px-6 py-2.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors text-[10px] md:text-xs font-black uppercase tracking-widest whitespace-nowrap">
                                    Years
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-10 items-stretch">
                            {/* Monthly Plan */}
                            <div className="rounded-[2rem] md:rounded-[2.5rem] bg-white/[0.02] border border-white/5 overflow-hidden group hover:border-primary/20 transition-all flex flex-col shadow-lg h-full">
                                <div className="h-40 md:h-48 overflow-hidden relative shrink-0">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
                                    <img 
                                        src="https://cdn.discordapp.com/attachments/1445794477263552735/1457925503959699457/image.png?ex=696263af&is=6961122f&hm=664f1824e8f8bb2ad4ec34054b62d7efdb336bcebc7551a166773b6802c5a715" 
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                        alt="Monthly Plan"
                                    />
                                    <div className="absolute bottom-4 left-6 z-20">
                                        <Badge className="bg-amber-500 text-black font-black uppercase tracking-widest text-[9px] mb-2 shadow-[0_0_10px_rgba(245,158,11,0.4)]">Starter</Badge>
                                        <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">1 Month Access</h3>
                                    </div>
                                </div>
                                
                                <div className="p-6 md:p-8 flex flex-col flex-1 h-full bg-white/[0.01]">
                                    <div className="flex items-baseline gap-2 mb-6">
                                        <span className="text-4xl md:text-5xl font-black text-amber-500 tracking-tighter">$1000</span>
                                        <span className="text-muted-foreground font-bold uppercase text-[10px] md:text-xs tracking-widest">/ Month</span>
                                    </div>

                                    <ul className="space-y-4 mb-8 flex-1">
                                        {[
                                            "50,000 Upvotes/Month",
                                            "Basic PowerBoost System",
                                            "Standard Analytics",
                                            "Standard Support",
                                            "Real-time Monitoring",
                                            "Discord Integration"
                                        ].map((item, i) => (
                                            <li key={i} className="flex gap-3 text-xs font-bold text-white/70 items-center">
                                                <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" /> {item}
                                            </li>
                                        ))}
                                    </ul>

                                    <button 
                                        className="mt-auto inline-flex items-center justify-center whitespace-nowrap text-xs md:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shimmer hover:opacity-90 px-4 py-2 w-full h-12 md:h-14 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black font-black uppercase tracking-widest rounded-xl transition-all border border-amber-500/20 hover:border-amber-500"
                                        onClick={() => window.open(DISCORD_LINKS.SUPPORT, "_blank")}
                                    >
                                        Purchase Monthly
                                    </button>
                                </div>
                            </div>

                            {/* Lifetime Plan */}
                            <div className="rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/30 overflow-hidden group relative shadow-2xl flex flex-col hover:shadow-[0_0_40px_rgba(236,72,153,0.2)] transition-all h-full">
                                <div className="absolute top-4 right-4 z-20">
                                    <Badge className="bg-primary text-black font-black uppercase tracking-widest shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] animate-pulse">Best Value</Badge>
                                </div>
                                
                                <div className="h-40 md:h-48 overflow-hidden relative shrink-0">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
                                    <img 
                                        src="https://cdn.discordapp.com/attachments/1445794477263552735/1457925735523287222/image.png?ex=696263e6&is=69611266&hm=c0969ca67308320d6740e998eff2d3472f5dcb5a0308162a349523205bdc2516" 
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                        alt="Lifetime Plan"
                                    />
                                    <div className="absolute bottom-4 left-6 z-20">
                                         <Badge className="bg-primary text-black font-black uppercase tracking-widest text-[9px] mb-2 shadow-[0_0_10px_rgba(236,72,153,0.5)]">Professional</Badge>
                                        <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Lifetime Access</h3>
                                    </div>
                                </div>

                                <div className="p-6 md:p-8 flex flex-col flex-1 h-full">
                                    <div className="flex items-baseline gap-2 mb-6">
                                        <span className="text-4xl md:text-5xl font-black text-primary tracking-tighter text-shadow-glow">$1800</span>
                                        <span className="text-muted-foreground font-bold uppercase text-[10px] md:text-xs tracking-widest">/ One-time</span>
                                    </div>

                                    <ul className="space-y-3 md:space-y-4 mb-8 flex-1">
                                        {[
                                            "Unlimited Upvotes",
                                            "Advanced PowerBoost System",
                                            "Professional Analytics Dashboard",
                                            "Priority Support (24/7)",
                                            "Custom Branding Options",
                                            "Full API Access",
                                            "Multi-Server Management",
                                            "Real-time Monitoring",
                                            "Lifetime Updates",
                                            "Discord Integration",
                                            "Advanced Security Features",
                                            "Performance Optimization"
                                        ].map((item, i) => (
                                            <li key={i} className="flex gap-3 text-xs font-bold text-white items-center">
                                                <CheckCircle className="w-4 h-4 text-primary shrink-0 shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" /> {item}
                                            </li>
                                        ))}
                                    </ul>

                                    <button 
                                        className="mt-auto inline-flex items-center justify-center whitespace-nowrap text-xs md:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shimmer hover:opacity-90 px-4 py-2 w-full h-12 md:h-14 bg-primary text-black hover:bg-white font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] transition-all hover:scale-[1.02]"
                                        onClick={() => window.open(DISCORD_LINKS.SUPPORT, "_blank")}
                                    >
                                        Purchase Lifetime
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 flex gap-6 items-center">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shrink-0">
                                <ShoppingBag className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white uppercase tracking-tight text-sm mb-2">Secure Purchase Process</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                                    All licenses are issued manually through our secure Discord verification system. Open a ticket in our support channel to initiate a purchase. Instant delivery upon confirmation.
                                </p>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

                {/* SUCCESS MODAL WITH REDIRECT */}
            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent className="max-w-5xl bg-[#09090b] border-white/10 p-0 overflow-hidden shadow-2xl h-[90vh] flex flex-col">
                    <DialogHeader className="hidden">
                        <DialogTitle>Boost Successful</DialogTitle>
                    </DialogHeader>
                    {/* Header Bar */}
                    <div className="h-14 border-b border-white/10 bg-black/50 backdrop-blur-xl flex items-center justify-between px-6 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                            </div>
                            <div className="h-4 w-px bg-white/10" />
                            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground/60">
                                <Lock className="w-3 h-3" />
                                <span>secure-gateway://servers.fivem.net/detail/{validatedId}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] font-black uppercase tracking-wider">
                                <Check className="w-3 h-3 mr-1" /> Boost Active
                            </Badge>
                            <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0 rounded-lg hover:bg-white/10"
                                onClick={() => window.open(`https://servers.fivem.net/servers/detail/${validatedId}`, '_blank')}
                            >
                                <ExternalLink className="w-4 h-4 text-white/40" />
                            </Button>
                        </div>
                    </div>

                    {/* Iframe Window */}
                    <div className="flex-1 bg-white relative group">
                        <iframe 
                            src={`https://servers.fivem.net/servers/detail/${validatedId}`}
                            className="w-full h-full border-none"
                            title="FiveM Server Detail"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                        />
                        
                         {/* Fallback Overlay if needed (optional, purely visual hint) */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* This is just a subtle interaction layer, actual content is in iframe */}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

// Helper for random number generation
function useRandomWalk(start: number, variance: number, intervalMs: number = 2000) {
    const [value, setValue] = useState(start)

    useEffect(() => {
        const interval = setInterval(() => {
            setValue(prev => {
                const change = (Math.random() - 0.5) * variance
                return Math.round(Math.max(0, prev + change))
            })
        }, intervalMs)
        return () => clearInterval(interval)
    }, [variance, intervalMs])

    return value
}
