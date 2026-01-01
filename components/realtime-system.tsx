"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Bell, Users, Activity, MessageSquare, Download, Coins, Star, TrendingUp, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface RealtimeEvent {
  id: string
  type: "user_joined" | "asset_uploaded" | "forum_post" | "download" | "purchase" | "achievement" | "system"
  title: string
  description: string
  user?: {
    id: string
    username: string
    avatar: string
  }
  metadata?: any
  timestamp: string
  priority: "low" | "medium" | "high"
}

interface LiveStats {
  online_users: number
  active_downloads: number
  recent_uploads: number
  forum_activity: number
  total_revenue: number
  server_load: number
}

interface OnlineUser {
  id: string
  username: string
  avatar: string
  status: "online" | "away" | "busy"
  last_activity: string
  current_page?: string
}

export function RealtimeSystem() {
  const [events, setEvents] = useState<RealtimeEvent[]>([])
  const [liveStats, setLiveStats] = useState<LiveStats | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState<RealtimeEvent[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const supabase = createClient()
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    initializeRealtime()
    return () => {
      cleanup()
    }
  }, [])

  const initializeRealtime = async () => {
    try {
      // Initialize Supabase realtime subscriptions
      const channel = supabase
        .channel("realtime-system")
        .on("postgres_changes", 
          { event: "*", schema: "public", table: "users" },
          handleUserChanges
        )
        .on("postgres_changes",
          { event: "*", schema: "public", table: "assets" },
          handleAssetChanges
        )
        .on("postgres_changes",
          { event: "*", schema: "public", table: "forum_threads" },
          handleForumChanges
        )
        .on("postgres_changes",
          { event: "*", schema: "public", table: "downloads" },
          handleDownloadChanges
        )
        .on("presence", { event: "sync" }, handlePresenceSync)
        .on("presence", { event: "join" }, handlePresenceJoin)
        .on("presence", { event: "leave" }, handlePresenceLeave)
        .subscribe((status) => {
          setIsConnected(status === "SUBSCRIBED")
          if (status === "SUBSCRIBED") {
            toast.success("Real-time connection established")
          }
        })

      // Track user presence
      await channel.track({
        user_id: "current-user-id", // Replace with actual user ID
        username: "Current User", // Replace with actual username
        avatar: "/placeholder-user.jpg", // Replace with actual avatar
        status: "online",
        timestamp: new Date().toISOString()
      })

      // Initialize Server-Sent Events for additional real-time data
      initializeSSE()

      // Fetch initial data
      await fetchInitialData()

    } catch (error) {
      console.error("Failed to initialize realtime:", error)
      toast.error("Failed to establish real-time connection")
    }
  }

  const initializeSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    eventSourceRef.current = new EventSource("/api/realtime/events")
    
    eventSourceRef.current.onopen = () => {
      console.log("SSE connection opened")
    }

    eventSourceRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        handleSSEMessage(data)
      } catch (error) {
        console.error("Failed to parse SSE message:", error)
      }
    }

    eventSourceRef.current.onerror = (error) => {
      console.error("SSE connection error:", error)
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
          initializeSSE()
        }
      }, 5000)
    }
  }

  const handleSSEMessage = (data: any) => {
    switch (data.type) {
      case "stats_update":
        setLiveStats(data.payload)
        break
      case "system_event":
        addEvent(data.payload)
        break
      case "notification":
        addNotification(data.payload)
        break
      default:
        console.log("Unknown SSE message type:", data.type)
    }
  }

  const fetchInitialData = async () => {
    try {
      const [statsRes, eventsRes, usersRes] = await Promise.all([
        fetch("/api/realtime/stats"),
        fetch("/api/realtime/events?limit=50"),
        fetch("/api/realtime/online-users")
      ])

      const [statsData, eventsData, usersData] = await Promise.all([
        statsRes.json(),
        eventsRes.json(),
        usersRes.json()
      ])

      if (statsData.success) setLiveStats(statsData.data)
      if (eventsData.success) setEvents(eventsData.data)
      if (usersData.success) setOnlineUsers(usersData.data)

    } catch (error) {
      console.error("Failed to fetch initial data:", error)
    }
  }

  const handleUserChanges = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload

    switch (eventType) {
      case "INSERT":
        addEvent({
          id: `user-${newRecord.id}-${Date.now()}`,
          type: "user_joined",
          title: "New User Joined",
          description: `${newRecord.username} just joined the platform!`,
          user: {
            id: newRecord.id,
            username: newRecord.username,
            avatar: newRecord.avatar
          },
          timestamp: new Date().toISOString(),
          priority: "medium"
        })
        break
      case "UPDATE":
        if (oldRecord.last_seen !== newRecord.last_seen) {
          updateUserPresence(newRecord)
        }
        break
    }
  }

  const handleAssetChanges = (payload: any) => {
    const { eventType, new: newRecord } = payload

    if (eventType === "INSERT") {
      addEvent({
        id: `asset-${newRecord.id}-${Date.now()}`,
        type: "asset_uploaded",
        title: "New Asset Uploaded",
        description: `${newRecord.title} has been uploaded`,
        metadata: {
          assetId: newRecord.id,
          category: newRecord.category,
          framework: newRecord.framework
        },
        timestamp: new Date().toISOString(),
        priority: "medium"
      })
    }
  }

  const handleForumChanges = (payload: any) => {
    const { eventType, new: newRecord } = payload

    if (eventType === "INSERT") {
      addEvent({
        id: `forum-${newRecord.id}-${Date.now()}`,
        type: "forum_post",
        title: "New Forum Thread",
        description: `New thread: ${newRecord.title}`,
        metadata: {
          threadId: newRecord.id,
          categoryId: newRecord.category_id
        },
        timestamp: new Date().toISOString(),
        priority: "low"
      })
    }
  }

  const handleDownloadChanges = (payload: any) => {
    const { eventType, new: newRecord } = payload

    if (eventType === "INSERT") {
      addEvent({
        id: `download-${newRecord.id}-${Date.now()}`,
        type: "download",
        title: "Asset Downloaded",
        description: `Asset downloaded by user`,
        metadata: {
          assetId: newRecord.asset_id,
          userId: newRecord.user_id
        },
        timestamp: new Date().toISOString(),
        priority: "low"
      })
    }
  }

  const handlePresenceSync = () => {
    console.log("Presence synced")
  }

  const handlePresenceJoin = ({ key, newPresences }: any) => {
    console.log("User joined:", newPresences)
    newPresences.forEach((presence: any) => {
      setOnlineUsers(prev => {
        const exists = prev.find(u => u.id === presence.user_id)
        if (!exists) {
          return [...prev, {
            id: presence.user_id,
            username: presence.username,
            avatar: presence.avatar,
            status: presence.status,
            last_activity: presence.timestamp
          }]
        }
        return prev
      })
    })
  }

  const handlePresenceLeave = ({ key, leftPresences }: any) => {
    console.log("User left:", leftPresences)
    leftPresences.forEach((presence: any) => {
      setOnlineUsers(prev => prev.filter(u => u.id !== presence.user_id))
    })
  }

  const updateUserPresence = (user: any) => {
    setOnlineUsers(prev => 
      prev.map(u => 
        u.id === user.id 
          ? { ...u, last_activity: user.last_seen }
          : u
      )
    )
  }

  const addEvent = (event: RealtimeEvent) => {
    setEvents(prev => [event, ...prev.slice(0, 49)]) // Keep only last 50 events
    
    // Show toast for high priority events
    if (event.priority === "high") {
      toast.info(event.title, {
        description: event.description
      })
    }
  }

  const addNotification = (notification: RealtimeEvent) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]) // Keep only last 10 notifications
    
    // Show toast notification
    toast.info(notification.title, {
      description: notification.description,
      action: {
        label: "View",
        onClick: () => setShowNotifications(true)
      }
    })
  }

  const cleanup = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }
    supabase.removeAllChannels()
  }

  const getEventIcon = (type: string) => {
    const icons = {
      user_joined: <Users className="h-4 w-4 text-blue-500" />,
      asset_uploaded: <Download className="h-4 w-4 text-green-500" />,
      forum_post: <MessageSquare className="h-4 w-4 text-purple-500" />,
      download: <Download className="h-4 w-4 text-orange-500" />,
      purchase: <Coins className="h-4 w-4 text-yellow-500" />,
      achievement: <Star className="h-4 w-4 text-pink-500" />,
      system: <Activity className="h-4 w-4 text-gray-500" />
    }
    return icons[type as keyof typeof icons] || <Activity className="h-4 w-4" />
  }

  const LiveStatsDisplay = () => {
    if (!liveStats) return null

    const stats = [
      {
        label: "Online Users",
        value: liveStats.online_users,
        icon: <Users className="h-4 w-4" />,
        color: "text-blue-500"
      },
      {
        label: "Active Downloads",
        value: liveStats.active_downloads,
        icon: <Download className="h-4 w-4" />,
        color: "text-green-500"
      },
      {
        label: "Forum Activity",
        value: liveStats.forum_activity,
        icon: <MessageSquare className="h-4 w-4" />,
        color: "text-purple-500"
      },
      {
        label: "Server Load",
        value: `${liveStats.server_load}%`,
        icon: <Activity className="h-4 w-4" />,
        color: liveStats.server_load > 80 ? "text-red-500" : "text-green-500"
      }
    ]

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={stat.color}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    )
  }

  const RealtimeEvents = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Live Activity Feed
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </CardHeader>
      <CardContent className="max-h-96 overflow-y-auto">
        <AnimatePresence>
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="mt-1">
                {getEventIcon(event.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{event.title}</p>
                  <Badge variant="outline" className="text-xs">
                    {event.type.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {event.description}
                </p>
                {event.user && (
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={event.user.avatar} />
                      <AvatarFallback>{event.user.username[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {event.user.username}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(event.timestamp).toLocaleTimeString()}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  )

  const OnlineUsersDisplay = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Online Users ({onlineUsers.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-64 overflow-y-auto">
        <div className="space-y-2">
          {onlineUsers.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
            >
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.username[0]}</AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                  user.status === 'online' ? 'bg-green-500' :
                  user.status === 'away' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{user.username}</p>
                <p className="text-xs text-muted-foreground">
                  {user.current_page || 'Active'}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-lg border ${
          isConnected 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}
      >
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          <span className="font-medium">
            Real-time System {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </motion.div>

      {/* Live Stats */}
      <LiveStatsDisplay />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RealtimeEvents />
        </div>
        <div>
          <OnlineUsersDisplay />
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowNotifications(false)}
        >
          <Card className="w-full max-w-md max-h-96 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Notifications</span>
                <Button variant="ghost" size="sm" onClick={() => setShowNotifications(false)}>
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-3 rounded-lg border">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}