"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { SITE_LOGO, SITE_NAME } from "@/lib/constants"
import { useAuth } from "@/components/auth-provider"
import { useStatsStore } from "@/lib/store"
import { DailyCoinsButton } from "@/components/daily-coins-button"
import { ChevronLeft, Users } from "lucide-react"

const ICONS_3D = {
  forum: "https://cdn3d.iconscout.com/3d/premium/thumb/discussion-forum-10863983-8726575.png",
  discover: "https://cdn3d.iconscout.com/3d/premium/thumb/discover-3d-icon-png-download-6691613.png",
  script: "https://cdn3d.iconscout.com/3d/premium/thumb/script-document-3d-icon-png-download-11372835.png",
  map: "https://cdn3d.iconscout.com/3d/premium/thumb/map-3d-icon-png-download-7718779.png",
  car: "https://cdn3d.iconscout.com/3d/premium/thumb/car-3d-icon-png-download-13015695.png",
  clothing: "https://cdn3d.iconscout.com/3d/premium/thumb/t-shirt-3d-icon-png-download-4980191.png",
  ticket: "https://cdn3d.iconscout.com/3d/premium/thumb/ticket-3d-icon-png-download-9964703.png",
  message: "https://cdn3d.iconscout.com/3d/premium/thumb/message-3d-icon-png-download-9147860.png",
  crown: "https://cdn3d.iconscout.com/3d/premium/thumb/king-crown-3d-icon-png-download-8837207.png",
  decrypt: "https://cdn3d.iconscout.com/3d/premium/thumb/decrypt-website-3d-icon-png-download-13666091.png",
  rocket:
    "https://static.vecteezy.com/system/resources/thumbnails/026/991/740/small_2x/3d-render-of-purple-spaceship-rocket-icon-for-ui-ux-web-mobile-apps-social-media-ads-design-png.png",
  upload: "https://cdn3d.iconscout.com/3d/premium/thumb/upload-3d-icon-png-download-10987665.png",
  dashboard: "https://cdn3d.iconscout.com/3d/premium/thumb/dashboard-template-3d-icon-png-download-4800674.png",
  admin: "https://cdn3d.iconscout.com/3d/premium/thumb/administrator-3d-icon-png-download-5625724.png?f=webp",
  pending: "https://cdn3d.iconscout.com/3d/premium/thumb/pending-package-3d-icon-png-download-10740000.png",
}

const Icon3D = ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
  <img
    src={src || "/placeholder.svg"}
    alt={alt}
    aria-hidden="true"
    className={cn("w-6 h-6 object-contain", className)}
    loading="lazy"
    decoding="async"
    width={24}
    height={24}
  />
)

