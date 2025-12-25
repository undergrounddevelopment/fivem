"use client"

import { motion } from "framer-motion"
import { Github, MessageCircle, Heart } from "lucide-react"
import Link from "next/link"

export function ModernFooter() {
  return (
    <footer className="mt-20 border-t border-white/10 glass">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-sm">
                <span className="text-xl font-bold">FT</span>
              </div>
              <span className="font-bold gradient-text">FiveM Tools V7</span>
            </div>
            <p className="text-sm text-muted-foreground">
              #1 FiveM Resource Hub for Scripts, MLO, Vehicles & More
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-foreground">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {["Scripts", "MLO Maps", "Vehicles", "Clothing"].map((item) => (
                <li key={item}>
                  <Link href={`/${item.toLowerCase().replace(" ", "-")}`} className="hover:text-primary transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-foreground">Community</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {["Forum", "Discord", "Testimonials", "Support"].map((item) => (
                <li key={item}>
                  <Link href={`/${item.toLowerCase()}`} className="hover:text-primary transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-foreground">Connect</h4>
            <div className="flex gap-3">
              {[
                { icon: Github, href: "https://github.com" },
                { icon: MessageCircle, href: "https://discord.gg/tZXg4GVRM5" },
              ].map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  target="_blank"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-xl glass glass-hover flex items-center justify-center"
                >
                  <social.icon className="h-5 w-5 text-muted-foreground" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 FiveM Tools V7. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-destructive animate-pulse-glow" />
            <span>by FiveM Community</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
