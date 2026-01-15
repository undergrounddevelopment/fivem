"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const TOOL_LABELS = [
  { label: "SCRIPTS FIVEM", href: "/scripts", color: "from-blue-500/20 to-cyan-500/20" },
  { label: "TOOLS UPVOTES SERVER FIVEM", href: "/upvotes", color: "from-purple-500/20 to-pink-500/20" },
  { label: "TOOLS DECRYPT RESOURCES FXAP FIVEM", href: "/decrypt", color: "from-emerald-500/20 to-green-500/20" },
  { label: "TOOLS CLEAN RESOURCES FIVEM", href: "/clean-script", color: "from-amber-500/20 to-orange-500/20" },
  { label: "FIXER MLO UPDATED CFX", href: "/fixer", color: "from-red-500/20 to-rose-500/20" },
  { label: "BYPASS CFX PATREON", href: "/bypass", color: "from-indigo-500/20 to-violet-500/20" },
  { label: "TOOLS POWERBURST SERVER FIVEM", href: "/powerburst", color: "from-yellow-500/20 to-amber-500/20" },
  { label: "FAKEPLAYER CUSTOM SERVER FIVEM", href: "/fakeplayer", color: "from-fuchsia-500/20 to-pink-500/20" },
  { label: "FORUM FIVEM V 7.0 TOOLS", href: "/forum", color: "from-sky-500/20 to-blue-500/20" },
]

export function ToolLabels() {
  return (
    <div className="w-full overflow-x-auto pb-4 pt-2 no-scrollbar">
      <div className="flex items-center gap-3 min-w-max px-1">
        {TOOL_LABELS.map((tool, i) => (
          <Link key={i} href={tool.href}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="relative group"
            >
              <div className={cn(
                "px-4 py-2 rounded-xl border border-white/5 backdrop-blur-md transition-all duration-300",
                "bg-gradient-to-r hover:border-white/20 whitespace-nowrap",
                tool.color
              )}>
                <span className="text-[10px] font-black tracking-widest text-white/80 group-hover:text-white transition-colors uppercase">
                  {tool.label}
                </span>
                
                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-white/5 blur-lg -z-10" />
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  )
}
