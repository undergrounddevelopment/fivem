// Thread Types - Labels for forum threads matching reference design
export interface ThreadType {
  id: string
  name: string
  color: string
  bgColor: string
  icon: string
}

export const THREAD_TYPES: Record<string, ThreadType> = {
  paid: {
    id: "paid",
    name: "Paid",
    color: "#ef4444",
    bgColor: "#ef444420",
    icon: "💰"
  },
  free: {
    id: "free", 
    name: "Free",
    color: "#22c55e",
    bgColor: "#22c55e20",
    icon: "🆓"
  },
  script: {
    id: "script",
    name: "Script",
    color: "#8b5cf6",
    bgColor: "#8b5cf620",
    icon: "📜"
  },
  graphic_pack: {
    id: "graphic_pack",
    name: "Graphic Pack",
    color: "#f59e0b",
    bgColor: "#f59e0b20",
    icon: "🎨"
  },
  mlo: {
    id: "mlo",
    name: "MLO/YMAP",
    color: "#3b82f6",
    bgColor: "#3b82f620",
    icon: "🗺️"
  },
  vehicle: {
    id: "vehicle",
    name: "Vehicle",
    color: "#06b6d4",
    bgColor: "#06b6d420",
    icon: "🚗"
  },
  eup: {
    id: "eup",
    name: "EUP/Clothing",
    color: "#ec4899",
    bgColor: "#ec489920",
    icon: "👕"
  },
  inventory: {
    id: "inventory",
    name: "Inventory",
    color: "#84cc16",
    bgColor: "#84cc1620",
    icon: "📦"
  },
  loadingscreen: {
    id: "loadingscreen",
    name: "LoadingScreen",
    color: "#14b8a6",
    bgColor: "#14b8a620",
    icon: "⏳"
  },
  server_files: {
    id: "server_files",
    name: "Server Files",
    color: "#6366f1",
    bgColor: "#6366f120",
    icon: "🖥️"
  },
  keymaster: {
    id: "keymaster",
    name: "Keymaster",
    color: "#f97316",
    bgColor: "#f9731620",
    icon: "🔑"
  },
  leaks: {
    id: "leaks",
    name: "Leaks",
    color: "#dc2626",
    bgColor: "#dc262620",
    icon: "💧"
  },
  discussion: {
    id: "discussion",
    name: "Discussion",
    color: "#64748b",
    bgColor: "#64748b20",
    icon: "💬"
  }
}

// Forum filter options
export interface ForumFilter {
  id: string
  label: string
  icon: string
  sortBy: string
  sortOrder: "asc" | "desc"
}

export const FORUM_FILTERS: ForumFilter[] = [
  { id: "new_messages", label: "New messages", icon: "📬", sortBy: "updated_at", sortOrder: "desc" },
  { id: "new_topics", label: "New topics", icon: "✨", sortBy: "created_at", sortOrder: "desc" },
  { id: "most_messages", label: "Most messages", icon: "💬", sortBy: "replies_count", sortOrder: "desc" },
  { id: "most_reacted", label: "Most reacted to", icon: "❤️", sortBy: "likes", sortOrder: "desc" },
  { id: "most_viewed", label: "Most viewed", icon: "👁️", sortBy: "views", sortOrder: "desc" },
]

// Category color mapping for inline display
export const CATEGORY_COLORS: Record<string, { color: string; bgColor: string }> = {
  fivem: { color: "#f97316", bgColor: "#f9731620" },
  gta5_mods: { color: "#eab308", bgColor: "#eab30820" },
  ragemp: { color: "#a855f7", bgColor: "#a855f720" },
  scripts: { color: "#22c55e", bgColor: "#22c55e20" },
  mlo: { color: "#3b82f6", bgColor: "#3b82f620" },
  vehicles: { color: "#06b6d4", bgColor: "#06b6d420" },
  clothing: { color: "#ec4899", bgColor: "#ec489920" },
  announcements: { color: "#ef4444", bgColor: "#ef444420" },
  general: { color: "#64748b", bgColor: "#64748b20" },
  help: { color: "#f59e0b", bgColor: "#f59e0b20" },
  requests: { color: "#8b5cf6", bgColor: "#8b5cf620" },
  showcase: { color: "#10b981", bgColor: "#10b98120" },
  marketplace: { color: "#f43f5e", bgColor: "#f43f5e20" },
}

// Helper to get thread type by ID
export function getThreadType(typeId: string | null | undefined): ThreadType {
  if (!typeId) return THREAD_TYPES.discussion
  return THREAD_TYPES[typeId] || THREAD_TYPES.discussion
}

// Helper to get category color
export function getCategoryColor(categoryId: string): { color: string; bgColor: string } {
  return CATEGORY_COLORS[categoryId] || CATEGORY_COLORS.general
}
