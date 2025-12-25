"use client"

import { useEffect, useState } from "react"
import { Download, MessageSquare, Heart, UserPlus, Star, Clock } from "lucide-react"
import Link from "next/link"

interface Activity {
  id: string
  type: string
  action: string
  createdAt: string
  user: {
    username: string
    avatar: string | null
  }
}

const iconMap: Record<string, { icon: typeof Download; color: string }> = {
  download: { icon: Download, color: "text-primary" },
  post: { icon: MessageSquare, color: "text-success" },
  like: { icon: Heart, color: "text-chart-5" },
  join: { icon: UserPlus, color: "text-accent" },
  review: { icon: Star, color: "text-warning" },
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchActivity() {
      try {
        const res = await fetch("/api/activity")
        if (res.ok) {
          const data = await res.json()
          setActivities(data)
        }
      } catch (error) {
        console.error("Failed to fetch activity:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivity()
    const interval = setInterval(fetchActivity, 15000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          Activity Feed
        </h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-secondary/80 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-secondary/80 rounded animate-pulse" />
                <div className="h-3 w-1/4 bg-secondary/80 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5 text-muted-foreground" />
        Activity Feed
        <span className="ml-auto h-2 w-2 rounded-full status-online animate-pulse" />
      </h3>
      <div className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
        ) : (
          activities.map((activity) => {
            const { icon: Icon, color } = iconMap[activity.type] || iconMap.download
            return (
              <div key={activity.id} className="flex items-start gap-3 text-sm">
                <div className="h-8 w-8 rounded-lg bg-secondary/80 flex items-center justify-center shrink-0">
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground">
                    <span className="font-medium">{activity.user.username}</span>
                    <span className="text-muted-foreground"> {activity.action}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{new Date(activity.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>
            )
          })
        )}
      </div>
      <Link
        href="/forum"
        className="block w-full mt-4 text-sm text-primary hover:text-primary/80 transition-colors text-center"
      >
        View all activity
      </Link>
    </div>
  )
}
