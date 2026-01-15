"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Bell, Trash2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    target: 'all'
  })

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/admin/notifications')
      const data = await res.json()
      setNotifications(data.notifications || [])
    } catch (error) {
      toast.error("Failed to load")
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        toast.success("Notification sent")
        setShowDialog(false)
        setFormData({ title: '', message: '', type: 'info', target: 'all' })
        fetchNotifications()
      }
    } catch (error) {
      toast.error("Failed to send")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this notification?")) return
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success("Deleted")
        fetchNotifications()
      }
    } catch (error) {
      toast.error("Failed to delete")
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
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Notifications
          </h1>
          <p className="text-muted-foreground">Send notifications to users</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Send Notification
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Notification</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSend} className="space-y-4">
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
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Target</label>
                <Select value={formData.target} onValueChange={(v) => setFormData({ ...formData, target: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="admins">Admins Only</SelectItem>
                    <SelectItem value="vip">VIP Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Send Notification</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b bg-secondary/30">
                <th className="text-left py-4 px-4 text-sm font-medium">Title</th>
                <th className="text-left py-4 px-4 text-sm font-medium">Message</th>
                <th className="text-left py-4 px-4 text-sm font-medium">Type</th>
                <th className="text-left py-4 px-4 text-sm font-medium">Sent</th>
                <th className="text-left py-4 px-4 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notif) => (
                <tr key={notif.id} className="border-b last:border-0 hover:bg-secondary/20">
                  <td className="py-4 px-4 font-medium">{notif.title}</td>
                  <td className="py-4 px-4 text-muted-foreground truncate max-w-md">{notif.message}</td>
                  <td className="py-4 px-4">{notif.type}</td>
                  <td className="py-4 px-4 text-muted-foreground">
                    {new Date(notif.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(notif.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
