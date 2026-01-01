"use client"

import { useEffect, useState } from "react"
import { BadgeDisplay } from "./badge-display"
import type { UserXPStats } from "@/lib/xp/types"

interface XPProgressBarProps {
  stats: UserXPStats
  compact?: boolean
}

export function XPProgressBar({ stats, compact = false }: XPProgressBarProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <BadgeDisplay badge={stats.badge} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold tracking-tight text-white/90">LEVEL {stats.level}</span>
            <span className="text-white/40 font-mono">{stats.xp.toLocaleString()} XP</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full transition-all duration-700 ease-out rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)]"
              style={{
                width: `${stats.progress}%`,
                background: `linear-gradient(90deg, ${stats.badge.color}, ${stats.nextBadge?.color || stats.badge.color})`,
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/10 group">
      <div
        className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[100px] opacity-20 transition-colors duration-500"
        style={{ backgroundColor: stats.badge.color }}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="flex flex-col items-center gap-4">
          <BadgeDisplay badge={stats.badge} size="xl" />
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1 font-bold">Current Rank</div>
            <div
              className="px-4 py-1 rounded-full bg-white/5 border border-white/10 text-xl font-black italic tracking-tighter"
              style={{ color: stats.badge.color }}
            >
              LVL {stats.level}
            </div>
          </div>
        </div>

        <div className="flex-1 w-full min-w-0 flex flex-col justify-center h-full">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
            <div>
              <h3 className="text-2xl font-black tracking-tighter text-white uppercase italic">{stats.badge.name}</h3>
              <p className="text-sm text-white/50 max-w-md">{stats.badge.description}</p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-3xl font-black tracking-tighter text-white font-mono">
                {stats.xp.toLocaleString()}
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">
                Total Experience Points
              </div>
            </div>
          </div>

          {stats.nextBadge ? (
            <div className="space-y-4">
              <div className="relative">
                <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                  <div
                    className="h-full transition-all duration-1000 ease-in-out rounded-full relative"
                    style={{
                      width: `${stats.progress}%`,
                      background: `linear-gradient(90deg, ${stats.badge.color}, ${stats.nextBadge.color})`,
                    }}
                  >
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
                      style={{ backgroundSize: "200% 100%" }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: stats.nextBadge.color }}
                  />
                  <span className="text-xs font-bold text-white/40 tracking-wider">
                    NEXT: <span className="text-white/80">{stats.nextBadge.name}</span>
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black italic tracking-tighter text-white">
                    {stats.progress.toFixed(0)}%
                  </span>
                  <span className="text-[10px] text-white/30 uppercase font-bold">Progress</span>
                </div>
              </div>

              <p className="text-[11px] text-white/30 italic text-center sm:text-left">
                Earn{" "}
                <span className="text-white/60 font-bold font-mono">
                  {(stats.nextBadge.minXp - stats.xp).toLocaleString()} XP
                </span>{" "}
                more to reach the next tier.
              </p>
            </div>
          ) : (
            <div className="relative group/max py-8 flex flex-col items-center justify-center overflow-hidden rounded-xl border border-yellow-500/20 bg-yellow-500/5">
              <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-10" />
              <span className="relative z-10 text-2xl font-black italic tracking-tighter text-yellow-500 animate-pulse">
                MAX RANK ACHIEVED
              </span>
              <p className="relative z-10 text-[10px] uppercase tracking-[0.3em] text-yellow-500/50 mt-2">
                Legendary Community Member
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
