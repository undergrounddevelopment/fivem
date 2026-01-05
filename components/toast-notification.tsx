"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type ToastType = "success" | "error" | "warning" | "info"

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastStore {
  toasts: Toast[]
  add: (toast: Omit<Toast, "id">) => void
  remove: (id: string) => void
}

// Simple toast store
let toastListeners: ((toasts: Toast[]) => void)[] = []
let toasts: Toast[] = []

function notifyListeners() {
  toastListeners.forEach(listener => listener([...toasts]))
}

export const toast = {
  success: (title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2)
    toasts = [...toasts, { id, type: "success", title, message, duration: 4000 }]
    notifyListeners()
    setTimeout(() => toast.dismiss(id), 4000)
  },
  error: (title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2)
    toasts = [...toasts, { id, type: "error", title, message, duration: 5000 }]
    notifyListeners()
    setTimeout(() => toast.dismiss(id), 5000)
  },
  warning: (title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2)
    toasts = [...toasts, { id, type: "warning", title, message, duration: 4000 }]
    notifyListeners()
    setTimeout(() => toast.dismiss(id), 4000)
  },
  info: (title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2)
    toasts = [...toasts, { id, type: "info", title, message, duration: 4000 }]
    notifyListeners()
    setTimeout(() => toast.dismiss(id), 4000)
  },
  dismiss: (id: string) => {
    toasts = toasts.filter(t => t.id !== id)
    notifyListeners()
  }
}

function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const config = {
    success: {
      icon: CheckCircle,
      gradient: "from-emerald-500 to-green-600",
      glow: "shadow-emerald-500/20"
    },
    error: {
      icon: XCircle,
      gradient: "from-red-500 to-rose-600",
      glow: "shadow-red-500/20"
    },
    warning: {
      icon: AlertTriangle,
      gradient: "from-amber-500 to-orange-600",
      glow: "shadow-amber-500/20"
    },
    info: {
      icon: Info,
      gradient: "from-blue-500 to-indigo-600",
      glow: "shadow-blue-500/20"
    }
  }[t.type]

  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
      className={cn(
        "relative rounded-xl overflow-hidden backdrop-blur-xl",
        "bg-gradient-to-r", config.gradient,
        "shadow-lg", config.glow,
        "min-w-[300px] max-w-[380px]"
      )}
    >
      <div className="p-3.5 flex items-start gap-3">
        <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
          <Icon className="h-4 w-4 text-white" />
        </div>
        
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="font-medium text-white text-sm">{t.title}</p>
          {t.message && (
            <p className="text-white/70 text-xs mt-0.5 line-clamp-2">{t.message}</p>
          )}
        </div>

        <button
          onClick={onDismiss}
          className="flex-shrink-0 h-6 w-6 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X className="h-3.5 w-3.5 text-white/80" />
        </button>
      </div>

      {/* Progress */}
      <div className="h-0.5 bg-black/10">
        <motion.div 
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: (t.duration || 4000) / 1000, ease: "linear" }}
          className="h-full bg-white/40"
        />
      </div>
    </motion.div>
  )
}

export function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([])

  useEffect(() => {
    const listener = (newToasts: Toast[]) => setCurrentToasts(newToasts)
    toastListeners.push(listener)
    return () => {
      toastListeners = toastListeners.filter(l => l !== listener)
    }
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {currentToasts.map(t => (
          <ToastItem 
            key={t.id} 
            toast={t} 
            onDismiss={() => toast.dismiss(t.id)} 
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
