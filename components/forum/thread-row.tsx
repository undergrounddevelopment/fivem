"use client"

import React, { useState } from "react"
import Link from "next/link"
import { 
  MessageSquare, Eye, Clock, Pin, Lock, 
  ChevronRight, FileText, Sparkles, Calendar
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { OptimizedImage } from "@/components/optimized-image"
import { cn } from "@/lib/utils"
import { getThreadType, getCategoryColor, type ThreadType } from "@/lib/thread-types"
import { formatDistanceToNow } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"

interface ThreadAuthor {
  id: string
  username: string
  avatar: string | null
  membership: string
}

interface ThreadRowProps {
  thread: {
    id: string
    title: string
    category: string
    categoryName?: string
    threadType?: string
    author: ThreadAuthor
    replies: number
    views: number
    content?: string
    isPinned: boolean
    isLocked?: boolean
    createdAt: string
    updatedAt?: string
    lastReply?: {
      author: ThreadAuthor
      createdAt: string
    } | null
  }
  className?: string
}

export function ThreadRow({ thread, className }: ThreadRowProps) {
  const [isHovered, setIsHovered] = useState(false)
  const threadType = getThreadType(thread.threadType)
  const categoryColor = getCategoryColor(thread.category)
  
  const lastActivity = thread.lastReply?.createdAt || thread.updatedAt || thread.createdAt
  const lastReplier = thread.lastReply?.author || thread.author

  // Extract snippet for preview
  const snippet = thread.content ? 
    (thread.content.length > 200 ? thread.content.substring(0, 200).trim() + "..." : thread.content) : 
    "No content preview available."

  return (
    <div 
      className="relative group/row"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/forum/thread/${thread.id}`}>
        <motion.div 
          whileHover={{ x: 4 }}
          className={cn(
            "group relative flex items-center gap-3 p-3 rounded-xl transition-all duration-300",
            "bg-[#0d1117]/60 hover:bg-[#161b22] border border-white/[0.05] hover:border-primary/40",
            "hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.15)]",
            thread.isPinned && "border-primary/30 bg-primary/[0.03] shadow-[inset_0_0_20px_rgba(59,130,246,0.02)]",
            className
          )}
        >
          {/* Thread Type Badge + Author Avatar */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Thread Type Badge */}
            <div 
              className="h-10 w-10 rounded-xl flex items-center justify-center text-xl shrink-0 transition-all duration-300 group-hover:scale-110"
              style={{ 
                backgroundColor: threadType.bgColor,
                border: `1px solid ${threadType.color}40`,
                boxShadow: `0 0 15px ${threadType.color}15`
              }}
              title={threadType.name}
            >
              {threadType.icon}
            </div>
            
            {/* Author Avatar */}
            <div className="relative">
              <div className="h-10 w-10 rounded-full overflow-hidden bg-white/5 ring-1 ring-white/10 group-hover:ring-primary/40 transition-all">
                <OptimizedImage
                  src={thread.author.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${thread.author.username}`}
                  alt={thread.author.username}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              </div>
              {/* Pinned indicator */}
              {thread.isPinned && (
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full flex items-center justify-center border-2 border-[#0d1117] shadow-lg">
                  <Pin className="h-2.5 w-2.5 text-black" />
                </div>
              )}
            </div>
          </div>

          {/* Title & Category */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {/* Thread Type Label */}
              <Badge 
                className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0 h-4 shrink-0 transition-all"
                style={{ 
                  backgroundColor: threadType.bgColor,
                  color: threadType.color,
                  border: `1px solid ${threadType.color}50`
                }}
              >
                {threadType.name}
              </Badge>
              
              {thread.isPinned && (
                <Badge className="bg-primary/20 text-primary border-primary/40 text-[9px] font-black uppercase tracking-tighter px-1.5 py-0 h-4">
                  PINNED
                </Badge>
              )}
            </div>
            
            <h3 className="font-bold text-sm sm:text-[15px] text-white/90 truncate group-hover:text-primary transition-colors leading-tight">
              {thread.title}
            </h3>
            
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[11px] text-muted-foreground truncate">
                by <span className="text-white/70 font-medium">{thread.author.username}</span>
              </p>
              <span className="h-1 w-1 rounded-full bg-white/10 shrink-0" />
              <p className="text-[10px] text-muted-foreground/60">
                {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Category Badge */}
          <div className="hidden sm:block shrink-0">
            <Badge 
              variant="outline"
              className="text-[9px] font-black px-2 py-0.5 whitespace-nowrap uppercase tracking-widest transition-all"
              style={{ 
                backgroundColor: `${categoryColor.color}10`,
                color: categoryColor.color,
                borderColor: `${categoryColor.color}40`
              }}
            >
              {thread.categoryName || thread.category}
            </Badge>
          </div>

          {/* Stats */}
          <div className="hidden md:flex items-center gap-4 shrink-0 text-muted-foreground/80">
            {/* Replies */}
            <div className="flex flex-col items-center min-w-[45px]">
              <span className="text-sm font-black text-white/90">{thread.replies.toLocaleString()}</span>
              <span className="text-[9px] uppercase tracking-tighter opacity-50 font-bold">Replies</span>
            </div>
            
            {/* Views */}
            <div className="flex flex-col items-center min-w-[45px]">
              <span className="text-sm font-black text-white/90">
                {thread.views >= 1000 ? `${(thread.views / 1000).toFixed(1)}K` : thread.views.toLocaleString()}
              </span>
              <span className="text-[9px] uppercase tracking-tighter opacity-50 font-bold">Views</span>
            </div>
          </div>

          {/* Last Activity */}
          <div className="hidden lg:flex items-center gap-2 shrink-0 min-w-[140px] pl-4 border-l border-white/5">
            <div className="text-right">
              <p className="text-[11px] text-white/80 font-bold truncate max-w-[100px]">
                {lastReplier.username}
              </p>
              <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1 justify-end">
                <Clock className="h-2.5 w-2.5" />
                {formatDistanceToNow(new Date(lastActivity), { addSuffix: false })}
              </p>
            </div>
            <div className="h-9 w-9 rounded-xl overflow-hidden bg-white/5 ring-1 ring-white/10 shrink-0 transition-transform group-hover:scale-105">
              <OptimizedImage
                src={lastReplier.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${lastReplier.username}`}
                alt={lastReplier.username}
                width={36}
                height={36}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          
          <ChevronRight className="h-4 w-4 text-white/10 group-hover:text-primary transition-colors shrink-0" />
        </motion.div>
      </Link>

      {/* Premium Hover Preview Card */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, delay: 0.4 }}
            className="absolute left-1/2 -top-2 -translate-x-1/2 -translate-y-full z-[100] pointer-events-none"
          >
            <div className="glass rounded-xl p-4 border border-primary/30 shadow-2xl shadow-primary/20 w-80 overflow-hidden relative">
              {/* Glow effect */}
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-primary/20 blur-[40px] rounded-full" />
              
              <div className="flex items-center gap-2 mb-3 relative z-10">
                <div className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/90">Preview</span>
                <div className="ml-auto flex items-center gap-2">
                   <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                     <Calendar className="h-3 w-3" />
                     {new Date(thread.createdAt).toLocaleDateString()}
                   </div>
                </div>
              </div>
              
              <div className="space-y-4 relative z-10">
                <p className="text-[13px] text-white/80 leading-relaxed font-medium line-clamp-5">
                  {snippet}
                </p>
                
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-primary" />
                      <span className="text-[11px] font-black">{thread.replies}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      <span className="text-[11px] font-black">{thread.likes || 0}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-black border-primary/40 bg-primary/5 text-primary animate-pulse">
                    READ FULL TOPIC
                  </Badge>
                </div>
              </div>
            </div>
            {/* Decorative arrow */}
            <div className="w-3 h-3 bg-[#0d1117] border-r border-b border-primary/30 rotate-45 mx-auto -mt-1.5 shadow-xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Skeleton loading state
export function ThreadRowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0d1117]/60 border border-white/[0.05] animate-pulse">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-white/5" />
        <div className="h-9 w-9 rounded-full bg-white/5" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="h-3 w-16 bg-white/5 rounded" />
        <div className="h-4 w-3/4 bg-white/5 rounded" />
        <div className="h-3 w-24 bg-white/5 rounded" />
      </div>
      <div className="hidden sm:block h-5 w-16 bg-white/5 rounded" />
      <div className="hidden md:flex gap-4">
        <div className="h-4 w-12 bg-white/5 rounded" />
        <div className="h-4 w-12 bg-white/5 rounded" />
      </div>
      <div className="hidden lg:flex items-center gap-2">
        <div className="h-3 w-16 bg-white/5 rounded" />
        <div className="h-6 w-6 rounded-full bg-white/5" />
      </div>
    </div>
  )
}
