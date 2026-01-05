"use client"

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { SnowPile } from "@/components/snow-pile";

export function ModernHero() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden py-20">
      {/* Lightning Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="lightning-glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <linearGradient id="lightning-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.8">
                <animate attributeName="stop-opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite"/>
              </stop>
              <stop offset="50%" stopColor="#0099cc" stopOpacity="0.6">
                <animate attributeName="stop-opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite"/>
              </stop>
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9">
                <animate attributeName="stop-opacity" values="0.9;0.4;0.9" dur="1.8s" repeatCount="indefinite"/>
              </stop>
            </linearGradient>
          </defs>
          
          {/* Lightning Bolts */}
          <motion.path
            d="M100 50 L150 120 L130 120 L180 200 L160 200 L210 280"
            stroke="url(#lightning-gradient)"
            strokeWidth="2"
            fill="none"
            filter="url(#lightning-glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
          />
          
          <motion.path
            d="M800 100 L750 180 L770 180 L720 260 L740 260 L690 340"
            stroke="url(#lightning-gradient)"
            strokeWidth="2"
            fill="none"
            filter="url(#lightning-glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 1, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 4, delay: 1 }}
          />
          
          <motion.path
            d="M400 80 L450 160 L430 160 L480 240 L460 240 L510 320"
            stroke="url(#lightning-gradient)"
            strokeWidth="1.5"
            fill="none"
            filter="url(#lightning-glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 1, 0] }}
            transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 5, delay: 2 }}
          />
        </svg>
      </div>

      {/* Grid Background */}
      <div className="grid-background">
        <svg className="grid-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 982 786" fill="none">
          <path fillRule="evenodd" clipRule="evenodd" d="M490 401V537H348.5V401H490ZM490 785.5V676H348.5V785.5H347.5V676H206V785.5H205V676H63.5V785.5H62.5V676H0V675H62.5V538H0V537H62.5V401H0V400H62.5V258H0V257H62.5V116H0V115H62.5V0H63.5V115L205 115V0H206V115L347.5 115V0H348.5V115H490V0H491V115L627.5 115V0H628.5V115H765V0H766V115L902.5 115V0H903.5V115H982V116H903.5V257H982V258H903.5V400H982V401H903.5V537H982V538H903.5V675H982V676H903.5V785.5H902.5V676H766V785.5H765V676H628.5V785.5H627.5V676H491V785.5H490ZM902.5 675V538H766V675H902.5ZM902.5 537V401H766V537H902.5ZM902.5 400V258H766V400H902.5ZM902.5 257V116L766 116V257H902.5ZM627.5 675H491V538H627.5V675ZM765 675H628.5V538H765V675ZM348.5 675H490V538H348.5V675ZM347.5 538V675H206V538H347.5ZM205 538V675H63.5V538H205ZM765 537V401H628.5V537H765ZM765 400V258H628.5V400H765ZM765 257V116H628.5V257H765ZM347.5 401V537H206V401H347.5ZM205 401V537H63.5V401H205ZM627.5 401V537H491V401H627.5ZM627.5 116L491 116V257H627.5V116ZM627.5 258H491V400H627.5V258ZM63.5 257V116L205 116V257H63.5ZM63.5 400V258H205V400H63.5ZM206 116V257H347.5V116L206 116ZM348.5 116V257H490V116H348.5ZM206 400V258H347.5V400H206ZM348.5 258V400H490V258H348.5Z" fill="url(#paint0_radial_1_8)" />
          <defs>
            <radialGradient id="paint0_radial_1_8" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(491 392.75) rotate(90) scale(513.25 679.989)">
              <stop stopColor="white" stopOpacity="0.2" />
              <stop offset="1" stopColor="#000" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
        <div className="blur-orb" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
      </div>

      {/* Decorative Elements */}
      <svg className="absolute top-0 right-0 opacity-50 z-0" width="219" height="147" viewBox="0 0 219 147" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect opacity="0.18" x="10.4252" y="75.8326" width="7.50168" height="7.50168" transform="rotate(110.283 10.4252 75.8326)" fill="#686868" stroke="white" strokeWidth="1.22683" />
        <rect opacity="0.18" x="180.869" y="138.825" width="7.50168" height="7.50168" transform="rotate(110.283 180.869 138.825)" fill="#686868" stroke="white" strokeWidth="1.22683" />
        <rect x="69.4713" y="-91.84" width="180.485" height="180.485" transform="rotate(20.2832 69.4713 -91.84)" stroke="white" strokeOpacity="0.1" strokeWidth="1.22683" />
      </svg>

      <svg className="absolute bottom-0 left-0 opacity-50 z-0" width="232" height="191" viewBox="0 0 232 191" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50.5685" cy="172.432" r="112.068" stroke="white" strokeOpacity="0.09" />
        <g opacity="0.1">
          <path d="M26.4932 5.20547L228.856 172.432" stroke="#D9D9D9" />
          <rect x="22.4384" y="0.5" width="6.15753" height="6.15753" fill="#686868" stroke="white" />
          <rect x="224.801" y="169.027" width="6.15753" height="6.15753" fill="#686868" stroke="white" />
          <circle cx="121.819" cy="83.613" r="1.7774" fill="#323232" stroke="white" />
        </g>
      </svg>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Title */}
          <div className="mb-8">
            <motion.p 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-[var(--text)] mb-2"
              style={{ letterSpacing: '-0.05em' }}
            >
              Powerful
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold gradient-text mb-2"
              style={{ letterSpacing: '-0.05em' }}
            >
              FiveM Tools
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-[var(--text)]"
              style={{ letterSpacing: '-0.05em' }}
            >
              Platform
            </motion.p>
          </div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12"
          >
            <Link href="/assets">
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
                  <span className="relative z-10">Browse Assets</span>
                  <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100" />
                </button>
                <span 
                  className="absolute bottom-[-50%] left-1/2 -translate-x-1/2 w-[100px] h-[60px] rounded-full blur-[20px] transition-all duration-200 opacity-60 group-hover:opacity-100" 
                  style={{ background: 'var(--primaryHi)' }}
                />
              </motion.div>
            </Link>

            <Link href="/forum">
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
                  <span className="relative z-10">Join Forum</span>
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
          </motion.div>
        </motion.div>
      </div>

      {/* Snow Effect */}
      <SnowPile />
    </section>
  );
}