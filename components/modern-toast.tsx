"use client"

import { useEffect, useState, useRef, useLayoutEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, AlertTriangle, Info, X, Loader2, Zap, Gift, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastType = "success" | "error" | "warning" | "info" | "loading" | "xp" | "reward" | "achievement"

interface ToastData {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

// Lightning Electric Border - ULTRA VISIBLE VERSION
function LightningBorder({ color, width, height }: { color: string; width: number; height: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | null>(null)
  const timeRef = useRef(Math.random() * 1000)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || width < 10 || height < 10) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const pad = 50
    canvas.width = width + pad * 2
    canvas.height = height + pad * 2

    // Noise functions for organic lightning
    const hash = (n: number) => {
      const s = Math.sin(n) * 43758.5453123
      return s - Math.floor(s)
    }
    
    const noise = (x: number, y: number) => {
      const ix = Math.floor(x), iy = Math.floor(y)
      const fx = x - ix, fy = y - iy
      const a = hash(ix + iy * 57.0)
      const b = hash(ix + 1.0 + iy * 57.0)
      const c = hash(ix + (iy + 1.0) * 57.0)
      const d = hash(ix + 1.0 + (iy + 1.0) * 57.0)
      const ux = fx * fx * (3.0 - 2.0 * fx)
      const uy = fy * fy * (3.0 - 2.0 * fy)
      return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy
    }

    const fbm = (x: number, y: number, octaves: number) => {
      let value = 0, amplitude = 0.5, frequency = 1
      for (let i = 0; i < octaves; i++) {
        value += amplitude * noise(x * frequency, y * frequency)
        amplitude *= 0.5
        frequency *= 2
      }
      return value
    }

    // Get point on rounded rectangle path with normal
    const getPoint = (t: number, x: number, y: number, w: number, h: number, r: number) => {
      const perimeter = 2 * (w - 2 * r) + 2 * (h - 2 * r) + 2 * Math.PI * r
      let d = t * perimeter, acc = 0
      
      if (d < w - 2 * r) return { x: x + r + d, y: y, nx: 0, ny: -1 }
      acc = w - 2 * r
      if (d < acc + Math.PI * r / 2) {
        const a = (d - acc) / r - Math.PI / 2
        return { x: x + w - r + Math.cos(a) * r, y: y + r + Math.sin(a) * r, nx: Math.cos(a), ny: Math.sin(a) }
      }
      acc += Math.PI * r / 2
      if (d < acc + h - 2 * r) return { x: x + w, y: y + r + (d - acc), nx: 1, ny: 0 }
      acc += h - 2 * r
      if (d < acc + Math.PI * r / 2) {
        const a = (d - acc) / r
        return { x: x + w - r + Math.cos(a) * r, y: y + h - r + Math.sin(a) * r, nx: Math.cos(a), ny: Math.sin(a) }
      }
      acc += Math.PI * r / 2
      if (d < acc + w - 2 * r) return { x: x + w - r - (d - acc), y: y + h, nx: 0, ny: 1 }
      acc += w - 2 * r
      if (d < acc + Math.PI * r / 2) {
        const a = (d - acc) / r + Math.PI / 2
        return { x: x + r + Math.cos(a) * r, y: y + h - r + Math.sin(a) * r, nx: Math.cos(a), ny: Math.sin(a) }
      }
      acc += Math.PI * r / 2
      if (d < acc + h - 2 * r) return { x: x, y: y + h - r - (d - acc), nx: -1, ny: 0 }
      acc += h - 2 * r
      const a = (d - acc) / r + Math.PI
      return { x: x + r + Math.cos(a) * r, y: y + r + Math.sin(a) * r, nx: Math.cos(a), ny: Math.sin(a) }
    }

    let lastTime = 0
    const draw = (time: number) => {
      const dt = (time - lastTime) / 1000
      lastTime = time
      timeRef.current += dt * 4 // Faster animation

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const bx = pad, by = pad, bw = width, bh = height, br = 16
      const segments = 150

      // Layer 1: Outer glow (very wide, soft)
      ctx.save()
      ctx.globalAlpha = 0.4
      ctx.strokeStyle = color
      ctx.lineWidth = 12
      ctx.shadowColor = color
      ctx.shadowBlur = 35
      ctx.lineCap = "round"
      ctx.beginPath()
      for (let i = 0; i <= segments; i++) {
        const t = i / segments
        const pt = getPoint(t, bx, by, bw, bh, br)
        const noiseVal = fbm(t * 8 + timeRef.current * 0.3, 0, 4) - 0.5
        const dx = pt.nx * noiseVal * 35
        const dy = pt.ny * noiseVal * 35
        i === 0 ? ctx.moveTo(pt.x + dx, pt.y + dy) : ctx.lineTo(pt.x + dx, pt.y + dy)
      }
      ctx.closePath()
      ctx.stroke()
      ctx.restore()

      // Layer 2: Mid glow
      ctx.save()
      ctx.globalAlpha = 0.7
      ctx.strokeStyle = color
      ctx.lineWidth = 5
      ctx.shadowColor = color
      ctx.shadowBlur = 20
      ctx.lineCap = "round"
      ctx.beginPath()
      for (let i = 0; i <= segments; i++) {
        const t = i / segments
        const pt = getPoint(t, bx, by, bw, bh, br)
        const noiseVal = fbm(t * 10 + timeRef.current * 0.5, 5, 4) - 0.5
        const dx = pt.nx * noiseVal * 25
        const dy = pt.ny * noiseVal * 25
        i === 0 ? ctx.moveTo(pt.x + dx, pt.y + dy) : ctx.lineTo(pt.x + dx, pt.y + dy)
      }
      ctx.closePath()
      ctx.stroke()
      ctx.restore()

      // Layer 3: Core lightning (bright, thin)
      ctx.save()
      ctx.globalAlpha = 1
      ctx.strokeStyle = color
      ctx.lineWidth = 2.5
      ctx.shadowColor = color
      ctx.shadowBlur = 12
      ctx.lineCap = "round"
      ctx.beginPath()
      for (let i = 0; i <= segments; i++) {
        const t = i / segments
        const pt = getPoint(t, bx, by, bw, bh, br)
        const noiseVal = fbm(t * 12 + timeRef.current * 0.6, 10, 5) - 0.5
        const dx = pt.nx * noiseVal * 18
        const dy = pt.ny * noiseVal * 18
        i === 0 ? ctx.moveTo(pt.x + dx, pt.y + dy) : ctx.lineTo(pt.x + dx, pt.y + dy)
      }
      ctx.closePath()
      ctx.stroke()
      ctx.restore()

      // Layer 4: White hot core
      ctx.save()
      ctx.globalAlpha = 0.9
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 1.5
      ctx.shadowColor = color
      ctx.shadowBlur = 8
      ctx.lineCap = "round"
      ctx.beginPath()
      for (let i = 0; i <= segments; i++) {
        const t = i / segments
        const pt = getPoint(t, bx, by, bw, bh, br)
        const noiseVal = fbm(t * 12 + timeRef.current * 0.6, 10, 5) - 0.5
        const dx = pt.nx * noiseVal * 18
        const dy = pt.ny * noiseVal * 18
        i === 0 ? ctx.moveTo(pt.x + dx, pt.y + dy) : ctx.lineTo(pt.x + dx, pt.y + dy)
      }
      ctx.closePath()
      ctx.stroke()
      ctx.restore()

      // Random spark flashes
      if (Math.random() > 0.85) {
        const sparkT = Math.random()
        const pt = getPoint(sparkT, bx, by, bw, bh, br)
        ctx.save()
        ctx.globalAlpha = 0.8
        ctx.fillStyle = "#ffffff"
        ctx.shadowColor = color
        ctx.shadowBlur = 25
        ctx.beginPath()
        ctx.arc(pt.x + pt.nx * 5, pt.y + pt.ny * 5, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [width, height, color])

  if (width < 10 || height < 10) return null

  return (
    <canvas
      ref={canvasRef}
      className="absolute pointer-events-none"
      style={{ 
        top: -50, 
        left: -50, 
        width: width + 100, 
        height: height + 100,
        zIndex: 50
      }}
    />
  )
}

// State
let subs: Set<(t: ToastData[]) => void> = new Set()
let list: ToastData[] = []
const notify = () => subs.forEach(fn => fn([...list]))

const add = (t: Omit<ToastData, "id">) => {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 5)}`
  list = [...list, { ...t, id }]
  notify()
  if (t.type !== "loading") setTimeout(() => del(id), t.duration || 4500)
  return id
}
const del = (id: string) => { list = list.filter(t => t.id !== id); notify() }
const upd = (id: string, u: Partial<Omit<ToastData, "id">>) => {
  list = list.map(t => t.id === id ? { ...t, ...u } : t)
  notify()
  if (u.type && u.type !== "loading") setTimeout(() => del(id), u.duration || 4500)
}

export const Toast = {
  success: (title: string, msg?: string) => add({ type: "success", title, message: msg }),
  error: (title: string, msg?: string) => add({ type: "error", title, message: msg, duration: 5500 }),
  warning: (title: string, msg?: string) => add({ type: "warning", title, message: msg }),
  info: (title: string, msg?: string) => add({ type: "info", title, message: msg }),
  loading: (title: string, msg?: string) => add({ type: "loading", title, message: msg }),
  xp: (title: string, msg?: string) => add({ type: "xp", title, message: msg }),
  reward: (title: string, msg?: string) => add({ type: "reward", title, message: msg }),
  achievement: (title: string, msg?: string) => add({ type: "achievement", title, message: msg }),
  dismiss: del,
  update: upd,
  promise: async <T,>(p: Promise<T>, m: { loading: string; success: string; error: string }) => {
    const id = add({ type: "loading", title: m.loading })
    try { const r = await p; upd(id, { type: "success", title: m.success }); return r }
    catch (e) { upd(id, { type: "error", title: m.error }); throw e }
  }
}

// Forum theme colors - matching the site
const cfg: Record<ToastType, { icon: any; color: string }> = {
  success: { icon: CheckCircle, color: "#00ff88" },  // Neon green
  error: { icon: XCircle, color: "#ff3366" },        // Hot pink/red
  warning: { icon: AlertTriangle, color: "#ffaa00" }, // Orange
  info: { icon: Info, color: "#00ccff" },            // Cyan
  loading: { icon: Loader2, color: "#aa66ff" },      // Purple
  xp: { icon: Zap, color: "#00ff88" },               // Neon green
  reward: { icon: Gift, color: "#ff66aa" },          // Pink
  achievement: { icon: Trophy, color: "#ffcc00" }    // Gold
}

function ToastCard({ toast, onClose }: { toast: ToastData; onClose: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const c = cfg[toast.type]
  const Icon = c.icon

  useLayoutEffect(() => {
    if (!cardRef.current) return
    const update = () => {
      const rect = cardRef.current?.getBoundingClientRect()
      if (rect) setSize({ w: rect.width, h: rect.height })
    }
    update()
    const obs = new ResizeObserver(update)
    obs.observe(cardRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="relative"
      style={{ margin: 25, overflow: 'visible' }}
    >
      {/* Background glow */}
      <div 
        className="absolute rounded-2xl blur-3xl"
        style={{ 
          background: `radial-gradient(ellipse, ${c.color}70, transparent 60%)`,
          inset: -30
        }}
      />

      {/* Card */}
      <div 
        ref={cardRef}
        className="relative rounded-2xl bg-[#0d0d0d]/95 backdrop-blur-xl border border-white/10"
        style={{ minWidth: 300, maxWidth: 380, overflow: 'visible' }}
      >
        {/* Lightning border - positioned outside card */}
        {size.w > 0 && size.h > 0 && (
          <LightningBorder color={c.color} width={size.w} height={size.h} />
        )}

        {/* Inner gradient */}
        <div 
          className="absolute inset-0 rounded-2xl opacity-60 pointer-events-none"
          style={{ background: `linear-gradient(135deg, ${c.color}20, transparent 50%)` }}
        />

        <div className="relative z-20 p-4 flex gap-3">
          <div 
            className="shrink-0 h-11 w-11 rounded-xl flex items-center justify-center"
            style={{ 
              background: `linear-gradient(135deg, ${c.color}40, ${c.color}15)`,
              boxShadow: `0 0 30px ${c.color}50, inset 0 0 20px ${c.color}20`
            }}
          >
            <Icon className={cn("h-5 w-5", toast.type === "loading" && "animate-spin")} style={{ color: c.color }} />
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <p className="font-semibold text-white text-[15px] leading-tight">{toast.title}</p>
            {toast.message && <p className="text-white/60 text-[13px] mt-1">{toast.message}</p>}
          </div>

          {toast.type !== "loading" && (
            <motion.button
              whileHover={{ scale: 1.15, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="shrink-0 h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center"
            >
              <X className="h-4 w-4 text-white/70" />
            </motion.button>
          )}
        </div>

        {toast.type !== "loading" && (
          <div className="relative z-20 h-[3px] bg-white/10 rounded-b-2xl overflow-hidden">
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: (toast.duration || 4500) / 1000, ease: "linear" }}
              className="h-full"
              style={{ background: `linear-gradient(90deg, ${c.color}, ${c.color}80)` }}
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  useEffect(() => {
    const fn = (t: ToastData[]) => setToasts(t)
    subs.add(fn)
    return () => { subs.delete(fn) }
  }, [])

  return (
    <div className="fixed top-0 right-0 z-[9999] flex flex-col pointer-events-none" style={{ overflow: 'visible' }}>
      <AnimatePresence mode="popLayout">
        {toasts.slice(0, 5).map(t => (
          <div key={t.id} className="pointer-events-auto" style={{ overflow: 'visible' }}>
            <ToastCard toast={t} onClose={() => del(t.id)} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export const useToast = () => Toast
