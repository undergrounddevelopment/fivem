"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { OptimizedImage } from "@/components/optimized-image"
import { SnowPile } from "@/components/snow-pile"
import Link from "next/link"

const DEFAULT_BANNERS = [
  {
    id: "default-1",
    url: "/back1.png",
    title: "FiveM Tools V7.0"
  },
  {
    id: "default-2", 
    url: "https://cdn.discordapp.com/attachments/1445794462033776721/1451657496132325537/BetterImage_1766172076669.jpeg?ex=6961ffa5&is=6960ae25&hm=53059aea7b479cc575e0086a02d2940bdd294335f55e94ecdd136d2ae0012a35",
    title: "FiveM Tools V7.0"
  },
  {
    id: "default-3",
    url: "https://cdn.discordapp.com/attachments/1445794462033776721/1448995490107752522/Untitled_design_21.png?ex=69618af5&is=69603975&hm=5e22b4f2afe60d29106a60956517dad7fd9a6631ddad6284c9b48f8ab46c02b8",
    title: "FiveM Tools V7.0"
  },
  {
    id: "default-4",
    url: "https://cdn.discordapp.com/attachments/1445794462033776721/1458484751089533041/snapedit_1767799490911.png?ex=6961c985&is=69607805&hm=bcc61523b7a9370868c16c55d6979384ef24dd5e68b879c10e6eaccda751ad96",
    title: "FiveM Tools V7.0"
  }
]

interface Banner {
  id: string
  url: string
  link?: string
  title?: string
}

export function ModernHero() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBanners() {
      try {
        const res = await fetch("/api/banners?position=hero")
        const data = await res.json()
        
        if (data.banners && data.banners.length > 0) {
           setBanners(data.banners.map((b: any) => ({
             id: b.id,
             url: b.image_url,
             link: b.link,
             title: b.title
           })))
        } else {
           setBanners(DEFAULT_BANNERS)
        }
      } catch (error) {
        setBanners(DEFAULT_BANNERS)
      } finally {
        setLoading(false)
      }
    }
    fetchBanners()
  }, [])

  useEffect(() => {
    if (banners.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [banners.length])

  const handleAction = () => {
    window.location.href = "/scripts"
  }
  
  const currentBanner = banners[currentIndex] || DEFAULT_BANNERS[0]

  return (
    <section
      className="relative h-[600px] sm:h-[700px] md:h-[90vh] w-full overflow-hidden bg-black group border-b border-white/5 shadow-2xl cursor-pointer"
      onClick={handleAction}
    >
      {/* Background Parallax Slider - Requested Dual Layer Structure */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner.id || currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
             {/* Layer 1: Blurred Background */}
            <div className="absolute inset-0 z-0">
                <div className="relative overflow-hidden w-full h-full">
                    <OptimizedImage
                        src={currentBanner.url}
                        alt=""
                        fill
                        className="transition-opacity duration-300 h-full w-full object-cover blur-[60px] opacity-30 scale-105"
                        unoptimized
                    />
                </div>
            </div>

            {/* Layer 2: Foreground Contain */}
            <div className="relative h-full w-full z-10 p-0 md:p-12">
                <div className="relative overflow-hidden w-full h-full">
                    <OptimizedImage
                        src={currentBanner.url}
                        alt="Cinematic Hero"
                        fill
                        priority
                        quality={100}
                        className="transition-opacity duration-300 h-full w-full opacity-100 object-contain drop-shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                        unoptimized
                    />
                </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Cinematic Overlays */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_4px,3px_100%]" />
        <div className="absolute inset-0 opacity-[0.02] bg-[url('https://res.cloudinary.com/dlbv8qsp3/image/upload/v1689112112/pvg0vax9mpxm9mpxm9mp.png')] bg-repeat" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/40 via-transparent to-[#0A0A0A]/20" />
      </div>

      {/* Brand Overlay - Subtle & Tidy */}
      <div className="absolute bottom-16 left-12 z-20 pointer-events-none hidden md:block">
        <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="max-w-xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-xl">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">PROTOCOL V7</span>
            </div>
          </div>

          <div className="mb-0">
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-tight mb-4 italic">
              <span className="text-primary drop-shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)] block">
                {currentBanner.title || "FiveM Tools V7.0"}
              </span>
              <span className="opacity-60 text-3xl md:text-4xl">
                 ELITE EDITION
              </span>
            </h1>

            <p className="text-sm font-medium text-white/50 uppercase tracking-[0.2em] leading-relaxed max-w-sm border-l-2 border-primary/30 pl-4 mb-4">
              Automatic Scripts, MLO, <br />
              and Elite Decryption Node.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Action Button */}
      <div className="absolute bottom-16 right-12 z-20 pointer-events-auto hidden md:block">
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
        >
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleAction();
              }}
              className="h-20 px-14 bg-primary text-black font-black uppercase tracking-[0.3em] rounded-[2rem] hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(var(--primary-rgb),0.4)] text-lg hover:shadow-[0_0_70px_rgba(var(--primary-rgb),0.6)]"
            >
              ACCESS PROTOCOL
              <ChevronRight className="ml-4 h-6 w-6" />
            </Button>
        </motion.div>
      </div>

      <div className="absolute left-6 inset-y-0 w-px bg-gradient-to-b from-transparent via-white/5 to-transparent z-0" />
      <div className="absolute right-6 inset-y-0 w-px bg-gradient-to-b from-transparent via-white/5 to-transparent z-0" />

      <SnowPile />
    </section>
  )
}