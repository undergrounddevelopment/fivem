"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Plus, Edit, Trash2, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [filter, setFilter] = useState('all')
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    link: '',
    position: 'top',
    sort_order: 0,
    is_active: true
  })

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/admin/banners')
      const data = await res.json()
      setBanners(data.banners || [])
    } catch (error) {
      toast.error("Failed to load")
    } finally {
      setLoading(false)
    }
  }

  const [editingId, setEditingId] = useState<string | null>(null)

  const handleEdit = (banner: any) => {
    setFormData({
      title: banner.title,
      image_url: banner.image_url,
      link: banner.link || '',
      position: banner.position,
      sort_order: banner.sort_order,
      is_active: banner.is_active
    })
    setEditingId(banner.id)
    setShowDialog(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = '/api/admin/banners'
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId ? { id: editingId, ...formData } : formData

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        toast.success(editingId ? "Banner updated" : "Banner created")
        setShowDialog(false)
        setEditingId(null)
        setFormData({ title: '', image_url: '', link: '', position: 'top', sort_order: 0, is_active: true })
        fetchBanners()
      }
    } catch (error) {
      toast.error("Failed to save")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) return
    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success("Banner deleted")
        fetchBanners()
      }
    } catch (error) {
      toast.error("Failed to delete")
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      })
      if (res.ok) {
        fetchBanners()
      }
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  return (
    <div>
      <Link href="/admin" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Admin
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Banners</h1>
          <p className="text-muted-foreground">Manage site banners</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={async () => {
                if(!confirm("Add default hero banners to database?")) return;
                try {
                  const res = await fetch('/api/admin/banners/seed', { method: 'POST' })
                  if(res.ok) {
                      toast.success("Defaults Added")
                      fetchBanners()
                  }
                } catch(e) {
                    toast.error("Failed")
                }
            }}>
                Restore Defaults
            </Button>
            <Dialog open={showDialog} onOpenChange={(open) => {
              setShowDialog(open)
              if (!open) {
                setEditingId(null)
                setFormData({ title: '', image_url: '', link: '', position: 'top', sort_order: 0, is_active: true })
              }
            }}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Banner
                </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Banner' : 'New Banner'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Image</label>
                <div className="flex gap-2">
                  <Input
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="Enter URL or upload image"
                    required
                  />
                  <div className="relative">
                    <Input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer w-10"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return

                        // Check validation
                        if (file.size > 10 * 1024 * 1024) return toast.error("File size must be less than 10MB")

                        try {
                          const uploadData = new FormData()
                          uploadData.append('file', file)

                          const promise = fetch('/api/upload/image', {
                            method: 'POST',
                            body: uploadData
                          }).then(async res => {
                            if (!res.ok) throw new Error('Upload failed')
                            const data = await res.json()
                            setFormData(prev => ({ ...prev, image_url: data.url }))
                            return data
                          })

                          toast.promise(promise, {
                            loading: 'Uploading...',
                            success: 'Image uploaded',
                            error: 'Failed to upload'
                          })
                        } catch (err) {
                          toast.error("Upload failed")
                        }
                      }}
                    />
                    <Button type="button" size="icon" variant="outline">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Link URL</label>
                <Input
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Position</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  >
                    <option value="top">Top Header</option>
                    <option value="hero">Hero Banner</option>
                    <option value="community">Community</option>
                    <option value="sidebar">Sidebar</option>
                    <option value="footer">Footer</option>
                    <option value="popup">Pop-up Modal</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Sort Order</label>
                  <Input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <label className="text-sm">Active</label>
              </div>
              <Button type="submit" className="w-full">{editingId ? 'Update Banner' : 'Create Banner'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      </div>


      <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
        {['all', 'top', 'hero', 'community', 'sidebar', 'footer', 'popup'].map((pos) => (
             <Button
                key={pos}
                variant={formData.position === pos && !showDialog ? "default" : "outline"} // reusing formData state for filter slightly hacky but works for now, better to use separate state
                onClick={() => setFilter(pos)}
                className={`capitalize whitespace-nowrap ${filter === pos ? 'bg-primary text-primary-foreground' : ''}`}
             >
                {pos}
             </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {loading ? (
             <div className="col-span-full text-center py-8">Loading...</div>
          ) : (
             banners
             .filter(b => filter === 'all' || b.position === filter)
             .map((banner) => (
             <div key={banner.id} className="glass rounded-xl overflow-hidden group relative">
                 <div className="relative min-h-[100px] bg-secondary flex items-center justify-center p-2">
                 {/* Use unoptimized img for external/blob urls usually safer in admin */}
                 <img src={banner.image_url} alt={banner.title} className="max-w-full max-h-40 object-contain" />
                 </div>
                 <div className="p-4">
                 <h3 className="font-medium mb-2 truncate" title={banner.title}>{banner.title}</h3>
                 <div className="flex flex-wrap gap-2 mb-3">
                     <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs capitalize border border-primary/20">
                     {banner.position}
                     </span>
                     <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground text-xs border border-white/5">
                     Order: {banner.sort_order}
                     </span>
                 </div>
                 <div className="flex items-center justify-between">
                     <Button
                     variant={banner.is_active ? "default" : "outline"}
                     size="sm"
                     onClick={() => toggleActive(banner.id, banner.is_active)}
                     >
                     {banner.is_active ? 'Active' : 'Inactive'}
                     </Button>
                     <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(banner)}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(banner.id)}
                        >
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                     </div>
                 </div>
                 </div>
             </div>
             ))
          )}
      </div>
    </div>
  )
}
