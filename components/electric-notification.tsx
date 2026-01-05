"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, AlertTriangle, Info, X, Loader2, Zap, Gift, Trophy, Bell } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastType = "success" | "error" | "warning" | "info" | "loading" | "xp" | "reward" | "achievement"

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

// Electric Border Canvas Component
function ElectricCanvas({ 
  width, 
  height, 
  color 
}: { 
  width: number
  height: number
  color: string 
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const timeRef = useRef(0)
  const lastFrameTimeRef = useRef(0)

  const config = {
    octaves: 8,
    lacunarity: 1.6,
    gain: 0.6,
    amplitude: 0.06,
    frequency: 12,
    baseFlatness: 0,
    displacement: 25,
    speed: 2,
    borderOffset: 15,
    borderRadius: 14,
    lineWidth: 1.5
  }

  const random = useCallback((x: number) => (Math.sin(x * 12.9898) * 43758.5453) % 1, [])

  const noise2D = useCallback((x: number, y: number) => {
    const i = Math.floor(x), j = Math.floor(y)
    const fx = x - i, fy = y - j
    const a = random(i + j * 57), b = random(i + 1 + j * 57)
    const c = random(i + (j + 1) * 57), d = random(i + 1 + (j + 1) * 57)
    const ux = fx * fx * (3.0 - 2.0 * fx), uy = fy * fy * (3.0 - 2.0 * fy)
    return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy
  }, [random])

  const octavedNoise = useCallback((x: number, time: number, seed: number) => {
    let y = 0, amplitude = config.amplitude, frequency = config.frequency
    for (let i = 0; i < config.octaves; i++) {
      y += (i === 0 ? amplitude * config.baseFlatness : amplitude) * noise2D(frequency * x + seed * 100, time * frequency * 0.3)
      frequency *= config.lacunarity
      amplitude *= config.gain
    }
    return y
  }, [noise2D, config])

  const getCornerPoint = useCallback((cx: number, cy: number, r: number, start: number, arc: number, p: number) => ({
    x: cx + r * Math.cos(start + p * arc),
    y: cy + r * Math.sin(start + p * arc)
  }), [])

  const getRoundedRectPoint = useCallback((t: number, l: number, tp: number, w: number, h: number, r: number) => {
    const sw = w - 2 * r, sh = h - 2 * r, ca = (Math.PI * r) / 2
    const total = 2 * sw + 2 * sh + 4 * ca, d = t * total
    let acc = 0

    if (d <= acc + sw) return { x: l + r + ((d - acc) / sw) * sw, y: tp }
    acc += sw
    if (d <= acc + ca) return getCornerPoint(l + w - r, tp + r, r, -Math.PI / 2, Math.PI / 2, (d - acc) / ca)
    acc += ca
    if (d <= acc + sh) return { x: l + w, y: tp + r + ((d - acc) / sh) * sh }
    acc += sh
    if (d <= acc + ca) return getCornerPoint(l + w - r, tp + h - r, r, 0, Math.PI / 2, (d - acc) / ca)
    acc += ca
    if (d <= acc + sw) return { x: l + w - r - ((d - acc) / sw) * sw, y: tp + h }
    acc += sw
    if (d <= acc + ca) return getCornerPoint(l + r, tp + h - r, r, Math.PI / 2, Math.PI / 2, (d - acc) / ca)
    acc += ca
    if (d <= acc + sh) return { x: l, y: tp + h - r - ((d - acc) / sh) * sh }
    acc += sh
    return getCornerPoint(l + r, tp + r, r, Math.PI, Math.PI / 2, (d - acc) / ca)
  }, [getCornerPoint])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = width + 30
    canvas.height = height + 30

    const draw = (currentTime: number) => {
      const dt = (currentTime - lastFrameTimeRef.current) / 1000
      timeRef.current += dt * config.speed
      lastFrameTimeRef.current = currentTime

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = color
      ctx.lineWidth = config.lineWidth
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.shadowColor = color
      ctx.shadowBlur = 6

      const l = config.borderOffset, tp = config.borderOffset
      const bw = canvas.width - 2 * config.borderOffset
      const bh = canvas.height - 2 * config.borderOffset
      const r = Math.min(config.borderRadius, Math.min(bw, bh) / 2)
      const samples = Math.floor((2 * (bw + bh) + 2 * Math.PI * r) / 2)

      ctx.beginPath()
      for (let i = 0; i <= samples; i++) {
        const p = i / samples
        const pt = getRoundedRectPoint(p, l, tp, bw, bh, r)
        const dx = pt.x + octavedNoise(p * 8, timeRef.current, 0) * config.displacement
        const dy = pt.y + octavedNoise(p * 8, timeRef.current, 1) * config.displacement
        i === 0 ? ctx.moveTo(dx, dy) : ctx.lineTo(dx, dy)
      }
      ctx.closePath()
      ctx.stroke()

      animationRef.current = requestAnimationFrame(draw)
    }

    animationRef.current = requestAnimationFrame(draw)
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current) }
  }, [width, height, color, config, getRoundedRectPoint, octavedNoise])

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{ width: width + 30, height: height + 30 }}
    />
  )
}

