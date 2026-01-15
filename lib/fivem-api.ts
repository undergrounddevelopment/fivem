const API_BASE = "/api"

export interface FiveMAsset {
  id: string
  title: string
  description: string
  thumbnail: string
  category: string
  framework: string
  rating: number
  downloads: number
}

export interface FiveMThread {
  id: string
  title: string
  content: string
  author_id: string
  created_at: string
  views: number
  likes: number
  replies_count: number
  author?: {
    discord_id: string
    username: string
    avatar: string
  }
}

export interface FiveMUser {
  id: string
  discord_id: string
  username: string
  avatar: string
  membership: string
  reputation: number
}

export interface SearchResults {
  results: {
    assets: FiveMAsset[]
    threads: FiveMThread[]
    users: FiveMUser[]
  }
  total: number
  query: string
}

export async function searchFiveMTools(query: string): Promise<SearchResults> {
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`)
  if (!res.ok) throw new Error("Search failed")
  return res.json()
}

export async function getAssets(category?: string, framework?: string) {
  const params = new URLSearchParams()
  if (category) params.set("category", category)
  if (framework) params.set("framework", framework)
  
  const res = await fetch(`${API_BASE}/assets?${params}`)
  if (!res.ok) throw new Error("Failed to fetch assets")
  return res.json()
}
