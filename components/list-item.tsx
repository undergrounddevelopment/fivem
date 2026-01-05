"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"

interface MetadataItem {
  icon: LucideIcon
  value: string | number
}

interface ListItemProps {
  title: string
  subtitle?: string
  avatar?: string
  avatarFallback?: string
  metadata?: MetadataItem[]
  href?: string
  onClick?: () => void
  badge?: {
    label: string
    variant?: "default" | "secondary" | "destructive" | "outline"
  }
  isPinned?: boolean
  className?: string
  index?: number
}

export function ListItem({
  title,
  subtitle,
  avatar,
  avatarFallback,
  metadata,
  href,
  onClick,
  badge,
  isPinned,
  className,
  index = 0
}: ListItemProps) {
  const content = (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      whileHover={{ x: 4 }}
      className={cn(
        "flex items-center gap-4 rounded-xl p-4 transition-all duration-200 cursor-pointer group",
        isPinned 
          ? "bg-primary/5 border border-primary/20 hover:bg-primary/10" 
          : "bg-secondary/20 hover:bg-secondary/40",
        className
      )}
      onClick={onClick}
    >
      {/* Avatar */}
      {(avatar || avatarFallback) && (
        <div className="h-11 w-11 overflow-hidden rounded-full bg-secondary shrink-0 relative">
          {avatar ? (
            <Image
              src={avatar}
              alt={title}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm font-medium">
              {avatarFallback}
            </div>
          )}
        </div>
      )}
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {isPinned && (
            <span className="text-primary text-xs">📌</span>
          )}
          <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
            {title}
          </h3>
          {badge && (
            <Badge variant={badge.variant || "secondary"} className="text-xs shrink-0">
              {badge.label}
            </Badge>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {subtitle}
          </p>
        )}
      </div>
      
      {/* Metadata */}
      {metadata && metadata.length > 0 && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
          {metadata.map((item, i) => {
            const Icon = item.icon
            return (
              <div key={i} className="flex items-center gap-1">
                <Icon className="h-4 w-4" />
                <span className="font-medium">
                  {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    )
  }

  return content
}

// List container with consistent spacing
export function ListContainer({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {children}
    </div>
  )
}
