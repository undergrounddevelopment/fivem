"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, Users, MessageSquare, Download, Calendar } from "lucide-react"
import { motion } from "framer-motion"

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
    const interval = setInterval(fetchActivities, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const fetchActivities = async () => {
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from("activities")
        .select(`
          *,
          users:user_id (
            username,
            avatar
          )
        `)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) throw error
      
      const formattedActivities = (data || []).map(activity => ({
        id: activity.id,
        type: activity.type,
        description: activity.description,
        user: activity.users ? {
          username: activity.users.username,
          avatar: activity.users.avatar
        } : undefined,
        created_at: activity.created_at,
        metadata: activity.metadata
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No recent activity</p>
          <p className="text-sm text-muted-foreground mt-2">
            Activity will appear here as users interact with the platform
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Live Activity
          <Badge variant="secondary" className="ml-auto">
            {activities.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="mt-1">
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {activity.user && (
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={activity.user.avatar} />
                      <AvatarFallback className="text-xs">
                        {activity.user.username[0]}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getActivityColor(activity.type)}`}
                  >
                    {activity.type.replace('_', ' ')}
                  </Badge>
                </div>
                
                <p className="text-sm font-medium line-clamp-2">
                  {activity.description}
                </p>
                
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(activity.created_at).toLocaleString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <Button variant="outline" size="sm" onClick={fetchActivities}>
            Refresh Activity
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}