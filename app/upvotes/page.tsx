"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useAuth } from "@/components/auth-provider"
import { TestimonialsSection } from "@/components/testimonials-section"
import {
  Play,
  Square,
  Search,
  Rocket,
  Server,
  ArrowUp,
  Shield,
  Tag,
  Calendar,
  Infinity,
  Info,
  Users,
  Zap,
  Crown,
  MessageCircle,
} from "lucide-react"
import { SITE_LOGO, FRAMEWORKS, SPONSOR_BANNERS } from "@/lib/constants"

const UPVOTES_SPONSOR_BANNERS = [
  "https://upload.narco.gg/uploads/2025/12/01/XvxjfGV_20251201051034_b3of1563.png",
  "https://i.gyazo.com/e6c86b86e7f82ae61e2b4f781a12c0b2.gif",
  "https://iili.io/K2HTAbe.gif",
  "https://santaimagens.roleplayrp.com/img/imagens_variadas/connect/bannersanta.png",
]

// CFX.re API Integration
const cfxApi = {
  // Validate server ID format to prevent SSRF
  isValidServerId(serverId: string): boolean {
    // Only allow alphanumeric characters and dashes/underscores
    return /^[a-zA-Z0-9_-]+$/.test(serverId) && serverId.length <= 50
  },

  async getServerInfo(serverEndpoint: string) {
    try {
      let serverId = serverEndpoint
      if (serverEndpoint.includes("cfx.re/join/")) {
        serverId = serverEndpoint.split("cfx.re/join/")[1]
      }

      // Validate server ID to prevent SSRF
      if (!this.isValidServerId(serverId)) {
        throw new Error("Invalid server ID format")
      }

      const response = await fetch(`https://servers-frontend.fivem.net/api/servers/single/${serverId}`)
      if (!response.ok) throw new Error("Server not found")
      const serverData = await response.json()
      const ipAddress = serverData.Data?.connectEndPoints?.[0] || serverData.EndPoint || "N/A"
      return {
        ...serverData,
        ipAddress: ipAddress,
        ping: Math.floor(Math.random() * 100) + 20,
        premium: serverData.Data?.vars?.premium === "true",
        verified: true,
      }
    } catch (error) {
      console.error("CFX API Error:", error)
      throw error
    }
  },

  async getServerPlayers(serverEndpoint: string) {
    try {
      let serverId = serverEndpoint
      if (serverEndpoint.includes("cfx.re/join/")) {
        serverId = serverEndpoint.split("cfx.re/join/")[1]
      }

      // Validate server ID to prevent SSRF
      if (!this.isValidServerId(serverId)) {
        throw new Error("Invalid server ID format")
      }

      const response = await fetch(`https://servers-frontend.fivem.net/api/servers/single/${serverId}`)
      if (!response.ok) throw new Error("Players not found")
      const data = await response.json()
      return data.Data?.players || []
    } catch (error) {
      console.error("CFX Players API Error:", error)
      return []
    }
  },
}

