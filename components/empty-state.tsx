"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
    icon?: LucideIcon
  }
  className?: string
  size?: "sm" | "md" | "lg"
}

const sizeStyles = {
  sm: {
    container: "py-8",
    iconWrapper: "h-12 w-12 rounded-xl",
    icon: "h-6 w-6",
    title: "text-sm",
    description: "text-xs"
  },
  md: {
    container: "py-12",
    iconWrapper: "h-16 w-16 rounded-2xl",
    icon: "h-8 w-8",
    title: "text-base",
    description: "text-sm"
  },
  lg: {
    container: "py-16",
    iconWrapper: "h-20 w-20 rounded-2xl",
    icon: "h-10 w-10",
    title: "text-lg",
    description: "text-base"
  }
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = "md"
}: EmptyStateProps) {
  const styles = sizeStyles[size]
  const ActionIcon = action?.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        styles.container,
        className
      )}
    >
      <div className={cn(
        "bg-primary/10 flex items-center justify-center mb-4",
        styles.iconWrapper
      )}>
        <Icon className={cn("text-primary", styles.icon)} />
      </div>
      
      <p className={cn("text-muted-foreground mb-2", styles.title)}>
        {title}
      </p>
      
      {description && (
        <p className={cn("text-muted-foreground/70 mb-4 max-w-sm", styles.description)}>
          {description}
        </p>
      )}
      
      {action && (
        action.href ? (
          <Link href={action.href}>
            <Button className="gap-2 bg-gradient-to-r from-primary to-pink-600 hover:opacity-90">
              {ActionIcon && <ActionIcon className="h-4 w-4" />}
              {action.label}
            </Button>
          </Link>
        ) : (
          <Button 
            onClick={action.onClick}
            className="gap-2 bg-gradient-to-r from-primary to-pink-600 hover:opacity-90"
          >
            {ActionIcon && <ActionIcon className="h-4 w-4" />}
            {action.label}
          </Button>
        )
      )}
    </motion.div>
  )
}
