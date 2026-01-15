"use client"

import { useState, useEffect, useRef, useLayoutEffect } from "react"
import { X, AlertTriangle, Info, CheckCircle, ArrowRight, Megaphone, Package } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface Notif {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "alert" | "new_asset"
  link?: string
  created_at: string
}

// Electric Border Component - ULTRA VISIBLE
function ElectricBorder({ color, width, height }: { color: string; width: number; height: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | null>(null)
  const tRef = useRef(Math.random() * 100)
  const lastRef = useRef(0)

  useEffect(() => {
    const cv = canvasRef.current
    if (!cv || width === 0 || height === 0) return
    const ctx = cv.getContext("2d")
    if (!ctx) return

    const pad = 40
    cv.width = width + pad * 2
    cv.height = height + pad * 2

    const rnd = (x: number) => (Math.sin(x * 12.9898) * 43758.5453) % 1
    const n2d = (x: number, y: number) => {
      const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j
      const a = rnd(i + j * 57), b = rnd(i + 1 + j * 57), c = rnd(i + (j + 1) * 57), d = rnd(i + 1 + (j + 1) * 57)
      const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy)
      return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy
    }
    const fbm = (x: number, t: number, s: number) => {
      let v = 0, a = 0.15, f = 4
      for (let i = 0; i < 5; i++) { v += a * n2d(f * x + s * 50, t * f * 0.3); f *= 1.8; a *= 0.5 }
      return v
    }
    const crn = (cx: number, cy: number, r: number, st: number, ar: number, p: number) => ({
      x: cx + r * Math.cos(st + p * ar), y: cy + r * Math.sin(st + p * ar)
    })
    const pt = (t: number, l: number, tp: number, w: number, h: number, r: number) => {
      const sw = w - 2 * r, sh = h - 2 * r, ca = Math.PI * r / 2, tot = 2 * sw + 2 * sh + 4 * ca, d = t * tot
      let ac = 0
      if (d <= ac + sw) return { x: l + r + (d - ac) / sw * sw, y: tp }; ac += sw
      if (d <= ac + ca) return crn(l + w - r, tp + r, r, -Math.PI / 2, Math.PI / 2, (d - ac) / ca); ac += ca
      if (d <= ac + sh) return { x: l + w, y: tp + r + (d - ac) / sh * sh }; ac += sh
      if (d <= ac + ca) return crn(l + w - r, tp + h - r, r, 0, Math.PI / 2, (d - ac) / ca); ac += ca
      if (d <= ac + sw) return { x: l + w - r - (d - ac) / sw * sw, y: tp + h }; ac += sw
      if (d <= ac + ca) return crn(l + r, tp + h - r, r, Math.PI / 2, Math.PI / 2, (d - ac) / ca); ac += ca
      if (d <= ac + sh) return { x: l, y: tp + h - r - (d - ac) / sh * sh }; ac += sh
      return crn(l + r, tp + r, r, Math.PI, Math.PI / 2, (d - ac) / ca)
    }

    const draw = (now: number) => {
      const dt = (now - lastRef.current) / 1000
      tRef.current += dt * 3
      lastRef.current = now
      ctx.clearRect(0, 0, cv.width, cv.height)

      const bw = width, bh = height, r = 14, disp = 18
      const samp = Math.max(80, Math.floor((2 * (bw + bh) + 2 * Math.PI * r) / 2))

      // Outer glow layer
      ctx.save()
      ctx.globalAlpha = 0.4
      ctx.strokeStyle = color
      ctx.lineWidth = 8
      ctx.lineCap = "round"
      ctx.shadowColor = color
      ctx.shadowBlur = 25
      ctx.beginPath()
      for (let i = 0; i <= samp; i++) {
        const p = i / samp, point = pt(p, pad, pad, bw, bh, r)
        const nx = fbm(p * 6, tRef.current, 0) * disp * 1.5, ny = fbm(p * 6, tRef.current, 1) * disp * 1.5
        i === 0 ? ctx.moveTo(point.x + nx, point.y + ny) : ctx.lineTo(point.x + nx, point.y + ny)
      }
      ctx.closePath()
      ctx.stroke()
      ctx.restore()

      // Main lightning
      ctx.save()
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.lineCap = "round"
      ctx.shadowColor = color
      ctx.shadowBlur = 15
      ctx.beginPath()
      for (let i = 0; i <= samp; i++) {
        const p = i / samp, point = pt(p, pad, pad, bw, bh, r)
        const nx = fbm(p * 6, tRef.current, 0) * disp, ny = fbm(p * 6, tRef.current, 1) * disp
        i === 0 ? ctx.moveTo(point.x + nx, point.y + ny) : ctx.lineTo(point.x + nx, point.y + ny)
      }
      ctx.closePath()
      ctx.stroke()
      ctx.restore()

      // White core
      ctx.save()
      ctx.globalAlpha = 0.7
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 1
      ctx.shadowColor = color
      ctx.shadowBlur = 10
      ctx.beginPath()
      for (let i = 0; i <= samp; i++) {
        const p = i / samp, point = pt(p, pad, pad, bw, bh, r)
        const nx = fbm(p * 6, tRef.current, 0) * disp, ny = fbm(p * 6, tRef.current, 1) * disp
        i === 0 ? ctx.moveTo(point.x + nx, point.y + ny) : ctx.lineTo(point.x + nx, point.y + ny)
      }
      ctx.closePath()
      ctx.stroke()
      ctx.restore()

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [width, height, color])

  if (width === 0 || height === 0) return null
  return <canvas ref={canvasRef} className="absolute pointer-events-none" style={{ top: -40, left: -40, width: width + 80, height: height + 80, zIndex: 50 }} />
}

// Single Notification Card
function NotificationCard({ notif, onDismiss, index }: { notif: Notif; onDismiss: () => void; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  const types: Record<string, { icon: any; color: string; label: string }> = {
    new_asset: { icon: Package, color: "#00ff88", label: "New" },
    success: { icon: CheckCircle, color: "#22c55e", label: "Done" },
    warning: { icon: AlertTriangle, color: "#eab308", label: "Notice" },
    alert: { icon: Megaphone, color: "#ef4444", label: "Alert" },
    info: { icon: Info, color: "#3b82f6", label: "Info" }
  }

  const t = types[notif.type] || types.info
  const Icon = t.icon

  useLayoutEffect(() => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setSize({ w: rect.width, h: rect.height })

    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSize({ w: entry.contentRect.width, h: entry.contentRect.height })
      }
    })
    obs.observe(cardRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 350, damping: 25, delay: index * 0.06 }}
      className="relative"
      style={{ overflow: 'visible' }}
    >
      <div className="absolute inset-0 rounded-2xl blur-xl opacity-50" style={{ background: `radial-gradient(ellipse, ${t.color}50, transparent 60%)`, margin: -15 }} />

      <div ref={cardRef} className="relative rounded-2xl bg-[#0a0a0a]/95 backdrop-blur-lg border border-white/[0.08]" style={{ overflow: 'visible' }}>
        {size.w > 0 && size.h > 0 && <ElectricBorder color={t.color} width={size.w} height={size.h} />}
        <div className="absolute inset-0 opacity-40 pointer-events-none rounded-2xl" style={{ background: `linear-gradient(135deg, ${t.color}15, transparent 60%)` }} />

        <div className="relative p-4">
          <div className="flex gap-3">
            <div className="shrink-0 h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${t.color}28, ${t.color}08)`, boxShadow: `0 0 18px ${t.color}25` }}>
              <Icon className="h-5 w-5" style={{ color: t.color }} />
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: `${t.color}cc` }}>{t.label}</span>
              <h4 className="font-medium text-white/95 text-[14px] leading-tight mt-0.5">{notif.title}</h4>
              <p className="text-white/50 text-[12px] mt-1 line-clamp-2 leading-relaxed">{notif.message}</p>
              {notif.link && (
                <Link href={notif.link}>
                  <motion.span whileHover={{ x: 3 }} className="inline-flex items-center gap-1 mt-2 text-[12px] font-medium" style={{ color: t.color }}>
                    View <ArrowRight className="h-3.5 w-3.5" />
                  </motion.span>
                </Link>
              )}
            </div>

            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onDismiss} className="shrink-0 h-7 w-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center">
              <X className="h-4 w-4 text-white/50" />
            </motion.button>
          </div>
        </div>

        <div className="h-[2px] bg-white/[0.06]">
          <motion.div initial={{ width: "100%" }} animate={{ width: "0%" }} transition={{ duration: 10, ease: "linear" }} className="h-full" style={{ background: `linear-gradient(90deg, ${t.color}, ${t.color}50)` }} />
        </div>
      </div>
    </motion.div>
  )
}

