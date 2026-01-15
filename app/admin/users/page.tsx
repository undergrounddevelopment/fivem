"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Crown, Users, UserCheck, UserX, Ban, CheckCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

type UserFilter = 'all' | 'active' | 'banned'

interface User {
  id: string
  username: string
  email: string
  avatar: string | null
  membership: string
  coins: number
  is_admin: boolean
  is_banned: boolean
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filter, setFilter] = useState<UserFilter>('all')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    banned: 0
  })

  useEffect(() => {
    fetchUsers()
  }, [filter])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users?filter=${filter}`)
      if (!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      setUsers(data.users)
      setStats(data.stats)
    } catch (error) {
      toast.error("Failed to load users")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleBanToggle = async (userId: string, currentBanStatus: boolean) => {
    const action = currentBanStatus ? 'unban' : 'ban'

    try {
      const res = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: 'POST'
      })

      if (!res.ok) throw new Error(`Failed to ${action} user`)

      toast.success(`User ${action}ned successfully`)
      fetchUsers() // Refresh list
    } catch (error) {
      toast.error(`Failed to ${action} user`)
      console.error(error)
    }
  }

  const filteredUsers = users


  return (
    <div className="min-h-screen bg-transparent relative">
      {/* Background Effects */}
      < div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none" >
        <div className="blur-orb" style={{ top: '20%', right: '10%', background: 'rgba(59,130,246,0.1)' }} />
      </div >

      <div className="flex items-center justify-between mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-xs font-medium">Dashboard</span>
            </Link>
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">User Management</h1>
          <p className="text-muted-foreground">Manage user accounts, memberships, and permissions.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="glass border-white/10 hover:border-white/20 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All registered users</p>
          </CardContent>
        </Card>

        <Card className="glass border-white/10 hover:border-green-500/20 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <UserCheck className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Can access platform</p>
          </CardContent>
        </Card>

        <Card className="glass border-white/10 hover:border-red-500/20 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Banned Users</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <UserX className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.banned}</div>
            <p className="text-xs text-muted-foreground">Access restricted</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as UserFilter)} className="mb-6">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="all" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            All Users ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="active" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-500">
            Active ({stats.active})
          </TabsTrigger>
          <TabsTrigger value="banned" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-500">
            Banned ({stats.banned})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Users Table Card */}
      <div className="glass rounded-xl border border-white/10 overflow-hidden shadow-2xl shadow-black/20">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground animate-pulse">
            <div className="h-12 w-12 bg-white/10 rounded-full mx-auto mb-4" />
            <p>Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium mb-1">No users found</h3>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Membership</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Coins</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined</th>
                  <th className="text-right py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={user.avatar || "/placeholder.svg"}
                            alt={user.username}
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-white/10"
                          />
                          {user.is_admin && (
                            <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-0.5 border border-black">
                              <Crown className="h-2.5 w-2.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground group-hover:text-primary transition-colors truncate max-w-[150px] block" title={user.username}>{user.username}</span>
                          </div>
                          <span className="text-xs text-muted-foreground truncate max-w-[200px] block" title={user.email}>{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge
                        variant="outline"
                        className={
                          user.membership === "admin" || user.membership === "vip"
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-secondary/30 text-muted-foreground border-white/10"
                        }
                      >
                        {user.membership?.toUpperCase() || 'FREE'}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 font-medium text-sm text-yellow-500/90">
                        {user.coins?.toLocaleString() || 0}
                        <span className="text-[10px] text-muted-foreground">CN</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge
                        variant="outline"
                        className={
                          !user.is_banned
                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                            : "bg-red-500/10 text-red-500 border-red-500/20"
                        }
                      >
                        {user.is_banned ? 'BANNED' : 'ACTIVE'}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-xs text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {!user.is_admin && (
                        <Button
                          variant={user.is_banned ? "outline" : "ghost"}
                          size="sm"
                          onClick={() => handleBanToggle(user.id, user.is_banned)}
                          className={
                            user.is_banned
                              ? "border-green-500/30 text-green-500 hover:bg-green-500/10 hover:text-green-400"
                              : "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          }
                        >
                          {user.is_banned ? (
                            <>
                              <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                              Unban
                            </>
                          ) : (
                            <>
                              <Ban className="h-3.5 w-3.5 mr-1.5" />
                              Ban
                            </>
                          )}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div >
  )
}
