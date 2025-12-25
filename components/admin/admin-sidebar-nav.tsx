"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
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
} from "lucide-react"

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Banners",
    href: "/admin/banners",
    icon: ImageIcon,
  },
  {
    title: "Announcements",
    href: "/admin/announcements",
    icon: Megaphone,
  },
  {
    title: "Forum Settings",
    href: "/admin/forum-settings",
    icon: MessageSquare,
  },
  {
    title: "Spin Wheel",
    href: "/admin/spin-wheel",
    icon: Sparkles,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Assets",
    href: "/admin/assets",
    icon: FileText,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "File Uploads",
    href: "/admin/uploads",
    icon: Upload,
  },
  {
    title: "Site Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminSidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="space-y-1">
      <div className="flex items-center gap-2 px-3 py-2 mb-4">
        <Shield className="h-5 w-5 text-primary" />
        <span className="font-bold text-foreground">Admin Panel</span>
      </div>
      {adminNavItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
