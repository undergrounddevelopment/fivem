"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { SessionUser, Notification, Stats } from "./types"

interface AuthState {
  user: SessionUser | null
  isLoading: boolean
  setUser: (user: SessionUser | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Notification) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
}

interface StatsState {
  stats: Stats
  setStats: (stats: Partial<Stats>) => void
}

interface UIState {
  sidebarCollapsed: boolean
  mobileMenuOpen: boolean
  searchQuery: string
  toggleSidebar: () => void
  setMobileMenuOpen: (open: boolean) => void
  setSearchQuery: (query: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => {
        set({ user: null })
        document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      },
    }),
    {
      name: "fivemtools-auth",
      partialize: (state) => ({ user: state.user }),
    },
  ),
)

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.read ? 0 : 1),
    })),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
}))

export const useStatsStore = create<StatsState>((set) => ({
  stats: {
    onlineUsers: 0,
    totalMembers: 0,
    totalAssets: 0,
    totalDownloads: 0,
    totalThreads: 0,
    totalPosts: 0,
  },
  setStats: (newStats) => set((state) => ({ 
    stats: { 
      ...state.stats, 
      ...newStats,
      onlineUsers: newStats.onlineUsers ?? state.stats.onlineUsers
    } 
  })),
}))

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  searchQuery: "",
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}))
