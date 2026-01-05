"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  subtitle?: string
  icon: LucideIcon
  iconColor?: "primary" | "blue" | "amber" | "green" | "purple"
  actions?: React.ReactNode
  className?: string
}

const iconColorStyles = {
  primary: "from-pink-500 to-rose-500",
  blue: "from-blue-500 to-cyan-500",
  amber: "from-amber-500 to-orange-500",
  green: "from-green-500 to-emerald-500",
  purple: "from-purple-500 to-violet-500"
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  iconColor = "primary",
  actions,
  className
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "h-14 w-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shrink-0",
          iconColorStyles[iconColor]
        )}>
          <Icon className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      
      {actions && (
        <div className="flex items-center gap-3 flex-wrap">
          {actions}
        </div>
      )}
    </motion.div>
  )
}
