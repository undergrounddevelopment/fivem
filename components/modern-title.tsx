"use client"

import { motion } from "framer-motion"

interface ModernTitleProps {
  line1?: string
  line2?: string
  line3?: string
}

export function ModernTitle({ 
  line1 = "Powerful", 
  line2 = "FiveM Tools", 
  line3 = "Platform" 
}: ModernTitleProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <motion.p 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-[var(--text)] mb-2"
        style={{ letterSpacing: '-0.05em' }}
      >
        {line1}
      </motion.p>
      <motion.p 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold gradient-text mb-2"
        style={{ letterSpacing: '-0.05em' }}
      >
        {line2}
      </motion.p>
      <motion.p 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-[var(--text)]"
        style={{ letterSpacing: '-0.05em' }}
      >
        {line3}
      </motion.p>
    </div>
  )
}