// Main Component
export function PublicNotifications() {
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [dismissed, setDismissed] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setDismissed(JSON.parse(localStorage.getItem("dismissed_notifs") || "[]"))
    
    const fetchNotifs = async () => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout
      
      try {
        const r = await fetch("/api/notifications/public", { signal: controller.signal })
        clearTimeout(timeoutId)
        const d = r.ok ? await r.json() : { notifications: [] }
        setNotifs(d.notifications || [])
      } catch {
        // Silently fail on network errors - notifications are not critical
        clearTimeout(timeoutId)
      } finally {
        setLoading(false)
      }
    }
    
    fetchNotifs()

    const sb = getSupabaseBrowserClient()
    let ch: RealtimeChannel | null = null
    if (sb) {
      try {
        ch = sb.channel("pub-notifs")
          .on("postgres_changes", { event: "*", schema: "public", table: "public_notifications" }, fetchNotifs)
          .subscribe()
      } catch {}
    }
    
    const iv = setInterval(fetchNotifs, 30000)
    return () => { 
      if (ch && sb) sb.removeChannel(ch)
      clearInterval(iv) 
    }
  }, [])

  const dismiss = (id: string) => {
    const next = [...dismissed, id]
    setDismissed(next)
    localStorage.setItem("dismissed_notifs", JSON.stringify(next))
  }

  // Filter out new_asset notifications (disabled for performance)
  const visible = notifs.filter(n => !dismissed.includes(n.id) && n.type !== "new_asset")
  
  if (!mounted || loading || visible.length === 0) return null

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-4 max-w-[360px]" style={{ overflow: 'visible' }}>
      <AnimatePresence mode="popLayout">
        {visible.slice(0, 3).map((n, i) => (
          <NotificationCard 
            key={n.id} 
            notif={n} 
            onDismiss={() => dismiss(n.id)} 
            index={i} 
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
