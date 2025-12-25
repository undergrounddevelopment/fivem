"use client"

import { motion } from "framer-motion"
import { Bell, User, Coins, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"

export function ModernNavbar() {
  const { user, login } = useAuth()

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 glass border-b border-white/10"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-sm">
              <span className="text-xl font-bold">FT</span>
            </div>
            <span className="font-bold text-lg gradient-text hidden sm:block">FiveM Tools</span>
          </motion.div>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/spin-wheel">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="sm" className="glass-hover gap-2">
                    <Ticket className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{user.tickets || 0}</span>
                  </Button>
                </motion.div>
              </Link>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="sm" className="glass-hover gap-2">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold">{user.coins || 0}</span>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="icon" className="glass-hover relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full animate-pulse-glow" />
                </Button>
              </motion.div>

              <Link href="/dashboard">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" className="glass-hover gap-2">
                    <img src={user.avatar} alt="" className="w-7 h-7 rounded-full ring-2 ring-primary/20" />
                    <span className="hidden sm:inline">{user.username}</span>
                  </Button>
                </motion.div>
              </Link>
            </>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={login} className="magnetic glow-sm shimmer gap-2">
                <User className="h-4 w-4" />
                <span>Login</span>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
