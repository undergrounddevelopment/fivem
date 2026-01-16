"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Zap, 
  Terminal, 
  Shield, 
  UserPlus, 
  Monitor, 
  RefreshCcw, 
  Lock, 
  Trash2,
  CheckCircle2,
  AlertCircle,
  Bot,
  Tag,
  Key,
  CreditCard,
  Upload,
  MessageCircle,
  Target,
  Search,
  BarChart2,
  ClipboardList,
  Wifi,
  Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import Image from "next/image"

// --- Constants ---
const ROCKSTAR_LOGO = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Rockstar_Games_Logo.svg/2226px-Rockstar_Games_Logo.svg.png"
const LOGO_GIF = "https://fivemtools.net/logo.gif"

const VALID_KEYS = [
  "FIVEM-TOOLS-V7-2026-PREMIUM",
  "VIP-FAKEPLAYER-MASTER-KEY",
  "UDG-LICENSE-PREMIUM-2026",
  "FIVEMTOOLS-VIP-LIFETIME-KEY"
]

const SPOOF_NAMES = [
  "Ghost_Operator", "Nexus_Elite", "Alpha_System", "Shadow_User", 
  "FiveM_Dev", "Carbon_X", "Matrix_Admin", "Silent_Mod", 
  "Gamer_Pro", "Root_Access", "Tech_Ninja", "Cyber_Ghost"
]

interface LogMessage {
  id: string
  text: string
  type: 'info' | 'success' | 'warning' | 'error' | 'system'
  timestamp: string
}

interface PlayerSession {
  id: string
  name: string
  status: string
  ping: number
}

