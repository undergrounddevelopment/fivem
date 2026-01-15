"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Edit, Trash2, Megaphone } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    is_active: true
  })

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/admin/announcements')
      const data = await res.json()
      setAnnouncements(data.announcements || [])
    } catch (error) {
      toast.error("Failed to load")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingId ? `/api/admin/announcements/${editingId}` : '/api/admin/announcements'
      const method = editingId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        toast.success(editingId ? "Updated" : "Created")
        setShowDialog(false)
        setEditingId(null)
        setFormData({ title: '', message: '', type: 'info', is_active: true })
        fetchAnnouncements()
      }
    } catch (error) {
      toast.error("Failed to save")
    }
  }

  const handleEdit = (announcement: any) => {
    setEditingId(announcement.id)
    setFormData({
      title: announcement.title,
      message: announcement.message || announcement.content,
      type: announcement.type,
      is_active: announcement.is_active
    })
    setShowDialog(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success("Deleted")
        fetchAnnouncements()
      }
    } catch (error) {
      toast.error("Failed to delete")
    }
  }

  return (
    <div className="min-h-screen bg-transparent relative py-8 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="blur-orb" style={{ top: '10%', right: '10%', background: 'rgba(59,130,246,0.1)' }} />
      </div>

      <div className="container relative z-10">
        <Link href="/admin" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Admin
        </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-primary" />
            Announcements
          </h1>
          <p className="text-muted-foreground">Manage site announcements</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => {
              setEditingId(null)
              setFormData({ title: '', message: '', type: 'info', is_active: true })
            }}>
              <Plus className="h-4 w-4" />
              New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit' : 'New'} Announcement</DialogTitle>
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
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <label className="text-sm">Active</label>
              </div>
              <Button type="submit" className="w-full">Save</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass-morphism rounded-xl border border-white/5 overflow-hidden shadow-2xl shadow-black/20">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b bg-secondary/30">
                <th className="text-left py-4 px-4 text-sm font-medium">Title</th>
                <th className="text-left py-4 px-4 text-sm font-medium">Type</th>
                <th className="text-left py-4 px-4 text-sm font-medium">Status</th>
                <th className="text-left py-4 px-4 text-sm font-medium">Created</th>
                <th className="text-left py-4 px-4 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((announcement) => (
                <tr key={announcement.id} className="border-b last:border-0 hover:bg-secondary/20">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium truncate max-w-[200px]" title={announcement.title}>{announcement.title}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-md">
                        {announcement.message || announcement.content}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="outline" className={
                      announcement.type === 'info' ? 'border-blue-500 text-blue-500' :
                        announcement.type === 'warning' ? 'border-yellow-500 text-yellow-500' :
                          announcement.type === 'success' ? 'border-green-500 text-green-500' :
                            'border-red-500 text-red-500'
                    }>
                      {announcement.type}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <Badge className={announcement.is_active ? "bg-success/20 text-success" : "bg-secondary"}>
                      {announcement.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-muted-foreground">
                    {new Date(announcement.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(announcement)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(announcement.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        </div>
      </div>
    </div>
  )
}
