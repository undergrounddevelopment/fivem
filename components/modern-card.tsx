"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type ColorScheme = "primary" | "blue" | "amber" | "green" | "purple" | "red"
type CardVariant = "default" | "stat" | "feature" | "glass"

interface ModernCardProps {
  title: string
  description?: string
  icon?: LucideIcon
  value?: string | number
  trend?: "up" | "down" | "neutral"
  className?: string
  onClick?: () => void
  children?: React.ReactNode
  variant?: CardVariant
  colorScheme?: ColorScheme
  animate?: boolean
  delay?: number
}

const colorSchemeStyles: Record<ColorScheme, { bg: string; text: string; border: string; glow: string }> = {
  primary: {
    bg: "rgba(236, 72, 153, 0.15)",
    text: "text-pink-400",
    border: "border-pink-500/20",
    glow: "rgba(236, 72, 153, 0.3)"
  },
  blue: {
    bg: "rgba(59, 130, 246, 0.15)",
    text: "text-blue-400",
    border: "border-blue-500/20",
    glow: "rgba(59, 130, 246, 0.3)"
  },
  amber: {
    bg: "rgba(245, 158, 11, 0.15)",
    text: "text-amber-400",
    border: "border-amber-500/20",
    glow: "rgba(245, 158, 11, 0.3)"
  },
  green: {
    bg: "rgba(34, 197, 94, 0.15)",
    text: "text-green-400",
    border: "border-green-500/20",
    glow: "rgba(34, 197, 94, 0.3)"
  },
  purple: {
    bg: "rgba(168, 85, 247, 0.15)",
    text: "text-purple-400",
    border: "border-purple-500/20",
    glow: "rgba(168, 85, 247, 0.3)"
  },
  red: {
    bg: "rgba(239, 68, 68, 0.15)",
    text: "text-red-400",
    border: "border-red-500/20",
    glow: "rgba(239, 68, 68, 0.3)"
  }
}

export function ModernCard({
  title,
  description,
  icon: Icon,
  value,
  trend,
  className,
  onClick,
  children,
  variant = "default",
  colorScheme = "primary",
  animate = true,
  delay = 0
}: ModernCardProps) {
  const colors = colorSchemeStyles[colorScheme]
  
  const cardContent = (
    <Card
      className={cn(
        "glass card-hover cursor-pointer overflow-hidden group relative backdrop-blur-xl",
        "border border-white/10 hover:border-white/20",
        colors.border,
        className
      )}
      onClick={onClick}
      style={{
        background: "rgba(255, 255, 255, 0.03)",
      }}
    >
      {/* Gradient overlay on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${colors.bg} 0%, transparent 100%)`
        }}
      />
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            {value !== undefined && (
              <div className="flex items-baseline gap-2">
                <p className={cn("text-3xl font-bold", colors.text)}>{value}</p>
                {trend && (
                  <span
                    className={cn(
                      "text-xs font-medium px-1.5 py-0.5 rounded",
                      trend === "up" && "text-green-400 bg-green-500/10",
                      trend === "down" && "text-red-400 bg-red-500/10",
                      trend === "neutral" && "text-muted-foreground bg-muted/50"
                    )}
                  >
                    {trend === "up" && "↑"}
                    {trend === "down" && "↓"}
                    {trend === "neutral" && "→"}
                  </span>
                )}
              </div>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {children}
          </div>
          
          {Icon && (
            <div 
              className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
              style={{ background: colors.bg }}
            >
              <Icon className={cn("h-6 w-6", colors.text)} />
            </div>
          )}
        </div>
      </CardContent>

      {/* Shimmer Effect */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none overflow-hidden"
      >
        <div 
          className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)"
          }}
        />
      </div>
      
      {/* Glow Effect on Hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${colors.glow} 0%, transparent 70%)`,
        }}
      />
    </Card>
  )

  if (!animate) {
    return <div className="h-full">{cardContent}</div>
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="h-full"
    >
      {cardContent}
    </motion.div>
  )
}

// Stat Card variant for dashboard stats
export function StatCard({
  label,
  value,
  icon: Icon,
  colorScheme = "primary",
  trend,
  description,
  className,
  delay = 0
}: {
  label: string
  value: string | number
  icon: LucideIcon
  colorScheme?: ColorScheme
  trend?: "up" | "down" | "neutral"
  description?: string
  className?: string
  delay?: number
}) {
  return (
    <ModernCard
      title={label}
      value={value}
      icon={Icon}
      colorScheme={colorScheme}
      trend={trend}
      description={description}
      className={className}
      delay={delay}
    />
  )
}
