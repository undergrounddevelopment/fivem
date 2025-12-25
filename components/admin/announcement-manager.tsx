"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  Megaphone,
  Loader2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Sparkles,
  LinkIcon,
  X,
} from "lucide-react"

interface Announcement {
  id: string
  title: string | null
  message: string
  type: string
  is_active: boolean
  is_dismissible: boolean
  sort_order: number
  link: string | null
  start_date: string | null
  end_date: string | null
  created_at: string
}

const ANNOUNCEMENT_TYPES = [
  { value: "info", label: "Info", icon: Info, color: "text-blue-500" },
  { value: "success", label: "Success", icon: CheckCircle, color: "text-green-500" },
  { value: "warning", label: "Warning", icon: AlertTriangle, color: "text-yellow-500" },
  { value: "error", label: "Error", icon: AlertTriangle, color: "text-red-500" },
  { value: "promo", label: "Promo", icon: Sparkles, color: "text-cyan-500" },
]

interface AnnouncementManagerProps {
  onUpdate?: () => void
}

export function AnnouncementManager({ onUpdate }: AnnouncementManagerProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    is_dismissible: true,
    sort_order: 0,
    link: "",
    start_date: "",
    end_date: "",
  })

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/announcements")
      const data = await res.json()
      setAnnouncements(data.announcements || [])
    } catch (error) {
      console.error("Failed to fetch announcements:", error)
      toast.error("Failed to load announcements")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnnouncements()
    const interval = setInterval(fetchAnnouncements, 10000)
    return () => clearInterval(interval)
  }, [fetchAnnouncements])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.message.trim()) {
      toast.error("Message is required")
      return
    }

    setSaving(true)

    try {
      const method = editing ? "PUT" : "POST"
      const body = editing ? { id: editing.id, ...formData } : formData

      const res = await fetch("/api/admin/announcements", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to save announcement")
      }

      toast.success(editing ? "Announcement updated!" : "Announcement created!")
      fetchAnnouncements()
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
    if (!confirm("Are you sure you want to delete this announcement?")) return

    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Announcement deleted!")
        fetchAnnouncements()
        onUpdate?.()
      } else {
        toast.error("Failed to delete announcement")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const toggleActive = async (announcement: Announcement) => {
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: announcement.id, is_active: !announcement.is_active }),
      })

      if (res.ok) {
        toast.success(`Announcement ${announcement.is_active ? "disabled" : "enabled"}!`)
        fetchAnnouncements()
        onUpdate?.()
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      type: "info",
      is_dismissible: true,
      sort_order: 0,
      link: "",
      start_date: "",
      end_date: "",
    })
    setEditing(null)
  }

  const openEditDialog = (announcement: Announcement) => {
    setEditing(announcement)
    setFormData({
      title: announcement.title || "",
      message: announcement.message,
      type: announcement.type,
      is_dismissible: announcement.is_dismissible,
      sort_order: announcement.sort_order,
      link: announcement.link || "",
      start_date: announcement.start_date || "",
      end_date: announcement.end_date || "",
    })
    setIsDialogOpen(true)
  }

  const getTypeInfo = (type: string) => {
    return ANNOUNCEMENT_TYPES.find((t) => t.value === type) || ANNOUNCEMENT_TYPES[0]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Announcement Management</h2>
          <p className="text-muted-foreground text-sm mt-1">Create and manage site-wide announcements</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchAnnouncements}>
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
            Add Announcement
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{announcements.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-500">{announcements.filter((a) => a.is_active).length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Dismissible</p>
            <p className="text-2xl font-bold">{announcements.filter((a) => a.is_dismissible).length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Promo</p>
            <p className="text-2xl font-bold text-cyan-500">{announcements.filter((a) => a.type === "promo").length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Announcements List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : announcements.length === 0 ? (
        <Card className="bg-card/50 border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No announcements yet</p>
            <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
              Create Your First Announcement
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((announcement) => {
            const typeInfo = getTypeInfo(announcement.type)
            const TypeIcon = typeInfo.icon

            return (
              <Card key={announcement.id} className="bg-card/50 border-border overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg bg-secondary/50 ${typeInfo.color}`}>
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {announcement.title && <span className="font-semibold">{announcement.title}</span>}
                        <Badge variant="outline" className="text-xs">
                          {typeInfo.label}
                        </Badge>
                        {!announcement.is_active && (
                          <Badge variant="secondary" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                        {announcement.is_dismissible && <X className="h-3 w-3 text-muted-foreground" />}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{announcement.message}</p>
                      {announcement.link && (
                        <p className="text-xs text-primary flex items-center gap-1 mt-1">
                          <LinkIcon className="h-3 w-3" />
                          {announcement.link}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch checked={announcement.is_active} onCheckedChange={() => toggleActive(announcement)} />
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(announcement)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(announcement.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
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
            <DialogTitle>{editing ? "Edit Announcement" : "Create Announcement"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Title (Optional)</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Announcement title"
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <Label>Message *</Label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Enter your announcement message..."
                className="bg-background border-border min-h-[100px]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {ANNOUNCEMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="flex items-center gap-2">
                          <type.icon className={`h-4 w-4 ${type.color}`} />
                          {type.label}
                        </span>
                      </SelectItem>
                    ))}
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

            <div className="space-y-2">
              <Label>Link URL (Optional)</Label>
              <Input
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://example.com"
                className="bg-background border-border"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_dismissible}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_dismissible: checked })}
                />
                <Label className="cursor-pointer">Allow users to dismiss</Label>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !formData.message.trim()}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editing ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
