"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface ModernButtonProps {
  children: React.ReactNode
  icon?: LucideIcon
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  className?: string
  onClick?: () => void
  disabled?: boolean
}

export function ModernButton({
  children,
  icon: Icon,
  variant = "primary",
  size = "md",
  className,
  onClick,
  disabled,
}: ModernButtonProps) {
  const variants = {
    primary: "bg-primary hover:bg-primary/90 text-primary-foreground glow-sm shimmer",
    secondary: "glass glass-hover",
    outline: "border-2 neon-border glass-hover",
    ghost: "hover:glass",
  }

  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-6",
    lg: "h-13 px-8 text-lg",
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="inline-block"
    >
      <Button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "magnetic relative overflow-hidden group",
          variants[variant],
          sizes[size],
          className
        )}
      >
        {Icon && <Icon className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />}
        <span className="relative z-10">{children}</span>
        
        {/* Hover gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </Button>
    </motion.div>
  )
}