export default function FakePlayerPage() {
  // --- States ---
  const [licenseKey, setLicenseKey] = useState("")
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [targetServer, setTargetServer] = useState("")
  const [isMonitorConnected, setIsMonitorConnected] = useState(false)
  
  const [customName, setCustomName] = useState("Ghost_Operator")
  const [customPing, setCustomPing] = useState(22)
  const [customSteam, setCustomSteam] = useState("steam:1100001*******")
  const [customRockstar, setCustomRockstar] = useState("Click RANDOMIZE to generate")
  
  const [isInjecting, setIsInjecting] = useState(false)
  const [logs, setLogs] = useState<LogMessage[]>([
    { id: 'start-1', text: "FiveM Tools V7.0 initialized.", type: 'success', timestamp: new Date().toLocaleTimeString() },
    { id: 'start-2', text: "System Ready.", type: 'info', timestamp: new Date().toLocaleTimeString() }
  ])
  const [sessions, setSessions] = useState<PlayerSession[]>([])
  
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false)
  const [purchaseEmail, setPurchaseEmail] = useState("")
  
  const consoleRef = useRef<HTMLDivElement>(null)

  // --- Helpers ---
  const addLog = (text: string, type: LogMessage['type'] = 'info') => {
    const newMessage: LogMessage = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      type,
      timestamp: new Date().toLocaleTimeString()
    }
    setLogs(prev => [newMessage, ...prev].slice(0, 50))
  }

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = 0
    }
  }, [logs])

  // --- Actions ---
  const handleVerify = (key: string) => {
    if (VALID_KEYS.includes(key.trim().toUpperCase())) {
      setIsAuthorized(true)
      addLog("Authentication successful. VIP Session Active.", "success")
    } else if (key.length > 5) {
      addLog("Invalid License Key. Authorization failed.", "error")
    }
  }

  const handleRandomize = () => {
    const name = SPOOF_NAMES[Math.floor(Math.random() * SPOOF_NAMES.length)] + "_" + Math.floor(Math.random() * 99)
    const ping = Math.floor(Math.random() * 40) + 12
    const steam = `steam:1100001${Math.random().toString(16).substr(2, 8)}`
    const rockstar = `R*-` + Array.from({length: 4}, () => Math.random().toString(36).toUpperCase().substr(2, 5)).join('-')
    
    setCustomName(name)
    setCustomPing(ping)
    setCustomSteam(steam)
    setCustomRockstar(rockstar)
    addLog(`Identity Randomized: ${name}`, "system")
  }

  const handleInitiateSpoof = async () => {
    if (!isAuthorized) {
      addLog("ACCESS DENIED: Enter valid VIP License Key.", "error")
      return
    }
    if (!targetServer) {
      addLog("ERROR: Target Server Code/IP missing.", "error")
      return
    }

    setIsInjecting(true)
    addLog(`Initiating injection flow to ${targetServer}...`, "warning")
    
    await new Promise(r => setTimeout(r, 1000))
    addLog("Bypassing server token verification...", "info")
    await new Promise(r => setTimeout(r, 1000))
    addLog("Injecting spoofed license credentials...", "info")
    await new Promise(r => setTimeout(r, 800))
    
    const newSession: PlayerSession = {
      id: Math.random().toString(36).substr(2, 6).toUpperCase(),
      name: customName,
      status: "CONNECTED",
      ping: customPing
    }
    
    setSessions(prev => [newSession, ...prev])
    setIsInjecting(false)
    addLog(`SPOOF SUCCESSFUL: ${customName} is now active.`, "success")
  }

  const handleConnectMonitor = () => {
    if (!targetServer) {
      addLog("ERROR: No server target specified.", "error")
      return
    }
    setIsMonitorConnected(true)
    addLog(`Monitor established connection to: ${targetServer}`, "success")
  }

  const handlePurchase = async () => {
    if (!purchaseEmail) return
    addLog("Purchase signal sent. Check Discord for payment link.", "info")
    setIsPurchaseOpen(false)
  }

  return (
    <div className="min-h-screen flex flex-col select-none text-white font-sans relative" 
      style={{
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.95)), url("https://www.transparenttextures.com/patterns/carbon-fibre.png")',
        backgroundAttachment: 'fixed'
      }}>

      {/* Header */}
      <header className="h-16 border-b border-[#222] bg-black/90 flex items-center justify-between px-6 z-50 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border border-red-900 bg-red-900/10 rounded flex items-center justify-center animate-pulse">
            <Bot className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-xl font-black italic tracking-tighter text-white uppercase">
              FIVEM TOOLS <span className="text-red-600">V7.0</span>
            </h1>
            <div className="flex gap-3 text-[10px] font-mono font-bold text-gray-500 uppercase">
              <span><Wifi className="h-3 w-3 inline mr-1" /> BUILD 7021</span>
              <span><Shield className="h-3 w-3 inline mr-1" /> ADMIN ACCESS</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsPurchaseOpen(true)}
            className="bg-gradient-to-r from-yellow-600/20 to-yellow-900/20 hover:from-yellow-600 hover:to-yellow-500 text-yellow-500 hover:text-black border border-yellow-600 px-4 py-2 rounded font-bold text-[10px] uppercase transition flex items-center gap-2 shadow-[0_0_10px_rgba(202,138,4,0.2)]"
          >
            <Tag className="h-4 w-4 inline mr-2" /> BUY PREMIUM KEY <span className="bg-red-600 text-white px-1 rounded text-[8px] animate-pulse">-50%</span>
          </button>

          <div className="hidden md:flex items-center gap-3 bg-[#0a0a0a] border border-[#222] px-4 py-2 rounded-full">
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">License Status</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isAuthorized ? 'bg-success animate-pulse' : 'bg-gray-500'}`}></span>
                <span className={`text-[10px] font-mono ${isAuthorized ? 'text-success' : 'text-gray-500'}`}>
                  {isAuthorized ? 'REGISTERED VIP' : 'UNREGISTERED'}
                </span>
              </div>
            </div>
            <span className={`transition-opacity ${isAuthorized ? 'opacity-100' : 'opacity-40'}`}><Key className="h-4 w-4" /></span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 p-4 grid grid-cols-12 gap-4 overflow-hidden">

        {/* Left Column (3) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">

          {/* Server Connection */}
          <div className="tech-panel bg-[#111]/40 border border-[#222] rounded-lg overflow-hidden backdrop-blur-sm">
            <div className="bg-black/50 p-3 border-b border-[#333] flex justify-between items-center">
              <h2 className="text-xs font-bold text-gray-300 uppercase flex items-center gap-2">
                <TargetIcon /> Server Connection
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <input
                placeholder="Server Code / IP"
                className="w-full bg-black/60 border border-[#222] rounded p-2 text-center font-bold text-sm focus:border-red-600 transition"
                type="text"
                value={targetServer}
                onChange={(e) => setTargetServer(e.target.value)}
              />
              <button
                onClick={handleConnectMonitor}
                className="w-full bg-white text-black font-extrabold py-2 rounded text-xs uppercase hover:bg-gray-300 transition flex items-center justify-center gap-2"
              >
                <Monitor className="h-3 w-3" /> Connect Monitor
              </button>
            </div>
          </div>

          {/* Spoof Configuration */}
          <div className="tech-panel bg-[#111]/40 border border-[#222] rounded-lg flex-1 flex flex-col overflow-hidden backdrop-blur-sm">
            <div className="bg-black/50 p-3 border-b border-[#333] flex justify-between items-center">
              <h2 className="text-xs font-bold text-gray-300 uppercase flex items-center gap-2">
                <SettingsIcon /> Spoof Configuration
              </h2>
              <button
                onClick={handleRandomize}
                className="text-[9px] bg-blue-900/30 text-blue-400 border border-blue-800 px-2 py-1 rounded hover:bg-blue-600 hover:text-white transition uppercase font-bold"
              >
                RANDOMIZE
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4">
              <div className="border border-yellow-500/30 bg-yellow-500/5 p-2 rounded shadow-[inset_0_0_10px_rgba(234,179,8,0.05)]">
                <label className="text-[9px] text-yellow-500 font-bold uppercase block mb-1">⭐ FiveM Tools V7.0 License</label>
                <input
                  placeholder="ENTER LICENSE KEY"
                  className="w-full bg-black/40 border border-yellow-500/20 rounded p-2 text-center font-bold tracking-widest text-[#fff] focus:border-yellow-500"
                  type="password"
                  value={licenseKey}
                  onChange={(e) => {
                    setLicenseKey(e.target.value)
                    handleVerify(e.target.value)
                  }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-[9px] text-gray-500 font-bold uppercase block mb-1">Identity Name</label>
                  <input
                    className="w-full bg-black/40 border border-[#222] rounded p-2 text-xs text-gray-200 focus:border-red-600"
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 font-bold uppercase block mb-1">Ping</label>
                  <input
                    className="w-full bg-black/40 border border-[#222] rounded p-2 text-green-500 font-bold text-xs"
                    type="number"
                    value={customPing}
                    onChange={(e) => setCustomPing(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <Image alt="logo" className="w-4 h-4 rounded-sm" src={LOGO_GIF} width={16} height={16} />
                  <label className="text-[9px] text-gray-500 font-bold uppercase">Steam Hex</label>
                </div>
                <input
                  readOnly
                  className="w-full bg-black/60 border border-[#222] rounded p-2 text-gray-400 text-[10px] font-mono"
                  type="text"
                  value={customSteam}
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <Image alt="rockstar" className="w-4 h-4" src={ROCKSTAR_LOGO} width={16} height={16} />
                  <label className="text-[9px] text-purple-500 font-bold uppercase">Rockstar License</label>
                </div>
                <input
                  readOnly
                  className="w-full bg-black/60 border border-[#222] rounded p-2 text-purple-400 text-[10px] font-mono"
                  type="text"
                  value={customRockstar}
                />
              </div>

              <button
                onClick={handleInitiateSpoof}
                disabled={isInjecting}
                className="w-full py-3 bg-red-600 text-white font-bold rounded shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:bg-red-700 transition uppercase text-xs tracking-widest flex justify-center items-center gap-2 mt-4"
              >
                <span>{isInjecting ? 'INJECTING...' : 'INITIATE SPOOF'}</span>
                {isInjecting ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Wifi className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (9) */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-4">

          {/* Live Feed */}
          <div className="tech-panel bg-[#111]/40 border border-[#222] h-[45%] min-h-[300px] rounded-lg relative overflow-hidden flex flex-col backdrop-blur-sm">
            <div className="h-8 bg-black/80 border-b border-[#333] flex items-center justify-between px-3">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <ActivityIcon /> LIVE SERVER FEED
              </span>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500/20" />
                <div className={`w-2 h-2 rounded-full ${isMonitorConnected ? 'bg-green-500 animate-pulse shadow-[0_0_5px_#22c55e]' : 'bg-green-500/20'}`} />
              </div>
            </div>
            <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
              {isMonitorConnected && targetServer ? (
                 <iframe
                   src={`https://servers.fivem.net/servers/detail/${targetServer.split('/').pop()}`}
                   className="w-full h-full border-none"
                   title="CFX Monitor"
                 />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Monitor className="h-8 w-8 text-gray-700" />
                  <span className="text-[10px] font-mono text-gray-600 uppercase tracking-tighter">READY TO CONNECT</span>
                </div>
              )}
              <div className="absolute inset-x-0 top-0 h-px bg-white/5 pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black to-transparent pointer-events-none" />
            </div>
          </div>

          <div className="flex-1 grid grid-cols-12 gap-4 min-h-[350px]">
            {/* Session List */}
            <div className="col-span-12 md:col-span-7 tech-panel bg-[#111]/40 border border-[#222] rounded-lg flex flex-col overflow-hidden backdrop-blur-sm">
              <div className="h-8 bg-black/80 border-b border-[#333] flex items-center justify-between px-3">
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                  <ListIcon /> Inject Session List
                </span>
              </div>
              <div className="flex-1 overflow-y-auto bg-[#080808]/80 custom-scrollbar">
                <table className="w-full text-[10px] text-left">
                  <thead className="bg-black/50 sticky top-0 border-b border-[#222]">
                    <tr>
                      <th className="py-2 px-4 uppercase text-gray-600 font-bold" style={{ width: '35%' }}>Name</th>
                      <th className="py-2 px-2 uppercase text-gray-600 font-bold" style={{ width: '20%' }}>ID</th>
                      <th className="py-2 px-4 uppercase text-gray-600 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-400">
                    {sessions.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center text-gray-600 py-12 italic uppercase tracking-widest">
                          No sessions yet. Click "INITIATE SPOOF" to start.
                        </td>
                      </tr>
                    ) : (
                      sessions.map((s) => (
                        <tr key={s.id} className="border-b border-[#222]/50 hover:bg-white/[0.02]">
                          <td className="py-2 px-4 font-bold text-gray-200">{s.name}</td>
                          <td className="py-2 px-2 font-mono text-gray-500">{s.id}</td>
                          <td className="py-2 px-4">
                            <span className="flex items-center gap-2 text-green-500 font-bold">
                              <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Console */}
            <div className="col-span-12 md:col-span-5 tech-panel bg-[#111]/40 border border-[#222] rounded-lg flex flex-col overflow-hidden backdrop-blur-sm">
              <div className="h-8 bg-black/80 border-b border-[#333] flex items-center justify-between px-3">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Terminal className="h-3 w-3" /> Client Console
                </span>
                <Monitor className="h-4 w-4 text-gray-600" />
              </div>
              <div
                ref={consoleRef}
                className="flex-1 p-3 overflow-y-auto bg-black text-gray-300 font-mono text-[9px] leading-relaxed custom-scrollbar"
              >
                <div className="space-y-1">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className={`flex gap-2 ${
                        log.type === 'success' ? 'text-green-600' :
                        log.type === 'error' ? 'text-red-600' :
                        log.type === 'warning' ? 'text-amber-500' :
                        log.type === 'system' ? 'text-blue-500' : 'text-gray-500'
                      }`}
                    >
                      <span className="opacity-40">[{log.timestamp}]</span>
                      <span className="flex-1">{log.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Upgrade Modal */}
      <Dialog open={isPurchaseOpen} onOpenChange={setIsPurchaseOpen}>
        <DialogContent showCloseButton={false} className="bg-transparent border-none p-0 max-w-md overflow-visible focus:outline-none">
          <div className="modal-box relative bg-[#111] border border-[#222] rounded-lg shadow-2xl">
            <button
              onClick={() => setIsPurchaseOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors z-50"
            >
              <Trash2 className="h-4 w-4" /> {/* Replacing fa-xmark with Trash2 or close icon */}
            </button>
            <div className="p-6">
              <div className="text-center mb-6">
                <DialogTitle className="text-xl font-black italic text-white uppercase tracking-tighter">
                  GET <span className="text-red-600">PREMIUM KEY</span>
                </DialogTitle>
                <div className="flex items-center justify-center gap-3 my-3 bg-white/5 p-2 rounded-lg border border-white/10">
                  <span className="text-gray-500 line-through text-sm font-bold font-mono">$300.00</span>
                  <span className="text-gray-600 text-xs">→</span>
                  <span className="text-green-500 text-3xl font-black tracking-tighter animate-pulse">$150.00</span>
                  <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded ml-1 animate-bounce">-50% OFF</span>
                </div>
                <DialogDescription className="text-[10px] text-gray-500 font-mono mt-1 uppercase">
                  INSTANT DELIVERY (5-10 MINS)
                </DialogDescription>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 p-3 rounded mb-4 text-center group hover:border-blue-500 transition-all">
                <p className="text-[9px] text-gray-400 mb-2 uppercase font-bold">1. Purchase Gift Card Here</p>
                <a
                  href="https://www.g2a.com/paypal-gift-card-150-eur-by-rewarble-global-i10000339995122"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded text-xs transition shadow-lg shadow-blue-900/20 group-hover:shadow-blue-500/40"
                >
                  <CreditCard className="h-4 w-4 mr-2" /> BUY $150 PAYPAL CARD (G2A)
                </a>
              </div>

              <div className="space-y-3">
                <p className="text-[9px] text-gray-400 uppercase font-bold text-center">2. Submit Details for Key</p>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="Discord Name (e.g. User#1234)"
                    className="input-cyber rounded p-3 w-full border border-gray-700 focus:border-red-600 text-xs"
                    type="text"
                    onChange={(e) => setPurchaseEmail(e.target.value)} // Reusing purchaseEmail for Discord Name
                  />
                  <input
                    placeholder="Discord ID (Numeric)"
                    className="input-cyber rounded p-3 w-full border border-gray-700 focus:border-red-600 text-xs"
                    type="text"
                  />
                </div>
                <select className="input-cyber rounded p-3 w-full border border-gray-700 focus:border-red-600 text-gray-400 text-xs bg-black">
                  <option value="PAYPAL_GIFTCARD">PAYPAL GIFT CARD ($150 USD)</option>
                </select>
                <input
                  placeholder="PASTE GIFT CARD CODE HERE"
                  className="input-cyber rounded p-3 w-full border border-red-900/50 focus:border-red-600 text-center font-bold text-yellow-500 tracking-widest text-xs"
                  type="text"
                />
                <button
                  onClick={handlePurchase}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded text-sm uppercase shadow-[0_0_20px_rgba(220,38,38,0.4)] transition hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] disabled:opacity-50"
                >
                  <Upload className="h-4 w-4 mr-2" /> SUBMIT & GET KEY
                </button>
              </div>

              <div className="mt-4 text-center">
                <a
                  href="https://discord.gg/fivemtools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-blue-400 hover:text-white font-mono no-underline transition-colors"
                >
                  <MessageCircle className="h-4 w-4 mr-2 inline" /> Join Discord Support
                </a>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #444;
        }
        @keyframes tech-glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}

// --- Icons ---
function TargetIcon() {
  return <Target className="h-4 w-4 text-red-500" />
}

function SettingsIcon() {
  return <Search className="h-4 w-4 text-gray-500" />
}

function ActivityIcon() {
  return <BarChart2 className="h-4 w-4 text-blue-500" />
}

function ListIcon() {
  return <ClipboardList className="h-4 w-4 text-yellow-500" />
}
