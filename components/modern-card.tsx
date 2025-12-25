"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ModernCardProps {
  title: string
  description?: string
  icon?: LucideIcon
  value?: string | number
  trend?: "up" | "down" | "neutral"
  className?: string
  onClick?: () => void
}

export function ModernCard({
  title,
  description,
  icon: Icon,
  value,
  trend,
  className,
  onClick,
}: ModernCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn(
          "glass card-hover magnetic cursor-pointer overflow-hidden group",
          className
        )}
        onClick={onClick}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <p className="text-sm text-muted-foreground">{title}</p>
              {value && (
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold gradient-text">{value}</p>
                  {trend && (
                    <span
                      className={cn(
                        "text-xs font-medium",
                        trend === "up" && "text-success",
                        trend === "down" && "text-destructive",
                        trend === "neutral" && "text-muted-foreground"
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
            </div>
            
            {Icon && (
              <div className="p-3 rounded-xl glass group-hover:glow-sm transition-all">
                <Icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
              </div>
            )}
          </div>
        </CardContent>

        {/* Shimmer Effect */}
        <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
      </Card>
    </motion.div>
  )
}
