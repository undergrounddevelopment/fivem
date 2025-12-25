"use client"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, Filter, Edit, Trash2, Ban, Crown, Download, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useState } from "react"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { getCSRFToken } from "@/lib/csrf"

export default function AdminUsersPage() {
  const { isAdmin, isLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push("/")
    }
  }, [isAdmin, isLoading, router])

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch('/api/admin/users')
        if (res.ok) {
          const data = await res.json()
          setUsers(data.users || [])
        }
      } finally {
        setLoading(false)
      }
    }
    if (isAdmin) {
      loadUsers()
    }
  }, [isAdmin])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAdmin) return null
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="md:ml-72 transition-all duration-300">
        <Header />
        <Toaster richColors closeButton />
        <div className="p-6">
          {/* Back Button */}
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Link>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">User Management</h1>
              <p className="text-muted-foreground">Manage user accounts, memberships, and permissions.</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users..." className="pl-9 bg-secondary/50" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <div className="flex gap-1 bg-secondary rounded-lg p-1 ml-auto">
              <Button variant="secondary" size="sm" className="bg-card">
                All
              </Button>
              <Button variant="ghost" size="sm">
                VIP
              </Button>
              <Button variant="ghost" size="sm">
                Free
              </Button>
              <Button variant="ghost" size="sm">
                Banned
              </Button>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">User</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Membership</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Stats</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Joined</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(loading ? [] : users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()))).map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar || "/placeholder.svg"}
                          alt={user.username}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{user.username}</span>
                            {user.membership === "vip" && <Crown className="h-4 w-4 text-primary" />}
                          </div>
                          <span className="text-sm text-muted-foreground">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        className={
                          user.membership === "vip"
                            ? "bg-primary/20 text-primary"
                            : "bg-secondary text-muted-foreground"
                        }
                      >
                        {user.membership.toUpperCase()}
                      </Badge>
                      <div className="mt-2">
                        <Select
                          value={user.membership}
                          onValueChange={async (value) => {
                          const csrfToken = getCSRFToken()
                          await fetch(`/api/admin/users/${user.discordId}`, {
                            method: 'POST',
                            headers: { 
                              'Content-Type': 'application/json',
                              ...(csrfToken ? { 'x-csrf-token': csrfToken } : {})
                            },
                            body: JSON.stringify({ action: 'setMembership', membership: value })
                          })
                          setUsers(users.map(u => u.discordId === user.discordId ? { ...u, membership: value } : u))
                          toast.success(`Membership updated to ${value.toUpperCase()} for ${user.username}`)
                        }}
                      >
                          <SelectTrigger size="sm" className="bg-secondary/50">
                            <SelectValue placeholder="Membership" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="vip">VIP</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          {user.downloads}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {user.posts}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        className={
                          !user.isBanned ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                        }
                      >
                        {user.isBanned ? 'banned' : 'active'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-4">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={async () => {
                    await fetch(`/api/admin/users/${user.discordId}`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'setMembership', membership: 'vip' })
                    })
                    setUsers(users.map(u => u.discordId === user.discordId ? { ...u, membership: 'vip' } : u))
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Ban className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{user.isBanned ? 'Unban User' : 'Ban User'}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {user.isBanned
                          ? `Allow ${user.username} to access the platform again?`
                          : `Block ${user.username} from accessing the platform? You can undo later.`}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          const willBan = !user.isBanned
                          const csrfToken = getCSRFToken()
                          const res = await fetch(`/api/admin/users/${user.discordId}`, {
                            method: 'POST',
                            headers: { 
                              'Content-Type': 'application/json',
                              ...(csrfToken ? { 'x-csrf-token': csrfToken } : {})
                            },
                            body: JSON.stringify({ action: 'ban', ban: willBan })
                          })
                          const data = await res.json()
                          if (res.ok) {
                            setUsers(users.map(u => u.discordId === user.discordId ? { ...u, isBanned: willBan, status: data.status } : u))
                            toast.success(`${willBan ? 'User banned' : 'User unbanned'}: ${user.username}`)
                          } else {
                            toast.error(data.error || 'Failed to update ban status')
                          }
                        }}
                      >
                        {user.isBanned ? 'Unban' : 'Ban'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete User</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to permanently delete <strong>{user.username}</strong>? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          const csrfToken = getCSRFToken()
                          const res = await fetch(`/api/admin/users/${user.discordId}`, { 
                            method: 'DELETE',
                            headers: csrfToken ? { 'x-csrf-token': csrfToken } : {}
                          })
                          if (res.ok) {
                            setUsers(users.filter(u => u.discordId !== user.discordId))
                            toast.success(`User deleted: ${user.username}`)
                          } else {
                            const data = await res.json()
                            toast.error(data.error || 'Failed to delete user')
                          }
                        }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">Showing 1-6 of 30 users</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
