"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, Users, MessageSquare, Download, Calendar, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface ActivityItem {
  id: string
  type: string
  description: string
  user?: {
    username: string
    avatar: string
  }
  created_at: string
  metadata?: any
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchActivities()

    const supabase = getSupabaseBrowserClient()
    let channel: RealtimeChannel | null = null

    if (supabase) {
      try {
        channel = supabase
          .channel("activity-feed")
          .on("postgres_changes", { event: "*", schema: "public", table: "activities" }, () => {
            fetchActivities()
          })
          .subscribe()
      } catch (error) {
        console.error("Failed to subscribe to activities:", error)
      }
    }

    const interval = setInterval(fetchActivities, 60000) // Fallback polling
    return () => {
      if (channel && supabase) supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [])

  const fetchActivities = async () => {
    try {
      const res = await fetch("/api/activity")
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()

      // Format activities to match ActivityItem interface
      const formattedActivities = (data || []).map((activity: any) => ({
        id: activity.id,
        type: activity.type,
        description: activity.description || activity.action || `${activity.type} activity`,
        user: activity.user ? {
          username: activity.user.username,
          avatar: activity.user.avatar
        } : undefined,
        created_at: activity.createdAt || activity.created_at,
        metadata: activity.metadata || {}
      }))

      setActivities(formattedActivities)
      setError(false)
    } catch (err) {
      console.error("Failed to fetch activities:", err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_joined":
        return <Users className="h-4 w-4 text-blue-500" />
      case "asset_uploaded":
        return <Download className="h-4 w-4 text-green-500" />
      case "forum_post":
        return <MessageSquare className="h-4 w-4 text-purple-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "user_joined":
        return "bg-blue-100 text-blue-800"
      case "asset_uploaded":
        return "bg-green-100 text-green-800"
      case "forum_post":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded mb-1"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-red-600 mb-2">Failed to load activity feed</p>
          <Button onClick={fetchActivities} variant="outline" size="sm">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="relative group overflow-hidden rounded-[2rem] bg-white/[0.02] border border-white/5 p-8 flex flex-col items-center justify-center text-center h-[400px]">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:border-primary/20 transition-all duration-300 group-hover:scale-105">
            <Activity className="h-8 w-8 text-primary/50" />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">System Idle</h3>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-40">
            Awaiting fresh uplink transmissions...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-tighter italic">Live Uplink</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">Real-time Activity Stream</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-black px-3 py-1 scale-90">
          {activities.length} FEED
        </Badge>
      </div>

      <div className="space-y-3">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.03 }}
            className="group relative"
          >
            <div className="relative overflow-hidden rounded-xl bg-white/[0.02] border border-white/5 p-4 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-200">
              <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
                {/* User Avatar & Type Icon Container */}
                <div className="relative shrink-0">
                  {activity.user ? (
                    <Avatar className="h-10 w-10 border-2 border-white/5 group-hover:border-primary/30 transition-colors shadow-lg">
                      <AvatarImage src={activity.user.avatar} />
                      <AvatarFallback className="bg-white/5 text-xs font-black">
                        {activity.user.username[0]}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <Activity className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className={cn(
                    "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#0A0A0A] flex items-center justify-center shadow-md",
                    getActivityColor(activity.type).split(' ')[0]
                  )}>
                    {getActivityIcon(activity.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors">
                      {activity.user?.username || 'System User'}
                    </span>
                    <Badge variant="outline" className={cn(
                      "text-[8px] font-black uppercase tracking-widest px-1.5 py-0 border-none opacity-50",
                      getActivityColor(activity.type)
                    )}>
                      {activity.type.replace('_', ' ')}
                    </Badge>
                  </div>

                  <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                    {activity.description}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {activity.metadata?.amount && (
                      <span className="text-primary/60">
                        {activity.metadata.amount.toLocaleString()} UNITS
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Button Indicator */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Decoration Line */}
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-[3px] opacity-0 group-hover:opacity-100 transition-all duration-300",
                getActivityColor(activity.type).split(' ')[0].replace('bg-', 'bg-')
              )} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-white/5">
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchActivities}
          className="w-full text-[10px] font-black uppercase tracking-[0.3em] opacity-40 hover:opacity-100 hover:bg-white/5 transition-all text-muted-foreground"
        >
          <Activity className="h-3 w-3 mr-2 text-primary" />
          Synchronize Core Feed
        </Button>
      </div>
    </div>
  )
}