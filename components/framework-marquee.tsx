"use client"

import { motion } from "framer-motion"
import { FRAMEWORKS } from "@/lib/constants"

export function FrameworkMarquee() {
    return (
        <div className="relative overflow-hidden w-full h-[300px] mask-gradient-y py-2 cursor-default select-none">
            {/* Top Fade */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#09090b] to-transparent z-10 pointer-events-none" />
            
            <motion.div 
                className="flex flex-col gap-3 py-4"
                animate={{ y: ["0%", "-50%"] }}
                transition={{ repeat: Infinity, ease: "linear", duration: 20, repeatType: "loop" }}
                whileHover={{ animationPlayState: "paused" }}
            >
                {[...FRAMEWORKS, ...FRAMEWORKS].filter(f => f.id !== 'standalone').map((f, i) => (
                    <div key={`${f.id}-${i}`} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all group shrink-0 backdrop-blur-sm">
                        <div className="h-10 w-10 p-1.5 rounded-xl bg-white/5 flex items-center justify-center shrink-0 shadow-inner border border-white/5 group-hover:scale-110 transition-transform duration-500">
                            <img src={f.logo} className="h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500" alt={f.name} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                                <p className="font-black text-[11px] text-white uppercase tracking-tight truncate group-hover:text-primary transition-colors">{f.name}</p>
                                <div className={`w-1.5 h-1.5 rounded-full ${i % 2 === 0 ? 'bg-green-500' : 'bg-primary'} animate-pulse opacity-0 group-hover:opacity-100 transition-opacity`} />
                            </div>
                            <p className="text-[9px] text-zinc-500 truncate uppercase tracking-widest leading-none mt-1.5 group-hover:text-zinc-400 transition-colors">{f.description}</p>
                        </div>
                    </div>
                ))}
            </motion.div>
            
            {/* Bottom Fade */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#09090b] to-transparent z-10 pointer-events-none" />
        </div>
    )
}
