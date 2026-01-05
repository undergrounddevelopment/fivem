"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useSession } from "next-auth/react"
import { BadgesDisplay } from "@/components/badges-display"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trophy, Loader2 } from "lucide-react"
import Link from "next/link"

interface UserStats {
  level: number
  xp: number
  posts: number
  threads: number
  likes_received: number
  assets: number
  asset_downloads: number
  membership: string
  created_at: string
}

export default function BadgesPage() {
  const { data: session } = useSession()
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!session?.user) {
        setLoading(false)
        return
      }

      try {
        const userId = (session.user as any).discord_id || session.user.id
        
        const [xpRes, profileRes] = await Promise.all([
          fetch(`/api/xp/stats?userId=${userId}`),
          fetch(`/api/profile/${userId}/stats`)
        ])

        const xpData = xpRes.ok ? await xpRes.json() : { xp: 0, badgeTier: 1 }
        const profileData = profileRes.ok ? await profileRes.json() : {}

        setUserStats({
          level: xpData.badgeTier || 1,
          xp: xpData.xp || 0,
          posts: profileData.posts || 0,
          threads: profileData.posts || 0,
          likes_received: profileData.likesReceived || 0,
          assets: profileData.assets || 0,
          asset_downloads: profileData.downloads || 0,
          membership: (session.user as any).membership || 'member',
          created_at: new Date().toISOString()
        })
      } catch (error) {
        console.error('Failed to fetch user stats:', error)
        // Set default stats on error
        setUserStats({
          level: 1,
          xp: 0,
          posts: 0,
          threads: 0,
          likes_received: 0,
          assets: 0,
          asset_downloads: 0,
          membership: 'member',
          created_at: new Date().toISOString()
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserStats()
  }, [session])

  if (!session) {
    return (
      <div className="min-h-screen bg-background relative">
        <div className="blur-orb" style={{ top: '20%', left: '10%', opacity: 0.15 }} />
        <div className="blur-orb" style={{ top: '60%', right: '15%', opacity: 0.1 }} />
        
        <div className="container mx-auto p-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl flex flex-col items-center justify-center py-20"
          >
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold">Badge Gallery</h3>
            <p className="text-muted-foreground mt-1">Sign in to view your badges and progress</p>
            <Link href="/auth/signin">
              <Button className="mt-4">Sign In</Button>
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Effects */}
      <div className="blur-orb" style={{ top: '10%', left: '5%', opacity: 0.15 }} />
      <div className="blur-orb" style={{ top: '60%', right: '10%', opacity: 0.1 }} />

      <div className="container mx-auto p-6 relative z-10">
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="rounded-xl">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Profile
              </Button>
            </Link>
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Trophy className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Badge Gallery</h1>
              <p className="text-muted-foreground">Track your progress and unlock new badges</p>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-2xl flex flex-col items-center justify-center py-20"
          >
            <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <p className="text-muted-foreground">Loading badges...</p>
          </motion.div>
        ) : userStats ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <BadgesDisplay userStats={userStats} showAll={true} />
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl flex flex-col items-center justify-center py-20"
          >
            <div className="h-16 w-16 rounded-2xl bg-destructive/20 flex items-center justify-center mb-4">
              <Trophy className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold">Failed to load badge data</h3>
            <p className="text-muted-foreground mt-1">Please try again later</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
