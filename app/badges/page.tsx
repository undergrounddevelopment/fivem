"use client"

export const dynamic = 'force-dynamic'

import { motion } from "framer-motion"
import { CheckCircle, Lock, Trophy, Zap, Shield, Star, Crown } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Badge as UIBadge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { XP_CONFIG, BADGES, getLevelFromXP, getEarnedBadges } from "@/lib/xp-badges"

export default function BadgesPage() {
  const { user } = useAuth()
  const [userStats, setUserStats] = useState<any>(null)
  const [earnedBadges, setEarnedBadges] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [currentXp, setCurrentXp] = useState(0)

  useEffect(() => {
    if (user?.xp) {
      setCurrentXp(user.xp)
    }
  }, [user?.xp])

  useEffect(() => {
    setMounted(true)
    const fetchStats = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }
      try {
        const res = await fetch(`/api/xp/stats?userId=${user.id}`)
        if (res.ok) {
          const data = await res.json()
          setUserStats(data.userStats)
          if (data.xp !== undefined) {
             setCurrentXp(data.xp)
          }
          const earned = getEarnedBadges(data.userStats)
          setEarnedBadges(earned.map(b => b.id))
        }
      } catch (err) {
        console.error("Failed to fetch user stats:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user?.id])

  if (!mounted) return null

  
  // Get all level badges
  const levelBadges = BADGES.filter(b => b.requirement.type === 'level')
  // Get activity badges
  const activityBadges = BADGES.filter(b => b.requirement.type !== 'level')

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-20">
      <div className="blur-orb" style={{ top: '10%', right: '20%', opacity: 0.15 }} />
      <div className="blur-orb" style={{ top: '60%', left: '10%', opacity: 0.15 }} />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <UIBadge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            Achievements
          </UIBadge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Badges & Ranks
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
             Complete activities, earn XP, and unlock exclusive badges to showcase your status in the community.
          </p>

          {!user && !loading && (
            <div className="mt-6">
              <Link href="/login">
                <Button>Login to track your progress</Button>
              </Link>
            </div>
          )}
        </motion.div>

        {/* Level Ranks Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Progressive Ranks</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
            {levelBadges.map((badge, index) => {
               const levelInfo = XP_CONFIG.levels.find(l => l.level === badge.requirement.value)
               const minXp = levelInfo?.minXP || 0
               const isUnlocked = currentXp >= minXp
               const progress = isUnlocked ? 100 : Math.min(100, (currentXp / minXp) * 100)

               return (
                 <motion.div
                   key={badge.id}
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: index * 0.1 }}
                   className={`relative glass rounded-2xl border-white/10 p-6 overflow-hidden group transition-all duration-500 ${isUnlocked ? 'border-primary/40 shadow-lg shadow-primary/10 bg-primary/5' : 'opacity-60 grayscale'}`}
                 >
                   <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                   
                   {isUnlocked ? (
                     <div className="absolute top-3 right-3 text-green-500">
                       <CheckCircle className="h-5 w-5 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                     </div>
                   ) : (
                     <div className="absolute top-3 right-3 text-muted-foreground/30">
                       <Lock className="h-5 w-5" />
                     </div>
                   )}

                   <div className="flex flex-col items-center text-center relative z-10">
                     <div className="relative w-24 h-24 mb-4 group-hover:scale-110 transition-transform duration-500">
                       <Image 
                         src={badge.icon} 
                         alt={badge.name} 
                         fill 
                         className="object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]" 
                         unoptimized
                       />
                       {isUnlocked && (
                         <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full -z-10 animate-pulse" />
                       )}
                     </div>
                     
                     <h3 className="text-lg font-bold mb-1">{badge.name}</h3>
                     <p className="text-xs text-primary font-bold mb-2 tracking-wider uppercase">{minXp.toLocaleString()} XP</p>
                     
                     {!isUnlocked && user && (
                       <div className="w-full mt-2">
                         <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                           <div className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" style={{ width: `${progress}%` }} />
                         </div>
                         <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                           {(minXp - currentXp).toLocaleString()} XP left
                         </p>
                       </div>
                     )}
                   </div>
                 </motion.div>
               )
            })}
          </div>
        </div>

        {/* Activity Badges Section */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/20">
              <Trophy className="h-5 w-5 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold">Activity Achievements</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {activityBadges.map((badge, index) => {
              const isUnlocked = earnedBadges.includes(badge.id)
              
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (index * 0.05) }}
                  className={`glass rounded-2xl border-white/10 p-5 flex items-center gap-4 hover:border-white/30 transition-all group relative overflow-hidden ${isUnlocked ? 'bg-amber-500/5' : 'opacity-60 grayscale'}`}
                >
                  <div className="relative h-16 w-16 shrink-0 group-hover:scale-110 transition-transform duration-500">
                    <Image 
                      src={badge.icon} 
                      alt="" 
                      fill 
                      className={`object-contain transition-all duration-500 ${isUnlocked ? 'opacity-100 drop-shadow-[0_5px_15px_rgba(245,158,11,0.3)]' : 'opacity-30'}`} 
                      unoptimized
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm mb-1">{badge.name}</h4>
                    <p className="text-[11px] text-muted-foreground leading-snug">{badge.description}</p>
                    {isUnlocked && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-400 font-bold uppercase tracking-tighter">
                        <CheckCircle className="h-3 w-3" />
                        Unlocked
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
