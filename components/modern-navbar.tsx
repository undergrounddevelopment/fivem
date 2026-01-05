"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Bell, User, Coins, Ticket, Menu, X, Sparkles, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"
import { useState, useEffect } from "react"

export function ModernNavbar() {
  const { user, login } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const handleScroll = () => setScrolled(window.scrollY > 20)
    // Check initial scroll position
    handleScroll()
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const menuItems = [
    { label: "Services", href: "/assets", icon: Sparkles },
    { label: "Pricing", href: "/membership" },
    { label: "Features", href: "/#features" },
    { label: "About us", href: "/#about" },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isMounted && scrolled 
          ? "bg-background/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/5" 
          : "bg-transparent backdrop-blur-sm border-b border-white/5"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Site Name */}
          <Link href="/">
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-sm">
                <span className="text-xl font-bold text-white">FT</span>
              </div>
              <span className="font-bold text-lg gradient-text hidden sm:block">FiveM Tools</span>
            </motion.div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {menuItems.map((item, index) => (
              <Link key={index} href={item.href}>
                <motion.span
                  whileHover={{ scale: 1.05, color: "var(--text)" }}
                  className="text-sm text-[var(--textDim)] hover:text-[var(--text)] cursor-pointer transition-colors"
                >
                  {item.label}
                </motion.span>
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Spin Tickets - Event sudah habis */}
                {/* <Link href="/spin-wheel">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" size="sm" className="glass-hover gap-2 hidden sm:flex">
                      <Ticket className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{(user as any).tickets || 0}</span>
                    </Button>
                  </motion.div>
                </Link> */}

                {/* Coins */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="sm" className="glass-hover gap-2 hidden sm:flex">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <span className="font-semibold">{user.coins || 0}</span>
                  </Button>
                </motion.div>

                {/* Notifications */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="icon" className="glass-hover relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full animate-pulse-glow" />
                  </Button>
                </motion.div>

                {/* User Profile */}
                <Link href="/dashboard">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" className="glass-hover gap-2">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.username || 'User avatar'} 
                          className="w-7 h-7 rounded-full ring-2 ring-primary/20" 
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-user.jpg'
                          }}
                        />
                      ) : (
                        <User className="w-7 h-7" />
                      )}
                      <span className="hidden sm:inline">{user.username}</span>
                    </Button>
                  </motion.div>
                </Link>
              </>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={login} className="magnetic glow-sm shimmer gap-2 bg-[var(--primaryBg)] hover:bg-[var(--primaryHi)] text-[var(--primaryFg)] border border-[var(--primary)]/20">
                  <User className="h-4 w-4" />
                  <span>Login</span>
                </Button>
              </motion.div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--textDim)] hover:text-[var(--text)] transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 px-2 space-y-1 border-t border-white/10">
                {menuItems.map((item, index) => (
                  <Link key={index} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <motion.div 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between py-3 px-4 rounded-xl text-[var(--textDim)] hover:text-[var(--text)] hover:bg-white/5 cursor-pointer transition-all group"
                    >
                      <span className="font-medium">{item.label}</span>
                      <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </motion.div>
                  </Link>
                ))}
                {!user && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: menuItems.length * 0.05 }}
                    className="pt-2"
                  >
                    <Button onClick={login} className="w-full gap-2 bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90">
                      <User className="h-4 w-4" />
                      Login with Discord
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}
