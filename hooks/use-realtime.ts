"use client"

import { useEffect, useState, useCallback } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

// Hook for realtime stats updates
export function useRealtimeStats() {
  const [stats, setStats] = useState({
    onlineUsers: 0,
    totalMembers: 0,
    totalAssets: 0,
    totalDownloads: 0,
    totalThreads: 0,
    totalPosts: 0,
  })
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats")
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [fetchStats])

  return { stats, loading, refetch: fetchStats }
}

// Hook for realtime notifications
export function useRealtimeNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    if (!userId) return

    try {
      const res = await fetch("/api/notifications")
      const data = await res.json()
      const rows = Array.isArray(data?.notifications) ? data.notifications : []
      setNotifications(rows)
      setUnreadCount(rows.filter((n: any) => !n.is_read).length)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchNotifications()

    if (!userId) return

    const supabase = getSupabaseBrowserClient()
    let channel: RealtimeChannel | null = null

    try {
      channel = supabase
        .channel(`notifications:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            setNotifications((prev) => [payload.new as any, ...prev])
            setUnreadCount((prev) => prev + 1)
          },
        )
        .subscribe()
    } catch (error) {
      console.error("Failed to subscribe to notifications:", error)
    }

    const interval = setInterval(fetchNotifications, 60000)

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
      clearInterval(interval)
    }
  }, [userId, fetchNotifications])

  const markAsRead = async (notificationId?: string) => {
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      })

      if (notificationId) {
        setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)))
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } else {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error("Failed to mark as read:", error)
    }
  }

  return { notifications, unreadCount, loading, refetch: fetchNotifications, markAsRead }
}

// Hook for realtime forum threads
export function useRealtimeThreads(categoryId?: string) {
  const [threads, setThreads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchThreads = useCallback(async () => {
    try {
      const url = categoryId ? `/api/forum/threads?categoryId=${categoryId}` : "/api/forum/threads"
      const res = await fetch(url)
      const data = await res.json()
      setThreads(data.threads || [])
    } catch (error) {
      console.error("Failed to fetch threads:", error)
    } finally {
      setLoading(false)
    }
  }, [categoryId])

  useEffect(() => {
    fetchThreads()

    const supabase = getSupabaseBrowserClient()
    let channel: RealtimeChannel | null = null

    try {
      channel = supabase
        .channel("forum_threads_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "forum_threads",
          },
          () => {
            fetchThreads()
          },
        )
        .subscribe()
    } catch (error) {
      console.error("Failed to subscribe to threads:", error)
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [categoryId, fetchThreads])

  return { threads, loading, refetch: fetchThreads }
}

// Hook for realtime assets
export function useRealtimeAssets(filters?: { category?: string; framework?: string; search?: string }) {
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 })

  const fetchAssets = useCallback(
    async (page = 1) => {
      try {
        const params = new URLSearchParams({ page: String(page) })
        if (filters?.category) params.set("category", filters.category)
        if (filters?.framework) params.set("framework", filters.framework)
        if (filters?.search) params.set("search", filters.search)

        const res = await fetch(`/api/assets?${params}`)
        const data = await res.json()
        setAssets(data.assets || data.items || [])
        setPagination(data.pagination || { page: 1, total: 0, pages: 0 })
      } catch (error) {
        console.error("Failed to fetch assets:", error)
      } finally {
        setLoading(false)
      }
    },
    [filters?.category, filters?.framework, filters?.search],
  )

  useEffect(() => {
    fetchAssets()

    const supabase = getSupabaseBrowserClient()
    let channel: RealtimeChannel | null = null

    try {
      channel = supabase
        .channel("assets_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "assets",
          },
          () => {
            fetchAssets()
          },
        )
        .subscribe()
    } catch (error) {
      console.error("Failed to subscribe to assets:", error)
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [fetchAssets])

  return { assets, loading, pagination, refetch: fetchAssets }
}

export function useRealtimeMessages(userId: string | undefined, otherUserId?: string) {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMessages = useCallback(async () => {
    if (!userId) return

    try {
      const params = otherUserId ? `?otherUserId=${otherUserId}` : ""
      const res = await fetch(`/api/messages${params}`)
      const data = await res.json()
      setMessages(Array.isArray(data) ? data : data.messages || [])
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    } finally {
      setLoading(false)
    }
  }, [userId, otherUserId])

  useEffect(() => {
    fetchMessages()

    if (!userId) return

    const supabase = getSupabaseBrowserClient()
    let channel: RealtimeChannel | null = null

    try {
      channel = supabase
        .channel(`messages:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
          },
          (payload) => {
            const newMsg = payload.new as any
            // Only add if this message involves the current user
            if (newMsg.sender_id === userId || newMsg.receiver_id === userId) {
              setMessages((prev) => [...prev, newMsg])
            }
          },
        )
        .subscribe()
    } catch (error) {
      console.error("Failed to subscribe to messages:", error)
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [userId, fetchMessages])

  return { messages, loading, refetch: fetchMessages }
}

export function useRealtimeActivity() {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchActivity = useCallback(async () => {
    try {
      const res = await fetch("/api/activity")
      const data = await res.json()
      setActivities(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch activity:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchActivity()

    const supabase = getSupabaseBrowserClient()
    let channel: RealtimeChannel | null = null

    try {
      channel = supabase
        .channel("activity_feed")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "activities",
          },
          () => {
            fetchActivity()
          },
        )
        .subscribe()
    } catch (error) {
      console.error("Failed to subscribe to activity:", error)
    }

    const interval = setInterval(fetchActivity, 60000)

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
      clearInterval(interval)
    }
  }, [fetchActivity])

  return { activities, loading, refetch: fetchActivity }
}

export function useRealtimeReplies(threadId: string) {
  const [replies, setReplies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchReplies = useCallback(async () => {
    if (!threadId) return

    try {
      const res = await fetch(`/api/forum/threads/${threadId}/replies`)
      const data = await res.json()
      setReplies(data.replies || [])
    } catch (error) {
      console.error("Failed to fetch replies:", error)
    } finally {
      setLoading(false)
    }
  }, [threadId])

  useEffect(() => {
    fetchReplies()

    const supabase = getSupabaseBrowserClient()
    let channel: RealtimeChannel | null = null

    try {
      channel = supabase
        .channel(`replies:${threadId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "forum_replies",
            filter: `thread_id=eq.${threadId}`,
          },
          () => {
            fetchReplies()
          },
        )
        .subscribe()
    } catch (error) {
      console.error("Failed to subscribe to replies:", error)
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [threadId, fetchReplies])

  return { replies, loading, refetch: fetchReplies }
}
