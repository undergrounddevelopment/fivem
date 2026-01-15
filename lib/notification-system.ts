import { createClient } from '@supabase/supabase-js'
import { toast } from 'sonner'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Notification {
  id: string
  type: 'reply' | 'like' | 'mention' | 'download' | 'purchase'
  title: string
  message: string
  userId: string
  read: boolean
  createdAt: string
  data?: any
}

class NotificationSystem {
  private static instance: NotificationSystem
  private channel: any
  private userId: string | null = null

  static getInstance() {
    if (!this.instance) {
      this.instance = new NotificationSystem()
    }
    return this.instance
  }

  init(userId: string) {
    this.userId = userId
    this.setupRealtimeChannel()
  }

  private setupRealtimeChannel() {
    if (!this.userId) return

    this.channel = supabase
      .channel(`notifications:${this.userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${this.userId}`
      }, (payload) => {
        this.handleNewNotification(payload.new as Notification)
      })
      .subscribe()
  }

  private handleNewNotification(notification: Notification) {
    const icons = {
      reply: '💬',
      like: '❤️',
      mention: '@',
      download: '⬇️',
      purchase: '💰'
    }

    toast.success(`${icons[notification.type]} ${notification.title}`, {
      description: notification.message,
      duration: 5000,
      action: {
        label: 'View',
        onClick: () => this.handleNotificationClick(notification)
      }
    })

    // Update notification count
    this.updateNotificationCount()
  }

  private handleNotificationClick(notification: Notification) {
    const routes = {
      reply: `/forum/thread/${notification.data?.threadId}`,
      like: `/forum/thread/${notification.data?.threadId}`,
      mention: `/forum/thread/${notification.data?.threadId}`,
      download: `/assets/${notification.data?.assetId}`,
      purchase: `/dashboard`
    }

    const route = routes[notification.type]
    if (route) {
      window.location.href = route
    }
  }

  private async updateNotificationCount() {
    try {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', this.userId)
        .eq('read', false)

      // Update UI notification badge
      const badge = document.querySelector('[data-notification-count]')
      if (badge && count !== null) {
        (badge as HTMLElement).textContent = count > 99 ? '99+' : count.toString();
        (badge as HTMLElement).style.display = count > 0 ? 'block' : 'none'
      }
    } catch (error) {
      console.error('Failed to update notification count:', error)
    }
  }

  async markAsRead(notificationId: string) {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      this.updateNotificationCount()
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  async getNotifications(limit = 20) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      return []
    }
  }

  disconnect() {
    if (this.channel) {
      supabase.removeChannel(this.channel)
    }
  }
}

export const notificationSystem = NotificationSystem.getInstance()