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
import { toast } from "sonner"
import { Plus, Pencil, Trash2, MessageSquare, Loader2, RefreshCw, GripVertical, Palette } from "lucide-react"

interface ForumCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
  sort_order: number
  is_active: boolean
  thread_count?: number
}

const ICON_OPTIONS = [
  "megaphone",
  "message-circle",
  "help-circle",
  "code",
  "star",
  "shopping-bag",
  "users",
  "heart",
  "zap",
  "shield",
  "book",
  "coffee",
]

const COLOR_OPTIONS = [
  "#EF4444",
  "#F59E0B",
  "#22C55E",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#6366F1",
  "#14B8A6",
  "#A855F7",
]

interface ForumSettingsManagerProps {
  onUpdate?: () => void
}

export function ForumSettingsManager({ onUpdate }: ForumSettingsManagerProps) {
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ForumCategory | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "message-circle",
    color: "#3B82F6",
    sort_order: 0,
    is_active: true,
  })

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/forum/settings")
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error("Failed to fetch categories:", error)
      toast.error("Failed to load categories")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error("Category name is required")
      return
    }

    setSaving(true)

    try {
      const method = editing ? "PUT" : "POST"
      const body = editing ? { type: "category", id: editing.id, ...formData } : formData

      const res = await fetch("/api/admin/forum/settings", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to save category")
      }

      toast.success(editing ? "Category updated!" : "Category created!")
      fetchCategories()
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
    if (!confirm("Are you sure you want to delete this category? This cannot be undone if there are no threads."))
      return

    try {
      const res = await fetch(`/api/admin/forum/settings?id=${id}`, { method: "DELETE" })
      const data = await res.json()

      if (res.ok) {
        toast.success("Category deleted!")
        fetchCategories()
        onUpdate?.()
      } else {
        toast.error(data.error || "Failed to delete category")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const toggleActive = async (category: ForumCategory) => {
    try {
      const res = await fetch("/api/admin/forum/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "category",
          id: category.id,
          is_active: !category.is_active,
        }),
      })

      if (res.ok) {
        toast.success(`Category ${category.is_active ? "disabled" : "enabled"}!`)
        fetchCategories()
        onUpdate?.()
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      icon: "message-circle",
      color: "#3B82F6",
      sort_order: 0,
      is_active: true,
    })
    setEditing(null)
  }

  const openEditDialog = (category: ForumCategory) => {
    setEditing(category)
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      sort_order: category.sort_order,
      is_active: category.is_active,
    })
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Forum Settings</h2>
          <p className="text-muted-foreground text-sm mt-1">Manage forum categories and appearance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchCategories}>
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
            Add Category
          </Button>
        </div>
      </div>

      {/* Categories List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : categories.length === 0 ? (
        <Card className="bg-card/50 border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No categories yet</p>
            <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
              Create Your First Category
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {categories
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((category) => (
              <Card key={category.id} className="bg-card/50 border-border overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <MessageSquare className="h-5 w-5" style={{ color: category.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{category.name}</span>
                        <Badge variant="outline" style={{ borderColor: category.color, color: category.color }}>
                          {category.icon}
                        </Badge>
                        {!category.is_active && <Badge variant="secondary">Inactive</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{category.description}</p>
                    </div>
                    <div className="text-center px-4">
                      <p className="text-xl font-bold">{category.thread_count || 0}</p>
                      <p className="text-xs text-muted-foreground">threads</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch checked={category.is_active} onCheckedChange={() => toggleActive(category)} />
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(category)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Category" : "Create Category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Category name"
                className="bg-background border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this category..."
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((icon) => (
                  <Button
                    key={icon}
                    type="button"
                    variant={formData.icon === icon ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData({ ...formData, icon })}
                  >
                    {icon}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Color
              </Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-lg border-2 transition-transform ${
                      formData.color === color ? "border-white scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: Number.parseInt(e.target.value) || 0 })}
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center gap-2 h-10">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <span className="text-sm">{formData.is_active ? "Active" : "Inactive"}</span>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>Preview</Label>
              <div
                className="flex items-center gap-4 p-4 rounded-lg"
                style={{ backgroundColor: `${formData.color}10` }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${formData.color}20` }}
                >
                  <MessageSquare className="h-5 w-5" style={{ color: formData.color }} />
                </div>
                <div>
                  <p className="font-semibold">{formData.name || "Category Name"}</p>
                  <p className="text-sm text-muted-foreground">{formData.description || "Category description"}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !formData.name.trim()}>
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