// Global toast state
let listeners: Set<(toasts: Toast[]) => void> = new Set()
let queue: Toast[] = []

function emit() { listeners.forEach(fn => fn([...queue])) }

function add(toast: Omit<Toast, "id">) {
  const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  queue = [...queue, { ...toast, id }]
  emit()
  if (toast.type !== "loading") setTimeout(() => remove(id), toast.duration || 5000)
  return id
}

function remove(id: string) { queue = queue.filter(t => t.id !== id); emit() }

function update(id: string, updates: Partial<Omit<Toast, "id">>) {
  queue = queue.map(t => t.id === id ? { ...t, ...updates } : t)
  emit()
  if (updates.type && updates.type !== "loading") setTimeout(() => remove(id), updates.duration || 5000)
}

// Public API
export const ElectricToast = {
  success: (title: string, message?: string) => add({ type: "success", title, message }),
  error: (title: string, message?: string) => add({ type: "error", title, message, duration: 6000 }),
  warning: (title: string, message?: string) => add({ type: "warning", title, message }),
  info: (title: string, message?: string) => add({ type: "info", title, message }),
  loading: (title: string, message?: string) => add({ type: "loading", title, message }),
  xp: (title: string, message?: string) => add({ type: "xp", title, message }),
  reward: (title: string, message?: string) => add({ type: "reward", title, message }),
  achievement: (title: string, message?: string) => add({ type: "achievement", title, message }),
  dismiss: remove,
  update,
  promise: async <T,>(promise: Promise<T>, msgs: { loading: string; success: string; error: string }) => {
    const id = add({ type: "loading", title: msgs.loading })
    try {
      const result = await promise
      update(id, { type: "success", title: msgs.success })
      return result
    } catch (err) {
      update(id, { type: "error", title: msgs.error })
      throw err
    }
  }
}

// Toast Item
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const configs: Record<ToastType, { icon: any; color: string; bg: string }> = {
    success: { icon: CheckCircle, color: "#10b981", bg: "from-emerald-500/20 to-emerald-600/10" },
    error: { icon: XCircle, color: "#ef4444", bg: "from-red-500/20 to-red-600/10" },
    warning: { icon: AlertTriangle, color: "#f59e0b", bg: "from-amber-500/20 to-amber-600/10" },
    info: { icon: Info, color: "#3b82f6", bg: "from-blue-500/20 to-blue-600/10" },
    loading: { icon: Loader2, color: "#8b5cf6", bg: "from-violet-500/20 to-violet-600/10" },
    xp: { icon: Zap, color: "#00ff88", bg: "from-emerald-500/20 to-cyan-600/10" },
    reward: { icon: Gift, color: "#f472b6", bg: "from-pink-500/20 to-rose-600/10" },
    achievement: { icon: Trophy, color: "#fbbf24", bg: "from-amber-500/20 to-yellow-600/10" }
  }

  const cfg = configs[toast.type]
  const Icon = cfg.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="relative w-[320px]"
    >
      {/* Electric border canvas */}
      <ElectricCanvas width={320} height={80} color={cfg.color} />

      {/* Background glow */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-40 blur-2xl -z-10"
        style={{ background: `radial-gradient(circle at center, ${cfg.color}40, transparent)` }}
      />

      {/* Main container */}
      <div className={cn(
        "relative rounded-2xl overflow-hidden",
        "bg-gradient-to-br bg-neutral-900/90 backdrop-blur-xl",
        "border border-white/5"
      )}>
        {/* Gradient overlay */}
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60 pointer-events-none", cfg.bg)} />

        {/* Content */}
        <div className="relative p-4 flex items-start gap-3">
          {/* Icon */}
          <div 
            className="flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center"
            style={{ 
              background: `linear-gradient(135deg, ${cfg.color}30, ${cfg.color}10)`,
              boxShadow: `0 0 20px ${cfg.color}30`
            }}
          >
            <Icon 
              className={cn("h-5 w-5", toast.type === "loading" && "animate-spin")} 
              style={{ color: cfg.color }}
            />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="font-semibold text-white text-sm leading-tight">{toast.title}</p>
            {toast.message && (
              <p className="text-white/60 text-xs mt-1 leading-relaxed">{toast.message}</p>
            )}
          </div>

          {/* Close */}
          {toast.type !== "loading" && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onDismiss}
              className="flex-shrink-0 h-6 w-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X className="h-3.5 w-3.5 text-white/60" />
            </motion.button>
          )}
        </div>

        {/* Progress bar */}
        {toast.type !== "loading" && (
          <div className="h-0.5 bg-white/5">
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: (toast.duration || 5000) / 1000, ease: "linear" }}
              className="h-full"
              style={{ background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}80)` }}
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Container
export function ElectricToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const listener = (newToasts: Toast[]) => setToasts(newToasts)
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  }, [])

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.slice(0, 4).map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={() => remove(toast.id)} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
