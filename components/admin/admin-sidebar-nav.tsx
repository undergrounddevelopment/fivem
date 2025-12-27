"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  ImageIcon,
  Megaphone,
  MessageSquare,
  Settings,
  Sparkles,
  Users,
  FileText,
  BarChart3,
  Upload,
  Shield,
  Database,
  Bell,
  Coins,
  ChevronRight,
  Crown,
  Star,
} from "lucide-react"

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    color: "from-pink-500 to-rose-500",
    badge: null,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
    color: "from-cyan-500 to-blue-500",
    badge: null,
  },
  {
    title: "Banners",
    href: "/admin/banners",
    icon: ImageIcon,
    color: "from-blue-500 to-indigo-500",
    badge: null,
  },
  {
    title: "Announcements",
    href: "/admin/announcements",
    icon: Megaphone,
    color: "from-green-500 to-emerald-500",
    badge: null,
  },
  {
    title: "Forum",
    href: "/admin/forum",
    icon: MessageSquare,
    color: "from-purple-500 to-pink-500",
    badge: "New",
  },
  {
    title: "Assets",
    href: "/admin/assets",
    icon: FileText,
    color: "from-orange-500 to-red-500",
    badge: null,
  },
  {
    title: "Spin Wheel",
    href: "/admin/spin-wheel",
    icon: Sparkles,
    color: "from-yellow-500 to-orange-500",
    badge: null,
  },
  {
    title: "Coins",
    href: "/admin/coins",
    icon: Coins,
    color: "from-amber-500 to-yellow-500",
    badge: null,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    color: "from-pink-500 to-rose-500",
    badge: null,
  },
  {
    title: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
    color: "from-red-500 to-pink-500",
    badge: null,
  },
  {
    title: "Testimonials",
    href: "/admin/testimonials",
    icon: Star,
    color: "from-yellow-500 to-amber-500",
    badge: "New",
  },
  {
    title: "Database",
    href: "/admin/database",
    icon: Database,
    color: "from-indigo-500 to-violet-500",
    badge: null,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    color: "from-slate-500 to-gray-500",
    badge: null,
  },
]

export function AdminSidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 mb-4 rounded-xl bg-gradient-to-r from-primary/20 to-pink-500/10 border border-primary/20">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-foreground block">Admin Panel</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Crown className="h-3 w-3 text-primary" />
            Full Access
          </span>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="space-y-1">
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                isActive
                  ? "bg-primary/15 text-primary font-medium border border-primary/20"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"
              )}
            >
              <div className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center transition-all",
                isActive 
                  ? `bg-gradient-to-br ${item.color}` 
                  : "bg-white/5 group-hover:bg-white/10"
              )}>
                <item.icon className={cn("h-4 w-4", isActive ? "text-white" : "")} />
              </div>
              <span className="flex-1">{item.title}</span>
              {item.badge && (
                <Badge className="bg-primary/20 text-primary text-[10px] px-1.5 py-0 h-4">
                  {item.badge}
                </Badge>
              )}
              <ChevronRight className={cn(
                "h-4 w-4 opacity-0 -translate-x-2 transition-all",
                isActive ? "opacity-100 translate-x-0" : "group-hover:opacity-50 group-hover:translate-x-0"
              )} />
            </Link>
          )
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-white/5">
        <div className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5">
          <p className="text-xs text-muted-foreground">Version 7.0.0</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">FiveM Tools Admin</p>
        </div>
      </div>
    </nav>
  )
}