const navItems = [
  { label: "Community Forum", href: "/forum", icon: ICONS_3D.forum, badge: "HOT" },
  { label: "Discover", href: "/", icon: ICONS_3D.discover },
  { label: "Scripts", href: "/scripts", icon: ICONS_3D.script },
  { label: "Maps & MLO", href: "/mlo", icon: ICONS_3D.map },
  { label: "Vehicles", href: "/vehicles", icon: ICONS_3D.car },
  { label: "EUP & Clothing", href: "/clothing", icon: ICONS_3D.clothing },
  { label: "Lucky Spin", href: "/spin-wheel", icon: ICONS_3D.ticket, badge: "NEW" },
  { label: "Messages", href: "/messages", icon: ICONS_3D.message },
  { label: "Membership", href: "/membership", icon: ICONS_3D.crown },
  { label: "Decrypt CFX V7", href: "/decrypt", icon: ICONS_3D.decrypt },
  { label: "Upvotes Server", href: "/upvotes", icon: ICONS_3D.rocket },
  { label: "Upload Asset", href: "/upload", icon: ICONS_3D.upload },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, isAdmin } = useAuth()
  const { stats, setStats } = useStatsStore()
  const [displayOnline, setDisplayOnline] = useState(stats.onlineUsers)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats")
      if (res.ok) {
        const data = await res.json()
        setStats({
          totalMembers: data.totalMembers || data.users || 0,
          totalAssets: data.totalAssets || data.assets || 0,
          totalDownloads: data.totalDownloads || data.downloads || 0,
          totalPosts: data.totalPosts || data.posts || 0,
          totalThreads: data.totalThreads || 0,
          onlineUsers: data.onlineUsers || 1,
        })
      }
    } catch (error) {
      // Silently fail - stats will show cached data
    }
  }, [setStats])

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [fetchStats])

  useEffect(() => {
    if (stats.onlineUsers !== displayOnline) {
      const timer = setTimeout(() => {
        setDisplayOnline(stats.onlineUsers)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [stats.onlineUsers, displayOnline])

  const userItems = [
    { label: "Dashboard", href: "/dashboard", icon: ICONS_3D.dashboard, requireAuth: true },
    { label: "Admin Panel", href: "/admin", icon: ICONS_3D.admin, requireAdmin: true },
    { label: "Pending Assets", href: "/admin/forum", icon: ICONS_3D.pending, requireAdmin: true },
  ]

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const NavLink = ({
    item,
    isMobile = false,
  }: {
    item: (typeof navItems)[0] | (typeof userItems)[0]
    isMobile?: boolean
  }) => {
    const isActive = pathname === item.href

    return (
      <Link
        href={item.href}
        onClick={() => isMobile && setMobileOpen(false)}
        className={cn(
          "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative",
          isActive
            ? "bg-primary/20 text-primary border border-primary/30"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
        )}
      >
        <Icon3D src={item.icon} alt={item.label} className="transition-transform group-hover:scale-110" />
        {!collapsed && (
          <>
            <span className="font-medium text-sm">{item.label}</span>
            {"badge" in item && item.badge && (
              <span
                className={cn(
                  "ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full",
                  item.badge === "HOT"
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-primary/20 text-primary border border-primary/30",
                )}
              >
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    )
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl glass-card border border-border"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={mobileOpen ? "M6 18L18 6M6 6l12 12M6 18h12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && <div className="md:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full z-50 transition-all duration-300",
          "bg-sidebar border-r border-border flex flex-col",
          collapsed ? "w-20" : "w-72",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="p-4 flex items-center gap-3 border-b border-border">
          <Link href="/" className="flex items-center gap-3">
            <img
              src={SITE_LOGO || "/placeholder.svg"}
              alt={`${SITE_NAME} Logo`}
              className="h-10 w-10 rounded-xl object-cover"
              width={40}
              height={40}
              loading="eager"
            />
            {!collapsed && (
              <div>
                <h1 className="font-bold text-lg text-foreground">{SITE_NAME}</h1>
                <p className="text-xs text-primary">V7 Premium</p>
              </div>
            )}
          </Link>
          <button
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto p-1.5 rounded-lg hover:bg-accent/50 transition-colors hidden md:flex"
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}

          {/* User Section */}
          {user && (
            <div className="pt-4 mt-4 border-t border-border space-y-1">
              {userItems.map((item) => {
                if ("requireAuth" in item && item.requireAuth && !user) return null
                if ("requireAdmin" in item && item.requireAdmin && !isAdmin) return null
                return <NavLink key={item.href} item={item} />
              })}
            </div>
          )}
        </nav>

        {/* Live Status */}
        <div className="p-4 border-t border-border">
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="relative">
                <Users className="h-4 w-4 text-primary" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              </div>
              {!collapsed && <span className="text-sm font-medium text-foreground">Live Status</span>}
            </div>
            {!collapsed && (
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className="text-xl font-bold text-primary transition-all duration-300">{displayOnline}</p>
                  <p className="text-xs text-muted-foreground">Online</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-foreground">{formatNumber(stats.totalMembers)}</p>
                  <p className="text-xs text-muted-foreground">Members</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Daily Coins */}
        {user && !collapsed && (
          <div className="p-4 pt-0">
            <DailyCoinsButton />
          </div>
        )}
      </aside>
    </>
  )
}
