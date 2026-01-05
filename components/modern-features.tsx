"use client"

import { motion } from "framer-motion"
import { Code, MapPin, Car, Shirt, Key, Rocket, MessageSquare, Sparkles } from "lucide-react"
import Link from "next/link"

const features = [
  { icon: Code, title: "Scripts", desc: "5000+ Free Scripts", href: "/scripts" },
  { icon: MapPin, title: "MLO Maps", desc: "Premium Interiors", href: "/mlo" },
  { icon: Car, title: "Vehicles", desc: "Custom Cars", href: "/vehicles" },
  { icon: Shirt, title: "EUP", desc: "Clothing Packs", href: "/clothing" },
  { icon: Key, title: "Decrypt", desc: "CFX V7 Tool", href: "/decrypt" },
  { icon: Rocket, title: "Upvotes", desc: "Server Boost", href: "/upvotes" },
  { icon: MessageSquare, title: "Forum", desc: "Community", href: "/forum" },
  // { icon: Sparkles, title: "Spin Wheel", desc: "Win Prizes", href: "/spin-wheel" }, // Event sudah habis
]

export function ModernFeatures() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {features.map((feature, i) => (
        <Link key={feature.href} href={feature.href} aria-label={`${feature.title}: ${feature.desc}`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="glass card-hover p-6 rounded-2xl group cursor-pointer relative overflow-hidden border border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary,#3b82f6)] focus-visible:ring-offset-2"
            style={{ background: "rgba(255, 255, 255, 0.05)" }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity" style={{ background: "linear-gradient(135deg, var(--primary, #3b82f6), var(--accent, #8b5cf6))" }} />
            
            <div className="relative z-10 space-y-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center glow-sm group-hover:glow-md transition-all" style={{ background: "linear-gradient(135deg, var(--primary, #3b82f6), var(--accent, #8b5cf6))" }}>
                <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              
              <div>
                <h3 className="font-bold text-[var(--text,#ffffff)] group-hover:gradient-text transition-all">{feature.title}</h3>
                <p className="text-sm text-[var(--textDim,#a0a0a0)]">{feature.desc}</p>
              </div>
            </div>

            <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100" />
          </motion.div>
        </Link>
      ))}
    </div>
  )
}
