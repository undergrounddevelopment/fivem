"use client"

import { motion } from "framer-motion"
import { Github, MessageCircle, Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import Script from "next/script"
import { SITE_LOGO, SITE_NAME, DISCORD_LINKS } from "@/lib/constants"

export function ModernFooter() {
  return (
    <footer className="mt-20 border-t border-white/10 glass backdrop-blur-xl" style={{ background: "rgba(255, 255, 255, 0.05)" }}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden ring-2 ring-primary/30 group-hover:ring-primary/60 transition-all glow-sm">
                <Image
                  src={SITE_LOGO}
                  alt={`${SITE_NAME} Logo`}
                  fill
                  className="object-cover"
                  unoptimized
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-logo.png'
                  }}
                />
              </div>
              <span className="font-bold text-lg gradient-text group-hover:opacity-80 transition-opacity">{SITE_NAME}</span>
            </Link>
            <p className="text-sm text-[var(--textDim)]">
              #1 FiveM Resource Hub for Scripts, MLO, Vehicles & More
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-[var(--text)]">Resources</h4>
            <ul className="space-y-2 text-sm text-[var(--textDim)]">
              {["Scripts", "MLO Maps", "Vehicles", "Clothing"].map((item) => (
                <li key={item}>
                  <Link href={`/${item.toLowerCase().replace(" ", "-")}`} className="hover:text-[var(--primary)] transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-[var(--text)]">Community</h4>
            <ul className="space-y-2 text-sm text-[var(--textDim)]">
              {["Forum", "Discord", "Testimonials", "FAQ", "Terms", "Privacy"].map((item) => (
                <li key={item}>
                  <Link href={`/${item.toLowerCase().replace(" ", "-")}`} className="hover:text-[var(--primary)] transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
              <li>
                 <Link href="/leaderboard" className="hover:text-[var(--primary)] transition-colors">
                    Leaderboard
                 </Link>
              </li>
              <li>
                 <Link href="/badges" className="hover:text-[var(--primary)] transition-colors">
                    Badges
                 </Link>
              </li>
              <li>
                 <Link href="/support/reports" className="hover:text-[var(--primary)] transition-colors">
                    My Reports
                 </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-[var(--text)]">Connect</h4>
            <div className="flex gap-3">
              {[
                { icon: Github, href: "https://github.com" },
                { icon: MessageCircle, href: DISCORD_LINKS.COMMUNITY },
              ].map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  target="_blank"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-xl glass glass-hover flex items-center justify-center border border-white/10"
                  style={{ background: "rgba(255, 255, 255, 0.05)" }}
                >
                  <social.icon className="h-5 w-5 text-[var(--textDim)]" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col gap-2">
             <p className="text-sm text-[var(--textDim)]">
               © 2026 FiveM Tools V7. All rights reserved.
             </p>
             {/* DMCA Badge */}
             <a 
               href="https://www.dmca.com/Protection/Status.aspx?ID=90a4466c-0bf3-4457-b16f-e44e6319bcf9" 
               title="DMCA.com Protection Status" 
               className="dmca-badge w-fit" 
               target="_blank" 
               rel="noopener noreferrer"
             > 
               <img 
                 src="https://images.dmca.com/Badges/dmca-badge-w150-5x1-09.png?ID=90a4466c-0bf3-4457-b16f-e44e6319bcf9" 
                 alt="DMCA.com Protection Status" 
               />
             </a>
             <Script src="https://images.dmca.com/Badges/DMCABadgeHelper.min.js" strategy="lazyOnload" />
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--textDim)]">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-destructive animate-pulse-glow" />
            <span>by FiveM Community</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
