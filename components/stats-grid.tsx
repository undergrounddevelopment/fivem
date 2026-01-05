"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type ColorScheme = "primary" | "blue" | "amber" | "green" | "purple" | "red"

interface StatItem {
  label: string
  value: string | number
  icon: LucideIcon
  color: ColorScheme
  trend?: "up" | "down"
  trendValue?: string
}

interface StatsGridProps {
  stats: StatItem[]
  columns?: 2 | 3 | 4
  className?: string
}

const colorStyles: Record<ColorScheme, { bg: string; text: string; border: string }> = {
  primary: {
    bg: "bg-pink-500/15",
    text: "text-pink-400",
    border: "border-pink-500/20"
  },
  blue: {
    bg: "bg-blue-500/15",
    text: "text-blue-400",
    border: "border-blue-500/20"
  },
  amber: {
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    border: "border-amber-500/20"
  },
  green: {
    bg: "bg-green-500/15",
    text: "text-green-400",
    border: "border-green-500/20"
  },
  purple: {
    bg: "bg-purple-500/15",
    text: "text-purple-400",
    border: "border-purple-500/20"
  },
  red: {
    bg: "bg-red-500/15",
    text: "text-red-400",
    border: "border-red-500/20"
  }
}

const columnClasses = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4"
}

export function StatsGrid({ stats, columns = 4, className }: StatsGridProps) {
  return (
    <div className={cn("grid gap-4 mb-8", columnClasses[columns], className)}>
      {stats.map((stat, index) => {
        const colors = colorStyles[stat.color]
        const Icon = stat.icon
        
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className={cn(
              "glass overflow-hidden group relative",
              "border border-white/10 hover:border-white/20",
              colors.border,
              "transition-all duration-300"
            )}>
              {/* Gradient overlay on hover */}
              <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                "bg-gradient-to-br from-transparent to-transparent",
                stat.color === "primary" && "group-hover:from-pink-500/5",
                stat.color === "blue" && "group-hover:from-blue-500/5",
                stat.color === "amber" && "group-hover:from-amber-500/5",
                stat.color === "green" && "group-hover:from-green-500/5",
                stat.color === "purple" && "group-hover:from-purple-500/5",
                stat.color === "red" && "group-hover:from-red-500/5"
              )} />
              
              <CardContent className="p-4 flex items-center gap-4 relative z-10">
                <div className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                  "transition-transform duration-300 group-hover:scale-110",
                  colors.bg
                )}>
                  <Icon className={cn("h-6 w-6", colors.text)} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-foreground truncate">
                      {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                    </p>
                    {stat.trend && (
                      <span className={cn(
                        "text-xs font-medium",
                        stat.trend === "up" && "text-green-400",
                        stat.trend === "down" && "text-red-400"
                      )}>
                        {stat.trend === "up" ? "↑" : "↓"}
                        {stat.trendValue}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

// Simple stat display for sidebars
export function StatsList({ 
  stats,
  className 
}: { 
  stats: { label: string; value: string | number }[]
  className?: string 
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {stats.map((stat, index) => (
        <div key={index} className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">{stat.label}</span>
          <span className="font-semibold">
            {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
          </span>
        </div>
      ))}
    </div>
  )
}
