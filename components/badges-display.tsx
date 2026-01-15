"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  type Badge as BadgeType, 
  BADGES, 
  getEarnedBadges, 
  getRarityColor, 
  getRarityBorder,
  getLevelFromXP 
} from "@/lib/xp-badges"
import { cn } from "@/lib/utils"
import { Star, Trophy, Zap, Crown, Shield, Award } from "lucide-react"

interface BadgesDisplayProps {
  userStats: {
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
  showAll?: boolean
  compact?: boolean
}

export function BadgesDisplay({ userStats, showAll = false, compact = false }: BadgesDisplayProps) {
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null)
  
  const earnedBadges = getEarnedBadges(userStats)
  const levelInfo = getLevelFromXP(userStats.xp)
  
  const displayBadges = showAll ? BADGES : earnedBadges
  
  if (compact) {
    return (
      <div className="flex items-center gap-1 flex-wrap">
        {earnedBadges.slice(0, 5).map((badge) => (
          <div
            key={badge.id}
            className={cn(
              "relative group cursor-pointer",
              getRarityBorder(badge.rarity)
            )}
            title={badge.name}
          >
            <img
              src={badge.icon}
              alt={badge.name}
              className="h-6 w-6 rounded-full object-cover border-2"
              style={{ borderColor: badge.color }}
            />
          </div>
        ))}
        {earnedBadges.length > 5 && (
          <span className="text-xs text-muted-foreground">+{earnedBadges.length - 5}</span>
        )}
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* XP Progress */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Level {levelInfo.level}</h3>
              <p className="text-sm text-muted-foreground">{levelInfo.title}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{userStats.xp.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total XP</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress to Level {levelInfo.level + 1}</span>
            <span className="font-medium">{Math.round(levelInfo.progress)}%</span>
          </div>
          <Progress value={levelInfo.progress} className="h-3" />
          <p className="text-xs text-muted-foreground text-right">
            {levelInfo.nextLevelXP - userStats.xp} XP needed
          </p>
        </div>
      </div>
      
      {/* Earned Badges */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Badges Earned
          </h3>
          <Badge variant="secondary">{earnedBadges.length} / {BADGES.length}</Badge>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {displayBadges.map((badge) => {
            const isEarned = earnedBadges.some(b => b.id === badge.id)
            
            return (
              <div
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={cn(
                  "relative group cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg",
                  isEarned 
                    ? `${getRarityBorder(badge.rarity)} bg-gradient-to-br ${getRarityColor(badge.rarity)}/10 hover:scale-105 hover:shadow-xl` 
                    : "border-border/30 bg-secondary/20 opacity-40 grayscale hover:opacity-60"
                )}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={cn(
                    "relative h-16 w-16 rounded-full overflow-hidden ring-2 ring-offset-2 ring-offset-background",
                    badge.rarity === "legendary" && isEarned && "animate-pulse ring-yellow-500",
                    isEarned ? "ring-primary/50" : "ring-transparent"
                  )}>
                    <img
                      src={badge.icon}
                      alt={badge.name}
                      className="h-full w-full object-cover"
                    />
                    {badge.rarity === "legendary" && isEarned && (
                      <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/30 to-transparent" />
                    )}
                  </div>
                  <p className="text-xs font-medium text-center line-clamp-2 min-h-[2rem]">{badge.name}</p>
                  {isEarned && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 capitalize">
                      {badge.rarity}
                    </Badge>
                  )}
                </div>
                
                {/* Rarity indicator */}
                <div 
                  className="absolute top-2 right-2 h-3 w-3 rounded-full shadow-lg"
                  style={{ backgroundColor: badge.color }}
                />
                
                {/* Lock icon for unearned */}
                {!isEarned && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                    <Shield className="h-6 w-6 text-white/60" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Selected Badge Modal */}
      {selectedBadge && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedBadge(null)}
        >
          <div 
            className={cn(
              "glass rounded-2xl p-6 max-w-sm w-full border-2",
              getRarityBorder(selectedBadge.rarity)
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className={cn(
                "h-24 w-24 rounded-full overflow-hidden mb-4 border-4",
                selectedBadge.rarity === "legendary" && "animate-pulse"
              )} style={{ borderColor: selectedBadge.color }}>
                <img
                  src={selectedBadge.icon}
                  alt={selectedBadge.name}
                  className="h-full w-full object-cover"
                />
              </div>
              
              <h3 className="text-xl font-bold mb-1">{selectedBadge.name}</h3>
              <Badge 
                className={cn("mb-3 capitalize", `bg-gradient-to-r ${getRarityColor(selectedBadge.rarity)} text-white`)}
              >
                {selectedBadge.rarity}
              </Badge>
              <p className="text-muted-foreground mb-4">{selectedBadge.description}</p>
              
              {earnedBadges.some(b => b.id === selectedBadge.id) ? (
                <div className="flex items-center gap-2 text-green-500">
                  <Shield className="h-5 w-5" />
                  <span className="font-medium">Earned!</span>
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">
                  <Zap className="h-4 w-4 inline mr-1" />
                  Keep going to unlock this badge
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* XP Activity Guide */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          How to Earn XP
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { action: "Create Thread", xp: 50, icon: "📝", color: "from-blue-500 to-blue-600" },
            { action: "Post Reply", xp: 20, icon: "💬", color: "from-green-500 to-green-600" },
            { action: "Upload Asset", xp: 100, icon: "📦", color: "from-purple-500 to-purple-600" },
            { action: "Receive Like", xp: 10, icon: "❤️", color: "from-pink-500 to-pink-600" },
            { action: "Daily Login", xp: 10, icon: "🌟", color: "from-yellow-500 to-yellow-600" },
            { action: "Asset Downloaded", xp: 15, icon: "⬇️", color: "from-cyan-500 to-cyan-600" },
          ].map((item) => (
            <div key={item.action} className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-secondary/50 to-secondary/30 p-4 border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl shadow-lg`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{item.action}</p>
                  <p className="text-lg font-bold text-primary">+{item.xp} XP</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function BadgeIcon({ badge, size = "md" }: { badge: BadgeType; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }
  
  return (
    <div 
      className={cn(
        "relative rounded-full overflow-hidden border-2",
        sizeClasses[size],
        getRarityBorder(badge.rarity)
      )}
      style={{ borderColor: badge.color }}
      title={badge.name}
    >
      <img
        src={badge.icon}
        alt={badge.name}
        className="h-full w-full object-cover"
      />
    </div>
  )
}

// Badge images based on level
const LEVEL_BADGES: Record<number, string> = {
  1: "/badges/badge1.png",
  2: "/badges/badge2.png",
  3: "/badges/badge3.png",
  4: "/badges/badge4.png",
  5: "/badges/badge5.png",
  6: "/badges/badge1.png",
  7: "/badges/badge2.png",
  8: "/badges/badge3.png",
  9: "/badges/badge4.png",
  10: "/badges/badge5.png",
}

// Level colors for glow effect
const LEVEL_GLOW_COLORS: Record<number, string> = {
  1: "rgba(156, 163, 175, 0.4)",
  2: "rgba(107, 114, 128, 0.4)",
  3: "rgba(34, 197, 94, 0.4)",
  4: "rgba(22, 163, 74, 0.4)",
  5: "rgba(59, 130, 246, 0.4)",
  6: "rgba(37, 99, 235, 0.4)",
  7: "rgba(168, 85, 247, 0.4)",
  8: "rgba(147, 51, 234, 0.4)",
  9: "rgba(251, 191, 36, 0.4)",
  10: "rgba(239, 68, 68, 0.4)",
}

export function LevelBadge({ level, title, size = "md", badgeUrl }: { level: number; title: string; size?: "sm" | "md" | "lg"; badgeUrl?: string }) {
  const sizeClasses = {
    sm: "px-3 py-1.5 gap-2",
    md: "px-4 py-2 gap-3",
    lg: "px-5 py-2.5 gap-3",
  }
  
  const iconSizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  }

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }
  
  const levelColors: Record<number, string> = {
    1: "text-gray-300",
    2: "text-gray-400",
    3: "text-green-400",
    4: "text-green-500",
    5: "text-blue-400",
    6: "text-blue-500",
    7: "text-purple-400",
    8: "text-purple-500",
    9: "text-yellow-400",
    10: "text-red-400",
  }

  const borderColors: Record<number, string> = {
    1: "border-gray-400/30",
    2: "border-gray-500/30",
    3: "border-green-400/30",
    4: "border-green-500/30",
    5: "border-blue-400/30",
    6: "border-blue-500/30",
    7: "border-purple-400/30",
    8: "border-purple-500/30",
    9: "border-yellow-400/30",
    10: "border-red-400/30",
  }
  
  const badgeImage = badgeUrl || LEVEL_BADGES[level] || LEVEL_BADGES[1]
  const glowColor = LEVEL_GLOW_COLORS[level] || LEVEL_GLOW_COLORS[1]
  
  return (
    <span 
      className={cn(
        "inline-flex items-center font-semibold rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:scale-105",
        "bg-white/5 dark:bg-black/20",
        sizeClasses[size],
        borderColors[level] || borderColors[1]
      )}
      style={{ boxShadow: `0 0 20px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.1)` }}
    >
      <img 
        src={badgeImage} 
        alt={`Level ${level}`} 
        className={cn(
          "rounded-xl object-cover ring-2 ring-white/20 shadow-lg",
          iconSizes[size]
        )}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none'
        }}
      />
      <span className="flex flex-col leading-tight">
        <span className={cn("font-bold", textSizes[size], levelColors[level] || levelColors[1])}>
          Level {level}
        </span>
        <span className={cn("text-white/70", size === "sm" ? "text-[10px]" : "text-xs")}>
          {title}
        </span>
      </span>
    </span>
  )
}
