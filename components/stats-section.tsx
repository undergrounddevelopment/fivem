"use client"

import { useEffect } from "react"
import { useStatsStore } from "@/lib/store"
import { Package, Download, Users, Zap, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"

export function StatsSection() {
  const { stats, setStats } = useStatsStore()

  useEffect(() => {
    let mounted = true
    
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        
        if (mounted) {
          // Use real data from API response
          const statsData = data.data || data
          setStats({
            totalMembers: statsData.totalUsers || statsData.users || 0,
            totalAssets: statsData.totalAssets || statsData.assets || 0,
            totalDownloads: statsData.totalDownloads || statsData.downloads || 0,
            totalPosts: statsData.totalPosts || statsData.posts || 0,
            onlineUsers: statsData.onlineUsers || 1 // Real online users count from database
          })
        }
      } catch (error) {
        console.error('Stats fetch error:', error)
      }
    }
    
    fetchStats()
    // Update stats every 15 seconds for realtime online users
    const interval = setInterval(fetchStats, 15000)
    
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [setStats])

  const statItems = [
    { icon: Package, label: "Total Assets", value: stats.totalAssets, growth: "+12%" },
    { icon: Download, label: "Downloads", value: stats.totalDownloads, growth: "+24%" },
    { icon: Users, label: "Members", value: stats.totalMembers, growth: "+8%" },
    { icon: Zap, label: "Online Now", value: stats.onlineUsers, isLive: true }
  ]

  return (
    <motion.div 
      className="glass rounded-2xl p-6 border border-white/10"
      style={{ background: 'rgba(255, 255, 255, 0.05)' }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <TrendingUp className="h-5 w-5 text-[var(--primary)]" />
        </motion.div>
        <h3 className="font-semibold text-[var(--text)]">Platform Stats</h3>
      </div>
      
      <div className="space-y-4">
        {statItems.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="flex items-center justify-between group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <div className="flex items-center gap-3">
              <motion.div 
                className="h-10 w-10 rounded-xl flex items-center justify-center relative"
                style={{ background: 'rgba(236, 72, 153, 0.2)' }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <stat.icon className="h-5 w-5 text-[var(--primary)]" />
                {stat.isLive && (
                  <motion.div 
                    className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full status-online"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.div>
              <div>
                <p className="text-sm text-[var(--textDim)]">{stat.label}</p>
                <motion.p 
                  className="font-bold text-[var(--text)]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                >
                  {stat.value.toLocaleString()}
                </motion.p>
              </div>
            </div>
            {stat.isLive ? (
              <motion.span 
                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ color: 'var(--primary)', background: 'var(--primaryBg)' }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                LIVE
              </motion.span>
            ) : (
              <span className="text-xs font-medium text-[var(--primary)]">{stat.growth}</span>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
