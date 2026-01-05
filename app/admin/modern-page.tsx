"use client"

import { useEffect, useState } from "react"
import { ModernCard } from "@/components/modern-card"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { Users, ImageIcon, Sparkles, Coins, FileText, Activity } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface Stats {
  totalUsers: number
  totalBanners: number
  activeBanners: number
  totalSpins: number
  totalCoinsWon: number
  pendingAssets: number
}

const quickLinks = [
  { title: "Banners", href: "/admin/banners", icon: ImageIcon, color: "from-blue-500 to-cyan-500" },
  { title: "Announcements", href: "/admin/announcements", icon: Activity, color: "from-green-500 to-emerald-500" },
  // { title: "Spin Wheel", href: "/admin/spin-wheel", icon: Sparkles, color: "from-yellow-500 to-orange-500" }, // Event sudah habis
  { title: "Users", href: "/admin/users", icon: Users, color: "from-cyan-500 to-blue-500" },
  { title: "Assets", href: "/admin/assets", icon: FileText, color: "from-orange-500 to-red-500" },
  { title: "Coins", href: "/admin/coins", icon: Coins, color: "from-purple-500 to-pink-500" },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/dashboard-stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold gradient-text text-glow">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage your FiveM Tools platform</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ModernCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} trend="up" />
        <ModernCard title="Active Banners" value={`${stats?.activeBanners}/${stats?.totalBanners}`} icon={ImageIcon} />
        <ModernCard title="Total Spins" value={stats?.totalSpins || 0} icon={Sparkles} trend="up" />
        <ModernCard title="Coins Won" value={(stats?.totalCoinsWon || 0).toLocaleString()} icon={Coins} trend="up" />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickLinks.map((link, i) => (
            <Link key={i} href={link.href}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="glass card-hover p-6 rounded-2xl group cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center glow-sm mb-3`}>
                  <link.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-sm">{link.title}</h3>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
