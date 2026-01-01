"use client"

import Link from 'next/link';
import { motion } from 'framer-motion';

export function ModernButtons() {
  return (
    <div className="flex flex-wrap gap-6 justify-center items-center">
      <Link href="/scripts">
        <motion.div
          whileHover={{ y: 5 }}
          whileTap={{ scale: 0.95 }}
          className="relative group"
        >
          <button 
            className="h-[50px] w-[160px] rounded-[13px] border-none font-['Manrope'] text-base flex items-center justify-center relative overflow-visible transition-all duration-200"
            style={{
              background: 'var(--primaryBg)',
              color: 'var(--primaryFg)',
              boxShadow: '0px -3px 15px 0px var(--primaryHi) inset',
              clipPath: 'path("M 0 25 C 0 -5, -5 0, 80 0 S 160 -5, 160 25, 165 50 80 50, 0 55, 0 25")'
            }}
          >
            <span className="relative z-10">View Scripts</span>
            <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100" />
          </button>
          <span 
            className="absolute bottom-[-50%] left-1/2 -translate-x-1/2 w-[100px] h-[60px] rounded-full blur-[20px] transition-all duration-200 opacity-60 group-hover:opacity-100" 
            style={{ background: 'var(--primaryHi)' }}
          />
        </motion.div>
      </Link>

      <Link href="/assets">
        <motion.div
          whileHover={{ y: 5 }}
          whileTap={{ scale: 0.95 }}
          className="relative group"
        >
          <button 
            className="h-[50px] w-[160px] rounded-[13px] border-none font-['Manrope'] text-base flex items-center justify-center relative overflow-visible transition-all duration-200"
            style={{
              background: 'var(--accentBg)',
              color: 'var(--accentFg)',
              boxShadow: '0px -3px 15px 0px var(--accentHi) inset',
              clipPath: 'path("M 0 25 C 0 -5, -5 0, 80 0 S 160 -5, 160 25, 165 50 80 50, 0 55, 0 25")'
            }}
          >
            <span className="relative z-10">Download</span>
            <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100" />
          </button>
          <span 
            className="absolute bottom-[-50%] left-1/2 -translate-x-1/2 w-[100px] h-[60px] rounded-full blur-[20px] transition-all duration-200 opacity-60 group-hover:opacity-100" 
            style={{ background: 'var(--accentHi)' }}
          />
        </motion.div>
      </Link>

      <Link href="/discord">
        <motion.div
          whileHover={{ y: 5 }}
          whileTap={{ scale: 0.95 }}
          className="relative group"
        >
          <button 
            className="h-[50px] w-[160px] rounded-[13px] border-none font-['Manrope'] text-base flex items-center justify-center relative overflow-visible transition-all duration-200"
            style={{
              background: 'var(--secondaryBg)',
              color: 'var(--secondaryFg)',
              boxShadow: '0px -3px 15px 0px var(--secondaryHi) inset',
              clipPath: 'path("M 0 25 C 0 -5, -5 0, 80 0 S 160 -5, 160 25, 165 50 80 50, 0 55, 0 25")'
            }}
          >
            <span className="relative z-10">Connect</span>
            <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100" />
          </button>
          <span 
            className="absolute bottom-[-50%] left-1/2 -translate-x-1/2 w-[100px] h-[60px] rounded-full blur-[20px] transition-all duration-200 opacity-60 group-hover:opacity-100" 
            style={{ background: 'var(--secondaryHi)' }}
          />
        </motion.div>
      </Link>
    </div>
  );
}
