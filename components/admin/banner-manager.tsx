"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import {
  Plus,
  Pencil,
  Trash2,
  ImageIcon,
  LinkIcon,
  Eye,
  EyeOff,
  Upload,
  Loader2,
  RefreshCw,
  Calendar,
} from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface Banner {
  id: string
  title: string
  image_url: string
  link: string
  position: string
  is_active: boolean
  sort_order: number
  start_date: string | null
  end_date: string | null
  created_at: string
}

interface BannerManagerProps {
  onUpdate?: () => void
}

export function BannerManager({ onUpdate }: BannerManagerProps) {
  const [banners, setBanners] = useState<Banner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    image_url: "",
    link: "",
    position: "top",
    sort_order: 0,
    start_date: "",
    end_date: "",
  })

  const fetchBanners = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/banners")
      const data = await res.json()
      setBanners(data.banners || [])
    } catch (error) {
      console.error("Failed to fetch banners:", error)
      toast.error("Failed to load banners")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBanners()
    const supabase = getSupabaseBrowserClient()
    let channel: RealtimeChannel | null = null

    if (supabase) {
      try {
        channel = supabase
          .channel("admin-banners")
          .on("postgres_changes", { event: "*", schema: "public", table: "banners" }, () => {
            fetchBanners()
          })
          .subscribe()
      } catch (error) {
        console.error("Failed to subscribe to banners (admin):", error)
      }
    }

    // Fallback polling
    const interval = setInterval(fetchBanners, 30000)
    return () => {
      if (channel && supabase) supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [fetchBanners])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append("file", file)
      formDataUpload.append("type", "banners")
      formDataUpload.append("requireAdmin", "true")

      const res = await fetch("/api/upload/secure", {
        method: "POST",
        body: formDataUpload,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Upload failed")
      }

      const data = await res.json()
      setFormData((prev) => ({ ...prev, image_url: data.url }))
      toast.success("Image uploaded successfully")
    } catch (error: any) {
      toast.error(error.message || "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const method = editingBanner ? "PUT" : "POST"
      const body = editingBanner ? { id: editingBanner.id, ...formData } : formData

      const res = await fetch("/api/admin/banners", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to save banner")
      }

      toast.success(editingBanner ? "Banner updated!" : "Banner created!")
      fetchBanners()
      setIsDialogOpen(false)
      resetForm()
      onUpdate?.()
    } catch (error: any) {
      toast.error(error.message || "An error occurred")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return

    try {
      const res = await fetch(`/api/admin/banners?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Banner deleted!")
        fetchBanners()
        onUpdate?.()
      } else {
        toast.error("Failed to delete banner")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const toggleActive = async (banner: Banner) => {
    try {
      const res = await fetch("/api/admin/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: banner.id, is_active: !banner.is_active }),
      })

      if (res.ok) {
        toast.success(`Banner ${banner.is_active ? "disabled" : "enabled"}!`)
        fetchBanners()
        onUpdate?.()
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      image_url: "",
      link: "",
      position: "top",
      sort_order: 0,
      start_date: "",
      end_date: "",
    })
    setEditingBanner(null)
  }

  const openEditDialog = (banner: Banner) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title || "",
      image_url: banner.image_url,
      link: banner.link || "",
      position: banner.position,
      sort_order: banner.sort_order,
      start_date: banner.start_date || "",
      end_date: banner.end_date || "",
    })
    setIsDialogOpen(true)
  }

  const positionCounts = {
    top: banners.filter((b) => b.position === "top").length,
    sidebar: banners.filter((b) => b.position === "sidebar").length,
    footer: banners.filter((b) => b.position === "footer").length,
    hero: banners.filter((b) => b.position === "hero").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Banner Management</h2>
          <p className="text-muted-foreground text-sm mt-1">Manage promotional banners across the site</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchBanners}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => {
              resetForm()
              setIsDialogOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Banner
          </Button>
        </div>
      </div>

      {/* Position Stats */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(positionCounts).map(([position, count]) => (
          <Card key={position} className="bg-card/50 border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground capitalize">{position}</p>
              <p className="text-2xl font-bold">{count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Banners Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : banners.length === 0 ? (
        <Card className="bg-card/50 border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No banners yet</p>
            <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
              Add Your First Banner
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((banner) => (
            <Card key={banner.id} className="bg-card/50 border-border overflow-hidden group">
              <div className="relative">
                <img
                  src={banner.image_url || "/placeholder.svg"}
                  alt={banner.title || "Banner"}
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = "/celebratory-banner.png"
                  }}
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary" onClick={() => openEditDialog(banner)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="destructive" onClick={() => handleDelete(banner.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute top-2 left-2 flex gap-1">
                  <Badge variant={banner.is_active ? "default" : "secondary"}>{banner.position}</Badge>
                  {!banner.is_active && (
                    <Badge variant="outline" className="bg-black/50">
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{banner.title || "Untitled Banner"}</p>
                    {banner.link && (
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-1">
                        <LinkIcon className="h-3 w-3" />
                        {banner.link}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={banner.is_active} onCheckedChange={() => toggleActive(banner)} />
                    {banner.is_active ? (
                      <Eye className="h-4 w-4 text-green-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingBanner ? "Edit Banner" : "Add New Banner"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Title (Optional)</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Banner title"
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <Label>Image *</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/banner.png"
                  className="bg-background border-border flex-1"
                />
                <Label className="cursor-pointer">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <Button type="button" variant="outline" disabled={uploading} asChild>
                    <span>
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    </span>
                  </Button>
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Link URL (Optional)</Label>
              <Input
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://example.com"
                className="bg-background border-border"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Position</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) => setFormData({ ...formData, position: value })}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="top">Top Banner</SelectItem>
                    <SelectItem value="hero">Hero Section</SelectItem>
                    <SelectItem value="sidebar">Sidebar</SelectItem>
                    <SelectItem value="footer">Footer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: Number.parseInt(e.target.value) || 0 })}
                  className="bg-background border-border"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Start Date (Optional)
                </Label>
                <Input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  End Date (Optional)
                </Label>
                <Input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="bg-background border-border"
                />
              </div>
            </div>

            {formData.image_url && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="rounded-lg overflow-hidden border border-border">
                  <img
                    src={formData.image_url || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = "/generic-banner-preview.png"
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !formData.image_url}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingBanner ? "Update Banner" : "Create Banner"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
