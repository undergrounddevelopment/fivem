"use client"

import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react"
import { create } from "zustand"
import { ToastContainer as ToastifyContainer, toast as toastifyToast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type ToastType = "success" | "error" | "warning" | "info"

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substr(2, 9)
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, toast.duration || 3000)
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
}

const colors = {
  success: "from-green-500 to-emerald-500",
  error: "from-red-500 to-rose-500",
  warning: "from-yellow-500 to-orange-500",
  info: "from-blue-500 to-cyan-500",
}

const ToastContainer = () => (
  <ToastifyContainer 
    position="top-right"
    autoClose={5000}
    hideProgressBar={false}
    newestOnTop
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="dark"
    className="glass-effect border border-[hsl(330,100%,65%)]/30"
    toastClassName="glass-effect border border-[hsl(330,100%,65%)]/30"
  />
);

export { ToastContainer, toastifyToast as Toast };
