"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import {
  Package,
  Search,
  Edit3,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Loader2,
  Save,
  RefreshCw,
  AlertTriangle,
  ImageIcon,
  LinkIcon,
  Tag,
  DollarSign,
  Smile,
  FileText,
  Sparkles,
  ListChecks,
  Settings,
  History,
  ExternalLink,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Asset {
  id: string
  title: string
  description: string
  category: string
  framework: string
  thumbnail: string | null
  downloads: number
  coin_price: number
  status: string
  author_id: string
  author: { username: string; avatar: string } | null
  tags: string[]
  created_at: string
  download_link: string | null
  features?: string
  installation?: string
  changelog?: string
  version?: string
}

// Popular emojis for quick insert
const POPULAR_EMOJIS = [
  "🔥",
  "✅",
  "⭐",
  "💎",
  "🎮",
  "🚗",
  "🏠",
  "👕",
  "💰",
  "🎯",
  "🚀",
  "💪",
  "👍",
  "❤️",
  "🎉",
  "✨",
  "⚡",
  "🔧",
  "📦",
  "🛠️",
  "🎨",
  "📱",
  "💻",
  "🌟",
  "🔒",
  "⚙️",
  "📋",
  "🏆",
  "💡",
  "🔔",
]

export default function AdminAssetsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoadingAssets, setIsLoadingAssets] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  // Edit modal state
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [editForm, setEditForm] = useState<Partial<Asset>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<"basic" | "description" | "features" | "installation" | "changelog">(
    "basic",
  )
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const hasFetched = useRef(false)

  const fetchAssets = useCallback(async () => {
    setIsLoadingAssets(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/assets")
      if (!res.ok) throw new Error("Failed to fetch assets")
      const data = await res.json()

      // Normalize data
      const normalizedAssets = (data.assets || []).map((asset: any) => ({
        ...asset,
        tags: asset.tags || [],
        thumbnail: asset.thumbnail || null,
        author: asset.author || { username: "Unknown", avatar: "" },
        downloads: asset.downloads || 0,
        coin_price: asset.coin_price || 0,
        status: asset.status || "pending",
        features: asset.features || "",
        installation: asset.installation || "",
        changelog: asset.changelog || "",
        version: asset.version || "1.0.0",
      }))

      setAssets(normalizedAssets)
    } catch (err: any) {
      setError(err.message)
      setAssets([])
    } finally {
      setIsLoadingAssets(false)
    }
  }, [])

  useEffect(() => {
    if (!isLoading && !user?.isAdmin) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user?.isAdmin && !hasFetched.current) {
      hasFetched.current = true
      fetchAssets()
    }
  }, [user?.isAdmin, fetchAssets])

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset)
    setEditForm({
      title: asset.title,
      description: asset.description,
      category: asset.category,
      framework: asset.framework,
      coin_price: asset.coin_price,
      status: asset.status,
      thumbnail: asset.thumbnail || "",
      download_link: asset.download_link || "",
      tags: asset.tags || [],
      features: asset.features || "",
      installation: asset.installation || "",
      changelog: asset.changelog || "",
      version: asset.version || "1.0.0",
    })
    setActiveTab("basic")
  }

  const handleSaveEdit = async () => {
    if (!editingAsset) return

    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/assets/${editingAsset.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })

      if (!res.ok) throw new Error("Failed to update asset")

      setEditingAsset(null)
      fetchAssets()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAsset = async (assetId: string) => {
    if (!confirm("Are you sure you want to delete this asset?")) return

    try {
      const res = await fetch(`/api/admin/assets/${assetId}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete asset")

      fetchAssets()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleStatusChange = async (assetId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/assets/${assetId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error("Failed to update status")

      fetchAssets()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const insertEmoji = (emoji: string) => {
    const field = activeTab === "basic" ? "description" : activeTab
    if (field === "basic") {
      setEditForm((prev) => ({
        ...prev,
        description: (prev.description || "") + emoji,
      }))
    } else {
      setEditForm((prev) => ({
        ...prev,
        [field]: (prev[field as keyof typeof prev] || "") + emoji,
      }))
    }
    setShowEmojiPicker(false)
  }

  // Filter assets
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || asset.status === statusFilter
    const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-success/20 text-success border-success/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-warning/20 text-warning border-warning/30">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-destructive/20 text-destructive border-destructive/30">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return <Badge className="bg-secondary">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!user?.isAdmin) return null

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="md:ml-72 transition-all duration-300">
        <Header />
        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Package className="h-6 w-6 text-primary" />
                Asset Management
              </h1>
              <p className="text-muted-foreground">Manage and moderate all uploaded assets</p>
            </div>
            <Button onClick={fetchAssets} variant="outline" className="gap-2 bg-transparent">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="glass rounded-xl p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-secondary/50"
                />
              </div>
              <select
                className="h-10 px-3 rounded-md border bg-secondary/50"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                className="h-10 px-3 rounded-md border bg-secondary/50"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="scripts">Scripts</option>
                <option value="mlo">MLO</option>
                <option value="vehicles">Vehicles</option>
                <option value="clothing">Clothing</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="glass rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{assets.length}</p>
              <p className="text-sm text-muted-foreground">Total Assets</p>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-success">{assets.filter((a) => a.status === "active").length}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-warning">{assets.filter((a) => a.status === "pending").length}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-destructive">
                {assets.filter((a) => a.status === "rejected").length}
              </p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </div>

          {/* Assets Table */}
          <div className="glass rounded-xl overflow-hidden">
            {isLoadingAssets ? (
              <div className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground mt-2">Loading assets...</p>
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground mt-2">No assets found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Asset</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Author</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Stats</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredAssets.map((asset) => (
                      <tr key={asset.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-16 rounded-lg overflow-hidden bg-secondary/50 shrink-0">
                              {asset.thumbnail ? (
                                <Image
                                  src={asset.thumbnail || "/placeholder.svg"}
                                  alt={asset.title}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground line-clamp-1">{asset.title}</p>
                              <p className="text-xs text-muted-foreground">v{asset.version || "1.0.0"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="capitalize">
                            {asset.category}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="relative h-6 w-6 rounded-full overflow-hidden bg-secondary">
                              {asset.author?.avatar ? (
                                <Image
                                  src={asset.author.avatar || "/placeholder.svg"}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              ) : (
                                <div className="h-full w-full bg-primary/20" />
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">{asset.author?.username || "Unknown"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(asset.status)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Download className="h-3 w-3" />
                              {asset.downloads}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {asset.coin_price}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/asset/${asset.id}`} target="_blank">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditAsset(asset)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            {asset.status === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-success hover:text-success"
                                  onClick={() => handleStatusChange(asset.id, "active")}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  onClick={() => handleStatusChange(asset.id, "rejected")}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteAsset(asset.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Edit Modal */}
          {editingAsset && (
            <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="glass rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Modal Header */}
                <div className="p-4 border-b border-border/50 flex items-center justify-between shrink-0">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Edit3 className="h-5 w-5 text-primary" />
                    Edit Asset
                  </h2>
                  <div className="relative">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <Smile className="h-4 w-4" />
                      Emoji
                    </Button>
                    {showEmojiPicker && (
                      <div className="absolute right-0 top-full mt-2 p-3 bg-background border border-border rounded-xl shadow-lg z-50 w-72">
                        <div className="grid grid-cols-10 gap-1">
                          {POPULAR_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              className="p-1.5 hover:bg-secondary rounded-lg text-lg"
                              onClick={() => insertEmoji(emoji)}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border/50 shrink-0">
                  {[
                    { id: "basic", label: "Basic Info", icon: Settings },
                    { id: "description", label: "Description", icon: FileText },
                    { id: "features", label: "Features", icon: ListChecks },
                    { id: "installation", label: "Installation", icon: Sparkles },
                    { id: "changelog", label: "Changelog", icon: History },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? "text-primary border-b-2 border-primary bg-primary/5"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto flex-1">
                  {activeTab === "basic" && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Title</label>
                        <Input
                          value={editForm.title || ""}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Version</label>
                        <Input
                          value={editForm.version || "1.0.0"}
                          onChange={(e) => setEditForm({ ...editForm, version: e.target.value })}
                          placeholder="1.0.0"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-muted-foreground mb-1 block">Category</label>
                          <select
                            className="w-full h-10 px-3 rounded-md border bg-background"
                            value={editForm.category || "scripts"}
                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          >
                            <option value="scripts">Scripts</option>
                            <option value="mlo">MLO</option>
                            <option value="vehicles">Vehicles</option>
                            <option value="clothing">Clothing</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground mb-1 block">Framework</label>
                          <select
                            className="w-full h-10 px-3 rounded-md border bg-background"
                            value={editForm.framework || "standalone"}
                            onChange={(e) => setEditForm({ ...editForm, framework: e.target.value })}
                          >
                            <option value="standalone">Standalone</option>
                            <option value="esx">ESX</option>
                            <option value="qbcore">QBCore</option>
                            <option value="vrp">vRP</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-muted-foreground mb-1 block">Price (Coins)</label>
                          <Input
                            type="number"
                            value={editForm.coin_price || 0}
                            onChange={(e) =>
                              setEditForm({ ...editForm, coin_price: Number.parseInt(e.target.value) || 0 })
                            }
                            min={0}
                          />
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground mb-1 block">Status</label>
                          <select
                            className="w-full h-10 px-3 rounded-md border bg-background"
                            value={editForm.status || "pending"}
                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          >
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" />
                          Thumbnail URL
                        </label>
                        <Input
                          value={editForm.thumbnail || ""}
                          onChange={(e) => setEditForm({ ...editForm, thumbnail: e.target.value })}
                          placeholder="https://..."
                        />
                        {editForm.thumbnail && (
                          <div className="mt-2 relative w-40 h-24 rounded-lg overflow-hidden">
                            <Image
                              src={editForm.thumbnail || "/placeholder.svg"}
                              alt="Preview"
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block flex items-center gap-2">
                          <LinkIcon className="h-4 w-4" />
                          Download Link
                        </label>
                        <Input
                          value={editForm.download_link || ""}
                          onChange={(e) => setEditForm({ ...editForm, download_link: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>

                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          Tags (comma separated)
                        </label>
                        <Input
                          value={(editForm.tags || []).join(", ")}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              tags: e.target.value
                                .split(",")
                                .map((t) => t.trim())
                                .filter(Boolean),
                            })
                          }
                          placeholder="esx, qbcore, free, premium"
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === "description" && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Main description of the asset. Supports emoji and markdown formatting.
                      </p>
                      <Textarea
                        value={editForm.description || ""}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        rows={12}
                        className="font-mono text-sm"
                        placeholder="🔥 **Amazing Script**&#10;&#10;This script provides...&#10;&#10;## Features&#10;- Feature 1&#10;- Feature 2"
                      />
                    </div>
                  )}

                  {activeTab === "features" && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        List the key features of this asset. Use bullet points for better readability.
                      </p>
                      <Textarea
                        value={editForm.features || ""}
                        onChange={(e) => setEditForm({ ...editForm, features: e.target.value })}
                        rows={12}
                        className="font-mono text-sm"
                        placeholder="✅ Feature 1 - Description&#10;✅ Feature 2 - Description&#10;✅ Feature 3 - Description"
                      />
                    </div>
                  )}

                  {activeTab === "installation" && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Installation instructions. Use code blocks for commands.
                      </p>
                      <Textarea
                        value={editForm.installation || ""}
                        onChange={(e) => setEditForm({ ...editForm, installation: e.target.value })}
                        rows={12}
                        className="font-mono text-sm"
                        placeholder="## Installation&#10;&#10;1. Download the resource&#10;2. Extract to your resources folder&#10;3. Add to server.cfg:&#10;&#10;\`\`\`cfg&#10;ensure my-script&#10;\`\`\`"
                      />
                    </div>
                  )}

                  {activeTab === "changelog" && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Version history and changes.</p>
                      <Textarea
                        value={editForm.changelog || ""}
                        onChange={(e) => setEditForm({ ...editForm, changelog: e.target.value })}
                        rows={12}
                        className="font-mono text-sm"
                        placeholder="## v1.0.0 (Initial Release)&#10;- Initial release&#10;- Added basic features&#10;&#10;## v1.1.0&#10;- Bug fixes&#10;- New feature X"
                      />
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-border/50 flex gap-2 shrink-0">
                  <Button onClick={handleSaveEdit} disabled={isSaving} className="gap-2">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setEditingAsset(null)}>
                    Cancel
                  </Button>
                  <div className="flex-1" />
                  <Link href={`/asset/${editingAsset.id}`} target="_blank">
                    <Button variant="ghost" className="gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Preview
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
