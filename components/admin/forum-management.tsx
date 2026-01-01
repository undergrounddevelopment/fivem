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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Search, Filter, MoreHorizontal, MessageSquare, Users, Eye, Edit, Trash2, Pin, Lock, Flag, Shield, AlertTriangle, CheckCircle, XCircle, Star, Calendar, User, Hash, TrendingUp, Activity, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ForumThread {
  id: string
  title: string
  content: string
  categoryId: string
  category: {
    id: string
    name: string
    color: string
    icon: string
  }
  author: {
    id: string
    username: string
    avatar: string
    role: string
  }
  replies: number
  views: number
  likes: number
  isPinned: boolean
  isLocked: boolean
  isDeleted: boolean
  reportCount: number
  createdAt: string
  updatedAt: string
  lastReplyAt: string
  lastReplyBy?: {
    username: string
    avatar: string
  }
  tags: string[]
  moderationFlags: string[]
}

interface ForumCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
  threadCount: number
  postCount: number
  order: number
  isActive: boolean
  moderators: string[]
  permissions: {
    canPost: string[]
    canReply: string[]
    canView: string[]
  }
}

interface ModerationAction {
  id: string
  type: "pin" | "lock" | "delete" | "move" | "warn" | "ban"
  threadId: string
  moderatorId: string
  moderator: {
    username: string
    avatar: string
  }
  reason: string
  createdAt: string
  isActive: boolean
}