interface ServerInfo {
  Data: {
    hostname: string
    clients: number
    sv_maxclients: number
    upvotePower: number
    gametype: string
    vars?: {
      banner_detail?: string
      tags?: string
      premium?: string
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

interface LogEntry {
  id: number
  message: string
  type: "info" | "success" | "warning" | "error" | "process"
  timestamp: string
}

export default function UpvotesPage() {
  const { user } = useAuth()
  const [currentAd, setCurrentAd] = useState(0)
  const adBanners = SPONSOR_BANNERS
  const [currentSponsorBanner, setCurrentSponsorBanner] = useState(0)

  const [serverInput, setServerInput] = useState("")
  const [upvotesInput, setUpvotesInput] = useState("")
  const [serverStatus, setServerStatus] = useState<"idle" | "validating" | "valid" | "invalid">("idle")
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null)
  const [showUdgModal, setShowUdgModal] = useState(false)
  const [udgKeyInput, setUdgKeyInput] = useState("")
  const [onlinePlayers, setOnlinePlayers] = useState<Player[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [showPriceModal, setShowPriceModal] = useState(false)
  const logIdRef = useRef(0)

  const [state, setState] = useState({
    progress: 0,
    isRunning: false,
    startTime: null as number | null,
    totalUpvotes: 0,
    targetUpvotes: 0,
    udgKeyVerified: false,
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)

  const addLog = useCallback((message: string, type: LogEntry["type"] = "info") => {
    // Sanitize log messages to prevent XSS
    const sanitizeMessage = (msg: string): string => {
      const div = document.createElement("div")
      div.textContent = msg
      return div.innerHTML
    }

    const sanitizedMessage = sanitizeMessage(message)

    const timestamp = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    setLogs((prev) => [...prev.slice(-99), { id: logIdRef.current++, message: sanitizedMessage, type, timestamp }])
    setTimeout(() => logsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % adBanners.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [adBanners.length])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSponsorBanner((prev) => (prev + 1) % UPVOTES_SPONSOR_BANNERS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const validateServer = async (address: string) => {
    if (!address.trim()) {
      addLog("Invalid Input: Please enter a server address", "error")
      return false
    }

    setServerStatus("validating")
    setIsValidating(true)

    try {
      addLog(`Initializing connection to server: ${address}`, "info")
      addLog(`Establishing secure connection...`, "info")
      const serverData = await cfxApi.getServerInfo(address)
      setIsValidating(false)
      setServerInfo(serverData)
      setServerStatus("valid")

      addLog(`Analyzing server infrastructure...`, "info")
      addLog(`Retrieving active player data from server...`, "info")
      const playersData = await cfxApi.getServerPlayers(address)
      const players = Array.isArray(playersData)
        ? playersData.map(
            (
              player: {
                name?: string
                Name?: string
                nickname?: string
                id?: number
                Id?: number
                identifiers?: string[]
                Identifiers?: string[]
              },
              i: number,
            ) => {
              const playerName = (player?.name || player?.Name || player?.nickname || `Player ${i + 1}`)
                .toString()
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
              return {
                id: player?.id || player?.Id || i,
                name: playerName,
                avatar: SITE_LOGO,
                server: serverData.Data.hostname,
                identifiers: player?.identifiers || player?.Identifiers || [],
              }
            },
          )
        : []
      setOnlinePlayers(players)

      addLog(`Server connection established successfully`, "success")
      // Sanitize server hostname before displaying
      const sanitizedHostname = serverData.Data.hostname.replace(/</g, "&lt;").replace(/>/g, "&gt;")
      addLog(`Server: ${sanitizedHostname}`, "success")
      addLog(`IP Address: ${serverData.ipAddress}`, "info")
      addLog(`Active Players: ${serverData.Data.clients}/${serverData.Data.sv_maxclients}`, "info")
      addLog(`Upvote Power Index: ${serverData.Data.upvotePower}`, "info")
      addLog(`Player database synchronized: ${players.length} active users`, "success")
      return true
    } catch (error) {
      setIsValidating(false)
      setServerStatus("invalid")
      setServerInfo(null)
      addLog(`Connection failed: Unable to reach server`, "error")
      addLog(`Error: ${error instanceof Error ? error.message : "Unknown error"}`, "error")
      return false
    }
  }

  const startProcess = () => {
    if (!serverInfo) return
    const amount = Number.parseInt(upvotesInput)
    if (isNaN(amount) || amount < 1 || amount > 50000) {
      addLog("Invalid Amount: Please enter a number between 1 and 50,000", "error")
      return
    }

    setState((prev) => ({
      ...prev,
      targetUpvotes: amount,
      isRunning: true,
      startTime: Date.now(),
      progress: 0,
      totalUpvotes: 0,
    }))

    addLog(`Initializing upvote delivery system`, "process")
    addLog(`Target upvotes: ${amount}`, "info")
    addLog(`Destination: ${serverInfo.Data.hostname}`, "info")
    addLog(`Encrypting data packets...`, "info")
    addLog(`Estimated time: ${Math.ceil(amount / 100)} seconds`, "info")

    let lastLoggedProgress = 0
    intervalRef.current = setInterval(() => {
      setState((prev) => {
        if (!prev.isRunning) return prev
        const newProgress = Math.min(prev.progress + (100 / 30000) * 100, 100)
        const newTotal = Math.floor(prev.targetUpvotes * (newProgress / 100))

        if (Math.floor(newProgress / 10) > Math.floor(lastLoggedProgress / 10)) {
          const progressPercent = Math.floor(newProgress / 10) * 10
          addLog(
            `Upvote delivery progress: ${progressPercent}% | ${newTotal}/${prev.targetUpvotes} packets sent`,
            "process",
          )
          lastLoggedProgress = newProgress
        }

        if (newProgress >= 95 && !prev.udgKeyVerified) {
          addLog(`Security checkpoint activated at 95%`, "warning")
          addLog(`License verification required to continue`, "warning")
          addLog(`Process temporarily suspended`, "warning")
          setShowUdgModal(true)
          return { ...prev, progress: newProgress, totalUpvotes: newTotal, isRunning: false }
        }

        if (newProgress >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          addLog(`Upvote delivery completed successfully!`, "success")
          addLog(`Total upvotes delivered: ${newTotal}`, "success")
          addLog(`Server ranking boost applied!`, "success")
          return { ...prev, progress: 100, totalUpvotes: newTotal, isRunning: false }
        }

        return { ...prev, progress: newProgress, totalUpvotes: newTotal }
      })
    }, 100)
  }

  const stopProcess = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setState((prev) => ({ ...prev, isRunning: false, progress: 0, totalUpvotes: 0 }))
    addLog(`Process terminated by user request`, "warning")
    addLog(`Partial delivery: ${state.totalUpvotes} upvotes sent`, "info")
  }

  const handleUdgKeySubmit = () => {
    const validKeys = ["RUNKZERIGALA-UDGKEY", "ADMIN-RUNKZERIGALA", "FIVEMTOOLS-V7-PRO", "UDG-LIFETIME-2025"]
    addLog(`Authenticating license key...`, "info")
    if (validKeys.includes(udgKeyInput.trim().toUpperCase())) {
      setState((prev) => ({ ...prev, udgKeyVerified: true, isRunning: true }))
      setShowUdgModal(false)
      setUdgKeyInput("")
      addLog(`License authentication successful`, "success")
      addLog(`Security clearance granted`, "success")
      addLog(`Resuming upvote delivery process`, "success")

      intervalRef.current = setInterval(() => {
        setState((prev) => {
          const newProgress = Math.min(prev.progress + (100 / 30000) * 100, 100)
          const newTotal = Math.floor(prev.targetUpvotes * (newProgress / 100))
          if (newProgress >= 100) {
            if (intervalRef.current) clearInterval(intervalRef.current)
            addLog(`Upvote delivery completed successfully!`, "success")
            addLog(`Total upvotes delivered: ${newTotal}`, "success")
            addLog(`Server ranking boost applied!`, "success")
            return { ...prev, progress: 100, totalUpvotes: newTotal, isRunning: false }
          }
          return { ...prev, progress: newProgress, totalUpvotes: newTotal }
        })
      }, 100)
    } else {
      addLog(`License authentication failed`, "error")
      addLog(`Invalid or expired license key`, "error")
      setUdgKeyInput("")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar frameworks={FRAMEWORKS} />
      <main className="md:ml-72 transition-all duration-300">
        <Header />
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <div className="w-full overflow-hidden rounded-xl border border-border bg-card">
            <div className="relative">
              {UPVOTES_SPONSOR_BANNERS.map((banner, index) => (
                <img
                  key={index}
                  src={banner || "/placeholder.svg"}
                  alt={`Sponsor Banner ${index + 1}`}
                  className={`w-full h-auto max-h-48 object-cover transition-opacity duration-500 ${
                    index === currentSponsorBanner ? "opacity-100" : "opacity-0 absolute inset-0"
                  }`}
                />
              ))}
            </div>
            {/* Banner indicators */}
            <div className="flex justify-center gap-2 p-2 bg-card/80">
              {UPVOTES_SPONSOR_BANNERS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSponsorBanner(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSponsorBanner
                      ? "bg-primary w-6"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="hidden lg:block space-y-4">
              <div className="glass rounded-xl p-4">
                <h3 className="font-bold text-foreground mb-4 text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Supported Frameworks
                </h3>
                <div className="space-y-3">
                  {FRAMEWORKS.filter((f) => f.id !== "standalone").map((framework) => (
                    <div
                      key={framework.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50 hover:bg-secondary transition-colors"
                    >
                      <img
                        src={framework.logo || "/placeholder.svg"}
                        alt={framework.name}
                        className="w-10 h-10 rounded-lg object-contain bg-background p-1"
                      />
                      <div>
                        <p className="font-medium text-foreground text-sm">{framework.name}</p>
                        <p className="text-xs text-muted-foreground">{framework.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between glass p-4 rounded-xl">
                <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <img src={SITE_LOGO || "/placeholder.svg"} className="w-8 h-8 rounded-lg" alt="Logo" />
                  FiveM UDG V7.0
                </h1>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 status-online rounded-full animate-pulse" />
                  <span className="text-xs text-muted-foreground">Live</span>
                </div>
              </div>

              {/* Server Configuration */}
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Server className="h-5 w-5 text-primary" />
                  Server Configuration
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="cfx.re/join/xxxxx or Server ID"
                      value={serverInput}
                      onChange={(e) => setServerInput(e.target.value)}
                      className="bg-secondary/50 border-border text-foreground flex-1"
                    />
                    <Button
                      onClick={() => validateServer(serverInput)}
                      disabled={isValidating}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isValidating ? <LoadingSpinner size="sm" /> : <Search className="w-4 h-4" />}
                    </Button>
                  </div>

                  {serverStatus === "valid" && serverInfo && (
                    <div className="bg-gradient-to-br from-success/10 via-card to-accent/10 rounded-xl p-6 border-2 border-success/30">
                      {serverInfo.Data.vars?.banner_detail && (
                        <div className="mb-4 rounded-lg overflow-hidden border border-border">
                          <img
                            src={serverInfo.Data.vars.banner_detail || "/placeholder.svg"}
                            alt="Server Banner"
                            className="w-full h-32 object-cover"
                            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-8 w-8 rounded-full status-online flex items-center justify-center">
                          <Zap className="h-4 w-4 text-background" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-foreground text-lg">{serverInfo.Data.hostname}</h4>
                          <p className="text-xs text-muted-foreground">{serverInfo.ipAddress}</p>
                        </div>
                        {serverInfo.premium && <Crown className="h-5 w-5 text-warning" />}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-secondary/50 rounded-lg p-3 text-center border border-border/50">
                          <div className="text-2xl font-bold text-info">
                            {serverInfo.Data.clients}/{serverInfo.Data.sv_maxclients}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">Players Online</div>
                        </div>
                        <div className="bg-secondary/50 rounded-lg p-3 text-center border border-border/50">
                          <div className="text-2xl font-bold text-success">{serverInfo.Data.upvotePower}</div>
                          <div className="text-xs text-muted-foreground mt-1">Upvote Power</div>
                        </div>
                        <div className="bg-secondary/50 rounded-lg p-3 text-center border border-border/50">
                          <div className="text-2xl font-bold text-chart-3">{serverInfo.ping}ms</div>
                          <div className="text-xs text-muted-foreground mt-1">Ping</div>
                        </div>
                        <div className="bg-secondary/50 rounded-lg p-3 text-center border border-border/50">
                          <div className="text-lg font-bold text-chart-5">{serverInfo.Data.gametype}</div>
                          <div className="text-xs text-muted-foreground mt-1">Game Type</div>
                        </div>
                      </div>
                      {serverInfo.Data.vars?.tags && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {serverInfo.Data.vars.tags
                            .split(",")
                            .slice(0, 6)
                            .map((tag, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/30"
                              >
                                {tag.trim()}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Upvotes Process */}
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <ArrowUp className="h-5 w-5 text-success" />
                  Upvotes Process
                </h3>
                <div className="space-y-4">
                  <Input
                    type="number"
                    placeholder="Target Upvotes (1-50,000)"
                    value={upvotesInput}
                    onChange={(e) => setUpvotesInput(e.target.value)}
                    className="bg-secondary/50 border-border text-foreground"
                  />

                  <div className="flex gap-2">
                    {!state.isRunning ? (
                      <Button
                        onClick={startProcess}
                        disabled={serverStatus !== "valid"}
                        className="flex-1 bg-success hover:bg-success/90"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Launch Process
                      </Button>
                    ) : (
                      <Button onClick={stopProcess} className="flex-1 bg-destructive hover:bg-destructive/90">
                        <Square className="w-4 h-4 mr-2" />
                        Stop Process
                      </Button>
                    )}
                  </div>

                  {state.progress > 0 && (
                    <div className="space-y-3 bg-secondary/30 rounded-lg p-4 border border-border">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-foreground font-bold">{state.progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={state.progress} className="h-3" />
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="bg-secondary/50 rounded-lg p-3">
                          <div className="text-2xl font-bold text-success">{state.totalUpvotes}</div>
                          <div className="text-xs text-muted-foreground">Upvotes Sent</div>
                        </div>
                        <div className="bg-secondary/50 rounded-lg p-3">
                          <div className="text-2xl font-bold text-chart-3">{state.targetUpvotes}</div>
                          <div className="text-xs text-muted-foreground">Target</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Right */}
            <div className="space-y-6">
              {/* Video Sponsor */}
              <div className="rounded-xl overflow-hidden border border-border bg-card">
                <video
                  src="https://r2.fivemanage.com/pjW8diq5cgbXePkRb7YQg/ts(1).mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto"
                />
              </div>

              {/* Online Players */}
              <div className="glass rounded-xl p-5">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  Online Players {onlinePlayers.length > 0 && `(${onlinePlayers.length})`}
                </h3>
                <div className="max-h-[300px] overflow-y-auto space-y-2 scrollbar-thin">
                  {onlinePlayers.length > 0 ? (
                    onlinePlayers.slice(0, 20).map((player) => (
                      <div
                        key={player.id}
                        className="p-3 rounded-lg bg-secondary/50 border border-border/50 hover:bg-secondary transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={player.avatar || "/placeholder.svg"}
                              alt={player.name}
                              className="w-8 h-8 rounded-full border-2 border-success"
                            />
                            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 status-online rounded-full border-2 border-background" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{player.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{player.server}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">No players online</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">Validate a server to see players</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Process Logs */}
              <div className="glass rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground flex items-center gap-2 text-sm">
                    <Rocket className="h-4 w-4 text-accent" />
                    Process Logs
                  </h3>
                  <Button onClick={() => setLogs([])} variant="ghost" size="sm" className="h-6 text-xs">
                    Clear
                  </Button>
                </div>
                <div className="bg-background/50 rounded-lg p-3 h-64 overflow-y-auto font-mono text-xs border border-border scrollbar-thin">
                  {logs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No logs yet...</p>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className="mb-1">
                        <span className="text-muted-foreground/50 mr-2">{log.timestamp}</span>
                        <span
                          className={`${
                            log.type === "error"
                              ? "text-destructive"
                              : log.type === "success"
                                ? "text-success"
                                : log.type === "warning"
                                  ? "text-warning"
                                  : log.type === "process"
                                    ? "text-info"
                                    : "text-muted-foreground"
                          }`}
                        >
                          {log.message}
                        </span>
                      </div>
                    ))
                  )}
                  <div ref={logsEndRef} />
                </div>
              </div>

              {/* Pricing Button */}
              <Button
                onClick={() => setShowPriceModal(true)}
                className="w-full bg-gradient-to-r from-warning to-chart-5 hover:from-warning/90 hover:to-chart-5/90 h-12 text-base font-bold text-background"
              >
                <Tag className="h-5 w-5 mr-2" />
                View Pricing & Get UDG Key
              </Button>
            </div>
          </div>

          {/* Testimonials */}
          <TestimonialsSection />

          {/* UDG License Modal */}
          <Dialog open={showUdgModal} onOpenChange={() => {}}>
            <DialogContent className="max-w-md glass border-2 border-chart-3/30">
              <div className="p-6 space-y-4">
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-info/30 blur-2xl rounded-full animate-pulse" />
                    <Shield className="h-20 w-20 text-info mx-auto mb-4 relative" />
                  </div>
                  <h2 className="text-2xl font-bold gradient-text">Security Checkpoint</h2>
                  <p className="text-sm text-muted-foreground mt-2">Process paused at 95%</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Please enter your UDG License Key to continue</p>
                </div>
                <Input
                  type="password"
                  placeholder="Enter UDG License Key"
                  value={udgKeyInput}
                  onChange={(e) => setUdgKeyInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleUdgKeySubmit()}
                  className="bg-secondary/50 border-border text-foreground h-12 text-center font-mono"
                />
                <div className="flex gap-2">
                  <Button onClick={handleUdgKeySubmit} className="flex-1 bg-success hover:bg-success/90 h-12">
                    <Zap className="h-4 w-4 mr-2" />
                    Verify License
                  </Button>
                  <Button
                    onClick={() => {
                      setShowUdgModal(false)
                      setShowPriceModal(true)
                    }}
                    variant="outline"
                    className="h-12"
                  >
                    <Tag className="h-4 w-4 mr-2" />
                    Buy License
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Pricing Modal */}
          <Dialog open={showPriceModal} onOpenChange={setShowPriceModal}>
            <DialogContent className="max-w-4xl glass border-2 border-warning/30">
              <div className="p-6">
                <div className="text-center mb-8">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-warning/30 blur-2xl rounded-full animate-pulse" />
                    <Tag className="h-20 w-20 text-warning mx-auto mb-4 relative" />
                  </div>
                  <h2 className="text-3xl font-bold gradient-text">FiveM UDG V 7.0 Pricing</h2>
                  <p className="text-sm text-muted-foreground mt-2">Choose the perfect plan for your server</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Monthly Plan */}
                  <div className="bg-gradient-to-br from-info/10 to-chart-3/10 rounded-2xl p-6 border-2 border-info/30 hover:border-info/50 transition-all">
                    <div className="text-center mb-4">
                      <Calendar className="h-12 w-12 text-info mx-auto mb-3" />
                      <h3 className="text-2xl font-bold text-foreground">Monthly Plan</h3>
                      <div className="text-4xl font-black text-info my-4">$425</div>
                      <p className="text-xs text-muted-foreground">per month</p>
                    </div>
                    <div className="space-y-2 mb-6">
                      {["50,000 Upvotes/Month", "Basic PowerBoost", "Standard Analytics", "Email Support"].map(
                        (feature, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Zap className="h-4 w-4 text-success" />
                            {feature}
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Lifetime Plan */}
                  <div className="bg-gradient-to-br from-warning/10 to-chart-5/10 rounded-2xl p-6 border-2 border-warning/50 hover:border-warning/70 transition-all relative">
                    <div className="absolute -top-3 right-4">
                      <span className="bg-gradient-to-r from-warning to-chart-5 text-background text-xs font-bold px-3 py-1 rounded-full">
                        BEST VALUE
                      </span>
                    </div>
                    <div className="text-center mb-4">
                      <Infinity className="h-12 w-12 text-warning mx-auto mb-3" />
                      <h3 className="text-2xl font-bold text-foreground">Lifetime Plan</h3>
                      <div className="text-4xl font-black text-warning my-4">$750</div>
                      <p className="text-xs text-muted-foreground">one-time payment</p>
                    </div>
                    <div className="space-y-2 mb-6">
                      {[
                        "Unlimited Upvotes",
                        "Advanced PowerBoost",
                        "Professional Analytics",
                        "Priority 24/7 Support",
                        "Lifetime Updates",
                        "Custom Branding",
                      ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Zap className="h-4 w-4 text-success" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/30 rounded-xl p-6 border border-border/50 mb-6">
                  <div className="flex items-start gap-4">
                    <Info className="h-10 w-10 text-info flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-foreground mb-2">How to Purchase</h4>
                      <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                        <li>Click the button below to join our Discord server</li>
                        <li>Open a ticket in the #support channel</li>
                        <li>Choose your plan and complete the payment</li>
                        <li>Receive your UDG License Key instantly</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => window.open("https://discord.gg/fivemtools", "_blank")}
                  className="w-full bg-gradient-to-r from-chart-3 to-primary hover:from-chart-3/90 hover:to-primary/90 h-14 text-lg font-bold"
                >
                  <MessageCircle className="h-5 w-5 mr-3" />
                  Join Discord & Purchase Now
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  )
}
