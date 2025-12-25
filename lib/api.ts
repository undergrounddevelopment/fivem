// Production API client for FiveM Tools V7
import type {
  Asset,
  ForumThread,
  ForumCategory,
  Stats,
  User,
  Notification,
  PaginatedResponse,
  Framework,
  AssetCategory,
} from "./types"

const API_BASE = "/api"

// Generic fetch wrapper with error handling
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }))
    throw new Error(error.error || error.message || "Request failed")
  }

  return response.json()
}

// Assets API
export const assetsAPI = {
  getAll: (params?: {
    category?: AssetCategory
    framework?: Framework | "all"
    price?: "free" | "premium" | "all"
    search?: string
    page?: number
    pageSize?: number
    sort?: "downloads" | "rating" | "createdAt"
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.category) searchParams.set("category", params.category)
    if (params?.framework && params.framework !== "all") searchParams.set("framework", params.framework)
    if (params?.price && params.price !== "all") searchParams.set("price", params.price)
    if (params?.search) searchParams.set("search", params.search)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.pageSize) searchParams.set("pageSize", params.pageSize.toString())
    if (params?.sort) searchParams.set("sort", params.sort)
    return fetchAPI<PaginatedResponse<Asset>>(`/assets?${searchParams}`)
  },

  getById: (id: string) => fetchAPI<Asset>(`/assets/${id}`),

  getTrending: () => fetchAPI<Asset[]>(`/assets/trending`),

  getRecent: () => fetchAPI<Asset[]>(`/assets/recent`),

  download: (id: string) => fetchAPI<{ url: string; expiresAt: number }>(`/assets/${id}/download`, { method: "POST" }),
}

// Forum API
export const forumAPI = {
  getCategories: () => fetchAPI<ForumCategory[]>(`/forum/categories`),

  getThreads: (params?: {
    categoryId?: string
    page?: number
    pageSize?: number
    pinned?: boolean
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.categoryId) searchParams.set("categoryId", params.categoryId)
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.pageSize) searchParams.set("pageSize", params.pageSize.toString())
    if (params?.pinned !== undefined) searchParams.set("pinned", params.pinned.toString())
    return fetchAPI<PaginatedResponse<ForumThread>>(`/forum/threads?${searchParams}`)
  },

  getThread: (id: string) => fetchAPI<ForumThread>(`/forum/threads/${id}`),

  createThread: (data: { title: string; content: string; categoryId: string }) =>
    fetchAPI<ForumThread>(`/forum/threads`, { method: "POST", body: JSON.stringify(data) }),

  replyToThread: (threadId: string, content: string) =>
    fetchAPI<{ id: string }>(`/forum/threads/${threadId}/replies`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
}

// Stats API
export const statsAPI = {
  get: () => fetchAPI<Stats>(`/stats`),
  getLive: () => fetchAPI<{ onlineUsers: number; recentActivity: number }>(`/stats/live`),
}

// Users API
export const usersAPI = {
  getProfile: (id: string) => fetchAPI<User>(`/users/${id}`),
  updateProfile: (data: Partial<User>) => fetchAPI<User>(`/users/me`, { method: "PATCH", body: JSON.stringify(data) }),
  getNotifications: () => fetchAPI<Notification[]>(`/users/me/notifications`),
  markNotificationRead: (id: string) => fetchAPI<void>(`/users/me/notifications/${id}/read`, { method: "POST" }),
}

// Admin API
export const adminAPI = {
  getUsers: (params?: { page?: number; search?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set("page", params.page.toString())
    if (params?.search) searchParams.set("search", params.search)
    return fetchAPI<PaginatedResponse<User>>(`/admin/users?${searchParams}`)
  },

  updateUser: (id: string, data: Partial<User>) =>
    fetchAPI<User>(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  banUser: (id: string, reason: string) =>
    fetchAPI<void>(`/admin/users/${id}/ban`, { method: "POST", body: JSON.stringify({ reason }) }),

  deleteAsset: (id: string) => fetchAPI<void>(`/admin/assets/${id}`, { method: "DELETE" }),

  getReports: () => fetchAPI<any[]>(`/admin/reports`),

  resolveReport: (id: string, action: "dismiss" | "action") =>
    fetchAPI<void>(`/admin/reports/${id}`, { method: "POST", body: JSON.stringify({ action }) }),
}
