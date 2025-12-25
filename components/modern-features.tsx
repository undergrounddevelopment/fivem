"use client"

import { motion } from "framer-motion"
import { Code, MapPin, Car, Shirt, Key, Rocket, MessageSquare, Sparkles } from "lucide-react"
import Link from "next/link"

const features = [
  { icon: Code, title: "Scripts", desc: "5000+ Free Scripts", href: "/scripts", color: "from-blue-500 to-cyan-500" },
  { icon: MapPin, title: "MLO Maps", desc: "Premium Interiors", href: "/mlo", color: "from-green-500 to-emerald-500" },
  { icon: Car, title: "Vehicles", desc: "Custom Cars", href: "/vehicles", color: "from-orange-500 to-red-500" },
  { icon: Shirt, title: "EUP", desc: "Clothing Packs", href: "/clothing", color: "from-purple-500 to-pink-500" },
  { icon: Key, title: "Decrypt", desc: "CFX V7 Tool", href: "/decrypt", color: "from-yellow-500 to-orange-500" },
  { icon: Rocket, title: "Upvotes", desc: "Server Boost", href: "/upvotes", color: "from-indigo-500 to-purple-500" },
  { icon: MessageSquare, title: "Forum", desc: "Community", href: "/forum", color: "from-pink-500 to-rose-500" },
  { icon: Sparkles, title: "Spin Wheel", desc: "Win Prizes", href: "/spin-wheel", color: "from-cyan-500 to-blue-500" },
]

export function ModernFeatures() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {features.map((feature, i) => (
        <Link key={i} href={feature.href}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="glass card-hover p-6 rounded-2xl group cursor-pointer relative overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
            
            <div className="relative z-10 space-y-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center glow-sm group-hover:glow-md transition-all`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              
              <div>
                <h3 className="font-bold text-foreground group-hover:gradient-text transition-all">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            </div>

            <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100" />
          </motion.div>
        </Link>
      ))}
    </div>
  )
}
