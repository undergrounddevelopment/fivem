"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Star, 
  Check, 
  X, 
  Loader2,
  MessageSquare,
  User,
  Image as ImageIcon
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Testimonial {
  id: string
  username: string
  avatar?: string
  content: string
  rating: number
  server_name?: string
  upvotes_received: number
  is_featured: boolean
  is_verified: boolean
  badge?: string
  image_url?: string
  created_at: string
}

export default function TestimonialsAdminPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    username: "",
    avatar: "",
    content: "",
    rating: 5,
    server_name: "",
    upvotes_received: 0,
    is_featured: true,
    is_verified: false,
    badge: "",
    image_url: "",
  })

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/testimonials")
      if (res.ok) {
        const data = await res.json()
        setTestimonials(data)
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      username: "",
      avatar: "",
      content: "",
      rating: 5,
      server_name: "",
      upvotes_received: 0,
      is_featured: true,
      is_verified: false,
      badge: "",
      image_url: "",
    })
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const method = editingId ? "PUT" : "POST"
      const body = editingId ? { ...formData, id: editingId } : formData

      const res = await fetch("/api/testimonials", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        await fetchTestimonials()
        resetForm()
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error("Error saving testimonial:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (testimonial: Testimonial) => {
    setFormData({
      username: testimonial.username,
      avatar: testimonial.avatar || "",
      content: testimonial.content,
      rating: testimonial.rating,
      server_name: testimonial.server_name || "",
      upvotes_received: testimonial.upvotes_received,
      is_featured: testimonial.is_featured,
      is_verified: testimonial.is_verified,
      badge: testimonial.badge || "",
      image_url: testimonial.image_url || "",
    })
    setEditingId(testimonial.id)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return

    try {
      const res = await fetch(`/api/testimonials?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        await fetchTestimonials()
      }
    } catch (error) {
      console.error("Error deleting testimonial:", error)
    }
  }

  const toggleFeatured = async (testimonial: Testimonial) => {
    try {
      await fetch("/api/testimonials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: testimonial.id,
          is_featured: !testimonial.is_featured,
        }),
      })
      await fetchTestimonials()
    } catch (error) {
      console.error("Error toggling featured:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Testimonials Management</h1>
          <p className="text-muted-foreground">Manage customer testimonials and reviews</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Testimonial" : "Add New Testimonial"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Enter username"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input
                    id="avatar"
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Testimonial Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter testimonial content..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="server_name">Server Name</Label>
                  <Input
                    id="server_name"
                    value={formData.server_name}
                    onChange={(e) => setFormData({ ...formData, server_name: e.target.value })}
                    placeholder="Server name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="badge">Badge</Label>
                  <Input
                    id="badge"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g., VIP, Premium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating (1-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min={1}
                    max={5}
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) || 5 })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="upvotes">Upvotes</Label>
                  <Input
                    id="upvotes"
                    type="number"
                    min={0}
                    value={formData.upvotes_received}
                    onChange={(e) => setFormData({ ...formData, upvotes_received: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label htmlFor="is_featured">Featured</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_verified"
                    checked={formData.is_verified}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_verified: checked })}
                  />
                  <Label htmlFor="is_verified">Verified</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => {
                  resetForm()
                  setIsDialogOpen(false)
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingId ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testimonials.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Featured</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {testimonials.filter(t => t.is_featured).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {testimonials.filter(t => t.is_verified).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {testimonials.length > 0 
                ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
                : "0"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Testimonials List */}
      <div className="grid gap-4">
        {testimonials.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No testimonials yet</p>
              <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Testimonial
              </Button>
            </CardContent>
          </Card>
        ) : (
          testimonials.map((testimonial) => (
            <Card key={testimonial.id} className={testimonial.is_featured ? "border-yellow-500/50" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {testimonial.avatar ? (
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{testimonial.username}</span>
                        {testimonial.is_verified && (
                          <Badge variant="secondary" className="bg-green-500/20 text-green-500">
                            <Check className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {testimonial.badge && (
                          <Badge variant="outline">{testimonial.badge}</Badge>
                        )}
                        {testimonial.server_name && (
                          <span className="text-sm text-muted-foreground">
                            from {testimonial.server_name}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 my-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < testimonial.rating 
                                ? "text-yellow-500 fill-yellow-500" 
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                        <span className="text-sm text-muted-foreground ml-2">
                          {testimonial.upvotes_received} upvotes
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                        {testimonial.content}
                      </p>
                      
                      {testimonial.image_url && (
                        <div className="mt-2">
                          <img 
                            src={testimonial.image_url} 
                            alt="Testimonial"
                            className="max-h-32 rounded-lg object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFeatured(testimonial)}
                      title={testimonial.is_featured ? "Remove from featured" : "Add to featured"}
                    >
                      <Star className={`h-4 w-4 ${testimonial.is_featured ? "text-yellow-500 fill-yellow-500" : ""}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(testimonial)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(testimonial.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
