"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Trophy, Star, Zap, Crown, Shield, Medal } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface LeaderboardUser {
  id: string
  discord_id: string
  username: string
  avatar: string
  xp: number
  level: number
  reputation: number
  membership: string
  current_badge?: string
}

export default function LeaderboardPage() {
  const [data, setData] = useState<{ topXp: LeaderboardUser[]; topRep: LeaderboardUser[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/leaderboard")
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const podiumColors = [
    "from-yellow-400 to-yellow-600", // Gold
    "from-gray-300 to-gray-400",     // Silver
    "from-orange-400 to-orange-600"  // Bronze
  ]

  const UserRow = ({ user, rank, metric, icon }: { user: LeaderboardUser, rank: number, metric: string, icon: any }) => (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
      className={`flex items-center gap-4 p-4 rounded-xl border mb-3 transition-all hover:scale-[1.01] ${
        rank <= 3 
          ? "bg-gradient-to-r from-primary/10 to-transparent border-primary/20" 
          : "bg-secondary/20 border-white/5 hover:bg-secondary/30"
      }`}
    >
      <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center font-bold text-lg ${
        rank === 1 ? "text-yellow-400" : rank === 2 ? "text-gray-300" : rank === 3 ? "text-orange-400" : "text-muted-foreground"
      }`}>
        {rank <= 3 ? <Medal className="h-6 w-6" /> : `#${rank}`}
      </div>
      
      <Link href={`/profile/${user.discord_id || user.id}`} className="flex-shrink-0 relative group">
        <Image
          src={user.avatar || "/placeholder.svg"}
          alt={user.username}
          width={48}
          height={48}
          className="rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary transition-all"
        />
        {user.membership === 'vip' && (
          <div className="absolute -top-1 -right-1 bg-primary text-[8px] px-1 rounded-full text-white">VIP</div>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/profile/${user.discord_id || user.id}`} className="font-semibold hover:text-primary transition-colors truncate block">
          {user.username}
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {user.current_badge && <span>{user.current_badge}</span>}
          {user.level > 1 && <span>• Lvl {user.level}</span>}
        </div>
      </div>

      <div className="flex-shrink-0 text-right">
        <div className="font-bold text-primary flex items-center justify-end gap-1">
          {icon}
          {metric}
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="blur-orb" style={{ top: '10%', left: '20%', opacity: 0.2 }} />
      <div className="blur-orb" style={{ top: '60%', right: '10%', opacity: 0.15 }} />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            Hall of Fame
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Community Leaderboard
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Recognizing the most active and legendary members of our community. Earn XP and Reputation to climb the ranks!
          </p>
        </motion.div>

        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {[1, 2].map(i => (
               <div key={i} className="glass rounded-2xl border-white/10 p-6 space-y-4">
                 <Skeleton className="h-8 w-48 mb-6" />
                 {[1,2,3,4,5].map(j => <Skeleton key={j} className="h-20 w-full rounded-xl" />)}
               </div>
             ))}
           </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* XP Leaderboard */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl border-white/10 p-6"
            >
              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <div className="p-3 rounded-xl bg-purple-500/10">
                  <Zap className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Top XP Earners</h2>
                  <p className="text-sm text-muted-foreground">Most active members</p>
                </div>
              </div>
              
              <div className="space-y-1">
                {data?.topXp.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No data available</p>
                ) : (
                  data?.topXp.map((user, index) => (
                    <UserRow 
                      key={user.id} 
                      user={user} 
                      rank={index + 1} 
                      metric={`${user.xp.toLocaleString()} XP`}
                      icon={<Zap className="h-3 w-3" />}
                    />
                  ))
                )}
              </div>
            </motion.div>

            {/* Reputation Leaderboard */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl border-white/10 p-6"
            >
              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <div className="p-3 rounded-xl bg-yellow-500/10">
                  <Star className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Top Reputation</h2>
                  <p className="text-sm text-muted-foreground">Most helpful members</p>
                </div>
              </div>
              
              <div className="space-y-1">
                {data?.topRep.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No data available</p>
                ) : (
                  data?.topRep.map((user, index) => (
                    <UserRow 
                      key={user.id} 
                      user={user} 
                      rank={index + 1} 
                      metric={`${user.reputation} Rep`}
                      icon={<Star className="h-3 w-3" />}
                    />
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
