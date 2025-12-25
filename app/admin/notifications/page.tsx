"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Send, Bell, Trash2, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  link?: string
  is_active: boolean
  created_at: string
  expires_at?: string
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    link: "",
    expires_in_hours: "",
  })

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications")
      const data = await res.json()
      setNotifications(data.notifications || [])
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)

    try {
      const expires_at = formData.expires_in_hours
        ? new Date(Date.now() + Number.parseInt(formData.expires_in_hours) * 60 * 60 * 1000).toISOString()
        : null

      const res = await fetch("/api/notifications/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          message: formData.message,
          type: formData.type,
          link: formData.link || null,
          expires_at,
        }),
      })

      if (res.ok) {
        toast.success("Notification sent to all users!")
        fetchNotifications()
        setIsDialogOpen(false)
        setFormData({ title: "", message: "", type: "info", link: "", expires_in_hours: "" })
      } else {
        toast.error("Failed to send notification")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsSending(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notification?")) return

    try {
      const res = await fetch(`/api/admin/notifications?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Notification deleted!")
        fetchNotifications()
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      info: "bg-blue-500/20 text-blue-400 border-blue-500/50",
      success: "bg-green-500/20 text-green-400 border-green-500/50",
      warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      alert: "bg-red-500/20 text-red-400 border-red-500/50",
      new_asset: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50",
    }
    return styles[type] || styles.info
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Public Notifications</h1>
                <p className="text-muted-foreground mt-1">Send announcements to all users</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Send className="h-4 w-4" />
                    Send Notification
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Send Public Notification
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title *</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Notification title"
                        required
                        className="bg-background border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Message *</Label>
                      <Textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Write your notification message..."
                        required
                        className="bg-background border-border min-h-[100px]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) => setFormData({ ...formData, type: value })}
                        >
                          <SelectTrigger className="bg-background border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            <SelectItem value="info">Info</SelectItem>
                            <SelectItem value="success">Success</SelectItem>
                            <SelectItem value="warning">Warning</SelectItem>
                            <SelectItem value="alert">Alert</SelectItem>
                            <SelectItem value="new_asset">New Asset</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Expires In (hours)</Label>
                        <Input
                          type="number"
                          value={formData.expires_in_hours}
                          onChange={(e) => setFormData({ ...formData, expires_in_hours: e.target.value })}
                          placeholder="Never"
                          className="bg-background border-border"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Link (Optional)</Label>
                      <Input
                        value={formData.link}
                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                        placeholder="https://..."
                        className="bg-background border-border"
                      />
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm">This notification will be visible to all users</span>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSending}>
                        {isSending ? "Sending..." : "Send to All Users"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="bg-card/50 border-border animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                        <div className="h-3 bg-muted rounded w-3/4" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <Card className="bg-card/50 border-border">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No notifications sent yet</p>
                  </CardContent>
                </Card>
              ) : (
                notifications.map((notification) => (
                  <Card key={notification.id} className="bg-card/50 border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getTypeBadge(notification.type)}>{notification.type}</Badge>
                            {!notification.is_active && <Badge variant="secondary">Expired</Badge>}
                          </div>
                          <h3 className="font-semibold">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </span>
                            {notification.expires_at && (
                              <span>Expires: {new Date(notification.expires_at).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => handleDelete(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