export function ForumManagement() {
  const [activeTab, setActiveTab] = useState("threads")
  const [threads, setThreads] = useState<ForumThread[]>([])
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [moderationActions, setModerationActions] = useState<ModerationAction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    status: "all",
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc"
  })
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null)
  const [showThreadDialog, setShowThreadDialog] = useState(false)
  const [bulkAction, setBulkAction] = useState("")

  useEffect(() => {
    fetchData()
  }, [activeTab, filters])

  const fetchData = async () => {
    try {
      setLoading(true)
      const endpoint = activeTab === "threads" ? "threads" : activeTab === "categories" ? "categories" : "moderation"
      const params = new URLSearchParams({
        search: filters.search,
        category: filters.category,
        status: filters.status,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      })
      
      const response = await fetch(`/api/admin/forum/${endpoint}?${params}`)
      const result = await response.json()
      
      if (result.success) {
        if (activeTab === "threads") {
          setThreads(result.data)
        } else if (activeTab === "categories") {
          setCategories(result.data)
        } else {
          setModerationActions(result.data)
        }
      }
    } catch (error) {
      console.error("Failed to fetch forum data:", error)
      toast.error("Failed to load forum data")
    } finally {
      setLoading(false)
    }
  }

  const handleThreadAction = async (threadId: string, action: string, data?: any) => {
    try {
      const response = await fetch(`/api/admin/forum/threads/${threadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...data })
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success(`Thread ${action} successful`)
        fetchData()
      } else {
        toast.error(result.error || `Failed to ${action} thread`)
      }
    } catch (error) {
      console.error(`Failed to ${action} thread:`, error)
      toast.error(`Failed to ${action} thread`)
    }
  }

  const handleCategoryAction = async (categoryId: string, action: string, data?: any) => {
    try {
      const response = await fetch(`/api/admin/forum/categories/${categoryId}`, {
        method: action === "delete" ? "DELETE" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...data })
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success(`Category ${action} successful`)
        fetchData()
      } else {
        toast.error(result.error || `Failed to ${action} category`)
      }
    } catch (error) {
      console.error(`Failed to ${action} category:`, error)
      toast.error(`Failed to ${action} category`)
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedItems.length === 0) return

    try {
      const endpoint = activeTab === "threads" ? "threads" : "categories"
      const response = await fetch(`/api/admin/forum/${endpoint}/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: bulkAction,
          ids: selectedItems
        })
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success(`Bulk ${bulkAction} completed`)
        setSelectedItems([])
        setBulkAction("")
        fetchData()
      } else {
        toast.error(result.error || `Failed to perform bulk ${bulkAction}`)
      }
    } catch (error) {
      console.error("Bulk action failed:", error)
      toast.error("Bulk action failed")
    }
  }

  const getStatusBadge = (thread: ForumThread) => {
    if (thread.isDeleted) {
      return <Badge variant="destructive" className="flex items-center gap-1"><Trash2 className="h-3 w-3" />Deleted</Badge>
    }
    if (thread.isLocked) {
      return <Badge variant="secondary" className="flex items-center gap-1"><Lock className="h-3 w-3" />Locked</Badge>
    }
    if (thread.isPinned) {
      return <Badge variant="default" className="flex items-center gap-1 bg-yellow-500"><Pin className="h-3 w-3" />Pinned</Badge>
    }
    if (thread.reportCount > 0) {
      return <Badge variant="destructive" className="flex items-center gap-1"><Flag className="h-3 w-3" />Reported</Badge>
    }
    return <Badge variant="secondary" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />Active</Badge>
  }

  const ThreadDetailsDialog = ({ thread }: { thread: ForumThread }) => (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5" />
          {thread.title}
          {getStatusBadge(thread)}
        </DialogTitle>
      </DialogHeader>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Thread Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input value={thread.title} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: thread.category.color }}
                    />
                    <span>{thread.category.name}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Created</label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(thread.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Reply</label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {thread.lastReplyAt ? new Date(thread.lastReplyAt).toLocaleString() : "No replies"}
                    </p>
                  </div>
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
                    <MessageSquare className="h-4 w-4" />
                    Replies
                  </span>
                  <span className="font-bold">{thread.replies.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Views
                  </span>
                  <span className="font-bold">{thread.views.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Likes
                  </span>
                  <span className="font-bold">{thread.likes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <Flag className="h-4 w-4" />
                    Reports
                  </span>
                  <span className="font-bold">{thread.reportCount}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Author Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={thread.author.avatar} />
                  <AvatarFallback>{thread.author.username[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{thread.author.username}</p>
                  <Badge variant="outline">{thread.author.role}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {thread.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thread Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="p-4 bg-muted rounded-lg">
                  {thread.content}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center justify-between">
                  <span>Pinned</span>
                  <Switch checked={thread.isPinned} readOnly />
                </div>
                <div className="flex items-center justify-between">
                  <span>Locked</span>
                  <Switch checked={thread.isLocked} readOnly />
                </div>
                <div className="flex items-center justify-between">
                  <span>Deleted</span>
                  <Switch checked={thread.isDeleted} readOnly />
                </div>
              </div>
              
              {thread.moderationFlags.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Moderation Flags</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {thread.moderationFlags.map((flag) => (
                      <Badge key={flag} variant="destructive">{flag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Moderation Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Pin className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="font-medium">Thread pinned by Admin</p>
                    <p className="text-sm text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Flag className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="font-medium">Reported for spam</p>
                    <p className="text-sm text-muted-foreground">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => handleThreadAction(thread.id, "pin")}
              disabled={thread.isPinned}
              className="w-full"
            >
              <Pin className="h-4 w-4 mr-2" />
              Pin Thread
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleThreadAction(thread.id, "unpin")}
              disabled={!thread.isPinned}
              className="w-full"
            >
              <Pin className="h-4 w-4 mr-2" />
              Unpin Thread
            </Button>
            
            <Button
              onClick={() => handleThreadAction(thread.id, "lock")}
              disabled={thread.isLocked}
              className="w-full"
            >
              <Lock className="h-4 w-4 mr-2" />
              Lock Thread
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleThreadAction(thread.id, "unlock")}
              disabled={!thread.isLocked}
              className="w-full"
            >
              <Lock className="h-4 w-4 mr-2" />
              Unlock Thread
            </Button>
            
            <Button
              variant="destructive"
              onClick={() => handleThreadAction(thread.id, "delete")}
              className="w-full col-span-2"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Thread
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </DialogContent>
  )

  const ThreadsTab = () => (
    <div className="space-y-6">
      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
        >
          <span className="font-medium">{selectedItems.length} threads selected</span>
          <Select value={bulkAction} onValueChange={setBulkAction}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Choose action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pin">Pin Threads</SelectItem>
              <SelectItem value="unpin">Unpin Threads</SelectItem>
              <SelectItem value="lock">Lock Threads</SelectItem>
              <SelectItem value="unlock">Unlock Threads</SelectItem>
              <SelectItem value="delete">Delete Threads</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleBulkAction} disabled={!bulkAction}>
            Execute
          </Button>
          <Button variant="outline" onClick={() => setSelectedItems([])}>
            Clear Selection
          </Button>
        </motion.div>
      )}

      {/* Threads Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedItems.length === threads.length && threads.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedItems(threads.map(t => t.id))
                      } else {
                        setSelectedItems([])
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Thread</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {threads.map((thread, index) => (
                  <motion.tr
                    key={thread.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-muted/50"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(thread.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedItems([...selectedItems, thread.id])
                          } else {
                            setSelectedItems(selectedItems.filter(id => id !== thread.id))
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="font-medium truncate">{thread.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{thread.content}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: thread.category.color }}
                        />
                        <span className="text-sm">{thread.category.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={thread.author.avatar} />
                          <AvatarFallback>{thread.author.username[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{thread.author.username}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(thread)}</TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {thread.replies}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          {thread.views}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(thread.createdAt).toLocaleDateString()}
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
                            setSelectedThread(thread)
                            setShowThreadDialog(true)
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleThreadAction(thread.id, "pin")}>
                            <Pin className="h-4 w-4 mr-2" />
                            Pin Thread
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleThreadAction(thread.id, "lock")}>
                            <Lock className="h-4 w-4 mr-2" />
                            Lock Thread
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleThreadAction(thread.id, "delete")}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
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
    </div>
  )

  const CategoriesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button>
          <MessageSquare className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleCategoryAction(category.id, "edit")}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Category
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleCategoryAction(category.id, "delete")}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Threads</span>
                    <span className="font-medium">{category.threadCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Posts</span>
                    <span className="font-medium">{category.postCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Order</span>
                    <span className="font-medium">#{category.order}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Status</span>
                    <Badge variant={category.isActive ? "default" : "secondary"}>
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const ModerationTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Moderation Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {moderationActions.map((action) => (
              <div key={action.id} className="flex items-center gap-4 p-4 rounded-lg border">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={action.moderator.avatar} />
                  <AvatarFallback>{action.moderator.username[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">
                    {action.moderator.username} {action.type}ed a thread
                  </p>
                  <p className="text-sm text-muted-foreground">{action.reason}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(action.createdAt).toLocaleString()}
                  </p>
                </div>
                <Badge variant={action.isActive ? "default" : "secondary"}>
                  {action.isActive ? "Active" : "Reverted"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Forum Management</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Shield className="h-4 w-4 mr-2" />
            Auto Moderation
          </Button>
          <Button>
            <MessageSquare className="h-4 w-4 mr-2" />
            New Thread
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pinned">Pinned</SelectItem>
                <SelectItem value="locked">Locked</SelectItem>
                <SelectItem value="reported">Reported</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="replies">Replies</SelectItem>
                <SelectItem value="views">Views</SelectItem>
                <SelectItem value="likes">Likes</SelectItem>
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="threads">Threads</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
        </TabsList>

        <TabsContent value="threads">
          <ThreadsTab />
        </TabsContent>

        <TabsContent value="categories">
          <CategoriesTab />
        </TabsContent>

        <TabsContent value="moderation">
          <ModerationTab />
        </TabsContent>
      </Tabs>

      {/* Thread Details Dialog */}
      <Dialog open={showThreadDialog} onOpenChange={setShowThreadDialog}>
        {selectedThread && <ThreadDetailsDialog thread={selectedThread} />}
      </Dialog>
    </div>
  )
}