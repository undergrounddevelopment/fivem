"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { Search, Filter, MoreHorizontal, UserPlus, Ban, Shield, Crown, Mail, Calendar, Activity, Download, MessageSquare, Coins, Star, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface User {
  id: string
  discordId: string
  username: string
  email: string | null
  avatar: string
  membership: "free" | "vip" | "admin"
  coins: number
  downloads: number
  posts: number
  reputation: number
  isAdmin: boolean
  isBanned: boolean
  banReason?: string
  createdAt: string
  lastSeen: string
  isOnline: boolean
  totalSpent: number
  warningsCount: number
}

interface UserFilters {
  search: string
  membership: string
  status: string
  sortBy: string
  sortOrder: "asc" | "desc"
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [filters, setFilters] = useState<UserFilters>({
    search: "",
    membership: "all",
    status: "all",
    sortBy: "createdAt",
    sortOrder: "desc"
  })
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [bulkAction, setBulkAction] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [filters])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        search: filters.search,
        membership: filters.membership,
        status: filters.status,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      })
      
      const response = await fetch(`/api/admin/users?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setUsers(result.data)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: string, data?: any) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...data })
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success(`User ${action} successful`)
        fetchUsers()
      } else {
        toast.error(result.error || `Failed to ${action} user`)
      }
    } catch (error) {
      console.error(`Failed to ${action} user:`, error)
      toast.error(`Failed to ${action} user`)
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) return

    try {
      const response = await fetch("/api/admin/users/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: bulkAction,
          userIds: selectedUsers
        })
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success(`Bulk ${bulkAction} completed`)
        setSelectedUsers([])
        setBulkAction("")
        fetchUsers()
      } else {
        toast.error(result.error || `Failed to perform bulk ${bulkAction}`)
      }
    } catch (error) {
      console.error("Bulk action failed:", error)
      toast.error("Bulk action failed")
    }
  }

  const getMembershipBadge = (membership: string) => {
    const variants = {
      free: { variant: "secondary" as const, icon: null },
      vip: { variant: "default" as const, icon: <Star className="h-3 w-3" /> },
      admin: { variant: "destructive" as const, icon: <Crown className="h-3 w-3" /> }
    }
    
    const config = variants[membership as keyof typeof variants] || variants.free
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {membership.toUpperCase()}
      </Badge>
    )
  }

  const getStatusBadge = (user: User) => {
    if (user.isBanned) {
      return <Badge variant="destructive" className="flex items-center gap-1"><Ban className="h-3 w-3" />Banned</Badge>
    }
    if (user.isOnline) {
      return <Badge variant="default" className="flex items-center gap-1 bg-green-500"><CheckCircle className="h-3 w-3" />Online</Badge>
    }
    return <Badge variant="secondary" className="flex items-center gap-1"><XCircle className="h-3 w-3" />Offline</Badge>
  }

  const UserDetailsDialog = ({ user }: { user: User }) => (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.username[0]}</AvatarFallback>
          </Avatar>
          {user.username}
          {getMembershipBadge(user.membership)}
        </DialogTitle>
      </DialogHeader>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user.email || "No email"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span>Last seen {new Date(user.lastSeen).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <Coins className="h-4 w-4" />
                    Coins
                  </span>
                  <span className="font-bold">{user.coins.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Downloads
                  </span>
                  <span className="font-bold">{user.downloads.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Posts
                  </span>
                  <span className="font-bold">{user.posts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Reputation
                  </span>
                  <span className="font-bold">{user.reputation.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Download className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="font-medium">Downloaded "Police Car Pack"</p>
                    <p className="text-sm text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <MessageSquare className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="font-medium">Posted in "Script Help"</p>
                    <p className="text-sm text-muted-foreground">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="font-medium">Rated "Bank MLO" 5 stars</p>
                    <p className="text-sm text-muted-foreground">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Moderation History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.warningsCount > 0 && (
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="font-medium">Warnings: {user.warningsCount}</p>
                      <p className="text-sm text-muted-foreground">User has received warnings</p>
                    </div>
                  </div>
                )}
                
                {user.isBanned && (
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-red-200 bg-red-50">
                    <Ban className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="font-medium">Banned</p>
                      <p className="text-sm text-muted-foreground">{user.banReason || "No reason provided"}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => handleUserAction(user.id, "promote")}
              disabled={user.isAdmin}
              className="w-full"
            >
              <Crown className="h-4 w-4 mr-2" />
              Make Admin
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleUserAction(user.id, "demote")}
              disabled={!user.isAdmin}
              className="w-full"
            >
              <Shield className="h-4 w-4 mr-2" />
              Remove Admin
            </Button>
            
            <Button
              variant="destructive"
              onClick={() => handleUserAction(user.id, user.isBanned ? "unban" : "ban", {
                reason: "Manual action from admin panel"
              })}
              className="w-full"
            >
              <Ban className="h-4 w-4 mr-2" />
              {user.isBanned ? "Unban" : "Ban"} User
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleUserAction(user.id, "reset-password")}
              className="w-full"
            >
              <Mail className="h-4 w-4 mr-2" />
              Reset Password
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </DialogContent>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">User Management</h2>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.membership} onValueChange={(value) => setFilters({ ...filters, membership: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Membership" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Memberships</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Join Date</SelectItem>
                <SelectItem value="lastSeen">Last Seen</SelectItem>
                <SelectItem value="coins">Coins</SelectItem>
                <SelectItem value="downloads">Downloads</SelectItem>
                <SelectItem value="reputation">Reputation</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={() => setFilters({ ...filters, sortOrder: filters.sortOrder === "asc" ? "desc" : "asc" })}
            >
              <Filter className="h-4 w-4 mr-2" />
              {filters.sortOrder === "asc" ? "↑" : "↓"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
        >
          <span className="font-medium">{selectedUsers.length} users selected</span>
          <Select value={bulkAction} onValueChange={setBulkAction}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Choose action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ban">Ban Users</SelectItem>
              <SelectItem value="unban">Unban Users</SelectItem>
              <SelectItem value="promote">Promote to VIP</SelectItem>
              <SelectItem value="demote">Demote to Free</SelectItem>
              <SelectItem value="delete">Delete Users</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleBulkAction} disabled={!bulkAction}>
            Execute
          </Button>
          <Button variant="outline" onClick={() => setSelectedUsers([])}>
            Clear Selection
          </Button>
        </motion.div>
      )}

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedUsers(users.map(u => u.id))
                      } else {
                        setSelectedUsers([])
                      }
                    }}
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Membership</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {users.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-muted/50"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedUsers([...selectedUsers, user.id])
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.username[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getMembershipBadge(user.membership)}</TableCell>
                    <TableCell>{getStatusBadge(user)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Coins className="h-3 w-3" />
                          {user.coins.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Download className="h-3 w-3" />
                          {user.downloads}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(user)
                            setShowUserDialog(true)
                          }}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUserAction(user.id, "promote")}>
                            Make Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUserAction(user.id, user.isBanned ? "unban" : "ban")}>
                            {user.isBanned ? "Unban" : "Ban"} User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        {selectedUser && <UserDetailsDialog user={selectedUser} />}
      </Dialog>
    </div>
  )
}