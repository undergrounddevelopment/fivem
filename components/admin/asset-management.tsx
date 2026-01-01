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
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { Search, Filter, MoreHorizontal, Upload, Download, Eye, Edit, Trash2, Shield, AlertTriangle, CheckCircle, XCircle, Star, Calendar, User, Package, Zap, FileText, Image, Video, Archive } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Asset {
  id: string
  title: string
  description: string
  category: "scripts" | "mlo" | "vehicles" | "clothing"
  framework: "standalone" | "esx" | "qbcore" | "qbox"
  version: string
  price: "free" | "premium"
  coinPrice: number
  thumbnail: string
  downloads: number
  rating: number
  author: {
    id: string
    username: string
    avatar: string
  }
  createdAt: string
  updatedAt: string
  status: "pending" | "approved" | "rejected" | "featured"
  tags: string[]
  fileSize: string
  virusScanStatus: "pending" | "clean" | "threat" | "error"
  virusScanHash?: string
  downloadUrl?: string
  isVerified: boolean
  isFeatured: boolean
  reportCount: number
  lastScanned?: string
}

interface AssetFilters {
  search: string
  category: string
  framework: string
  status: string
  virusScan: string
  sortBy: string
  sortOrder: "asc" | "desc"
}

export function AssetManagement() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [filters, setFilters] = useState<AssetFilters>({
    search: "",
    category: "all",
    framework: "all",
    status: "all",
    virusScan: "all",
    sortBy: "createdAt",
    sortOrder: "desc"
  })
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [showAssetDialog, setShowAssetDialog] = useState(false)
  const [bulkAction, setBulkAction] = useState("")
  const [scanProgress, setScanProgress] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    fetchAssets()
  }, [filters])

  const fetchAssets = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        search: filters.search,
        category: filters.category,
        framework: filters.framework,
        status: filters.status,
        virusScan: filters.virusScan,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      })
      
      const response = await fetch(`/api/admin/assets?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setAssets(result.data)
      }
    } catch (error) {
      console.error("Failed to fetch assets:", error)
      toast.error("Failed to load assets")
    } finally {
      setLoading(false)
    }
  }

  const handleAssetAction = async (assetId: string, action: string, data?: any) => {
    try {
      const response = await fetch(`/api/admin/assets/${assetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...data })
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success(`Asset ${action} successful`)
        fetchAssets()
      } else {
        toast.error(result.error || `Failed to ${action} asset`)
      }
    } catch (error) {
      console.error(`Failed to ${action} asset:`, error)
      toast.error(`Failed to ${action} asset`)
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedAssets.length === 0) return

    try {
      const response = await fetch("/api/admin/assets/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: bulkAction,
          assetIds: selectedAssets
        })
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success(`Bulk ${bulkAction} completed`)
        setSelectedAssets([])
        setBulkAction("")
        fetchAssets()
      } else {
        toast.error(result.error || `Failed to perform bulk ${bulkAction}`)
      }
    } catch (error) {
      console.error("Bulk action failed:", error)
      toast.error("Bulk action failed")
    }
  }

  const handleVirusScan = async (assetId: string) => {
    try {
      setScanProgress({ ...scanProgress, [assetId]: 0 })
      
      const response = await fetch(`/api/admin/assets/${assetId}/scan`, {
        method: "POST"
      })

      const result = await response.json()
      
      if (result.success) {
        // Simulate progress
        const interval = setInterval(() => {
          setScanProgress(prev => {
            const current = prev[assetId] || 0
            if (current >= 100) {
              clearInterval(interval)
              return prev
            }
            return { ...prev, [assetId]: current + 10 }
          })
        }, 200)

        setTimeout(() => {
          clearInterval(interval)
          setScanProgress(prev => ({ ...prev, [assetId]: 100 }))
          toast.success("Virus scan completed")
          fetchAssets()
        }, 2000)
      } else {
        toast.error("Failed to start virus scan")
        setScanProgress(prev => {
          const newProgress = { ...prev }
          delete newProgress[assetId]
          return newProgress
        })
      }
    } catch (error) {
      console.error("Virus scan failed:", error)
      toast.error("Virus scan failed")
    }
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      scripts: <FileText className="h-4 w-4" />,
      mlo: <Package className="h-4 w-4" />,
      vehicles: <Zap className="h-4 w-4" />,
      clothing: <Image className="h-4 w-4" />
    }
    return icons[category as keyof typeof icons] || <FileText className="h-4 w-4" />
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: "secondary" as const, icon: <AlertTriangle className="h-3 w-3" /> },
      approved: { variant: "default" as const, icon: <CheckCircle className="h-3 w-3" /> },
      rejected: { variant: "destructive" as const, icon: <XCircle className="h-3 w-3" /> },
      featured: { variant: "default" as const, icon: <Star className="h-3 w-3" />, className: "bg-yellow-500" }
    }
    
    const config = variants[status as keyof typeof variants] || variants.pending
    
    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 ${config.className || ""}`}>
        {config.icon}
        {status.toUpperCase()}
      </Badge>
    )
  }

  const getVirusScanBadge = (status: string, progress?: number) => {
    if (progress !== undefined && progress < 100) {
      return (
        <div className="flex items-center gap-2">
          <Progress value={progress} className="w-16 h-2" />
          <span className="text-xs">{progress}%</span>
        </div>
      )
    }

    const variants = {
      pending: { variant: "secondary" as const, icon: <AlertTriangle className="h-3 w-3" />, text: "Pending" },
      clean: { variant: "default" as const, icon: <CheckCircle className="h-3 w-3" />, text: "Clean", className: "bg-green-500" },
      threat: { variant: "destructive" as const, icon: <XCircle className="h-3 w-3" />, text: "Threat" },
      error: { variant: "secondary" as const, icon: <AlertTriangle className="h-3 w-3" />, text: "Error" }
    }
    
    const config = variants[status as keyof typeof variants] || variants.pending
    
    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 ${config.className || ""}`}>
        {config.icon}
        {config.text}
      </Badge>
    )
  }

  const AssetDetailsDialog = ({ asset }: { asset: Asset }) => (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          <img src={asset.thumbnail} alt={asset.title} className="w-10 h-10 rounded object-cover" />
          {asset.title}
          {getStatusBadge(asset.status)}
        </DialogTitle>
      </DialogHeader>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input value={asset.title} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea value={asset.description} readOnly rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <div className="flex items-center gap-2 mt-1">
                      {getCategoryIcon(asset.category)}
                      <span className="capitalize">{asset.category}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Framework</label>
                    <div className="mt-1">
                      <Badge variant="outline" className="capitalize">{asset.framework}</Badge>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Version</label>
                    <Input value={asset.version} readOnly />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Price</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={asset.price === "free" ? "secondary" : "default"}>
                        {asset.price === "free" ? "FREE" : `${asset.coinPrice} coins`}
                      </Badge>
                    </div>
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
                    <Download className="h-4 w-4" />
                    Downloads
                  </span>
                  <span className="font-bold">{asset.downloads.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Rating
                  </span>
                  <span className="font-bold">{asset.rating.toFixed(1)}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <Archive className="h-4 w-4" />
                    File Size
                  </span>
                  <span className="font-bold">{asset.fileSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Reports
                  </span>
                  <span className="font-bold">{asset.reportCount}</span>
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
                  <AvatarImage src={asset.author.avatar} />
                  <AvatarFallback>{asset.author.username[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{asset.author.username}</p>
                  <p className="text-sm text-muted-foreground">Asset Creator</p>
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
                {asset.tags.map((tag) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Virus Scan Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Current Status:</span>
                {getVirusScanBadge(asset.virusScanStatus, scanProgress[asset.id])}
              </div>
              
              {asset.virusScanHash && (
                <div>
                  <label className="text-sm font-medium">File Hash (SHA256)</label>
                  <Input value={asset.virusScanHash} readOnly className="font-mono text-xs" />
                </div>
              )}
              
              {asset.lastScanned && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Last scanned: {new Date(asset.lastScanned).toLocaleString()}</span>
                </div>
              )}
              
              <Button
                onClick={() => handleVirusScan(asset.id)}
                disabled={scanProgress[asset.id] !== undefined}
                className="w-full"
              >
                <Shield className="h-4 w-4 mr-2" />
                {scanProgress[asset.id] !== undefined ? "Scanning..." : "Run Virus Scan"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Flags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Verified Asset</span>
                <Badge variant={asset.isVerified ? "default" : "secondary"}>
                  {asset.isVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Featured Asset</span>
                <Badge variant={asset.isFeatured ? "default" : "secondary"}>
                  {asset.isFeatured ? "Featured" : "Regular"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Report Count</span>
                <Badge variant={asset.reportCount > 0 ? "destructive" : "secondary"}>
                  {asset.reportCount} reports
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Download Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Downloads</span>
                    <span className="font-bold">{asset.downloads.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>This Week</span>
                    <span className="font-bold">1,234</span>
                  </div>
                  <div className="flex justify-between">
                    <span>This Month</span>
                    <span className="font-bold">5,678</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Average Rating</span>
                    <span className="font-bold">{asset.rating.toFixed(1)}/5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Reviews</span>
                    <span className="font-bold">89</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Favorites</span>
                    <span className="font-bold">234</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => handleAssetAction(asset.id, "approve")}
              disabled={asset.status === "approved"}
              className="w-full"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Asset
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleAssetAction(asset.id, "reject")}
              disabled={asset.status === "rejected"}
              className="w-full"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject Asset
            </Button>
            
            <Button
              onClick={() => handleAssetAction(asset.id, "feature")}
              disabled={asset.isFeatured}
              className="w-full"
            >
              <Star className="h-4 w-4 mr-2" />
              Feature Asset
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleAssetAction(asset.id, "unfeature")}
              disabled={!asset.isFeatured}
              className="w-full"
            >
              <Star className="h-4 w-4 mr-2" />
              Remove Feature
            </Button>
            
            <Button
              variant="destructive"
              onClick={() => handleAssetAction(asset.id, "delete")}
              className="w-full col-span-2"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Asset
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </DialogContent>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Asset Management</h2>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Asset
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
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
                <SelectItem value="scripts">Scripts</SelectItem>
                <SelectItem value="mlo">MLO</SelectItem>
                <SelectItem value="vehicles">Vehicles</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.framework} onValueChange={(value) => setFilters({ ...filters, framework: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Framework" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Frameworks</SelectItem>
                <SelectItem value="standalone">Standalone</SelectItem>
                <SelectItem value="esx">ESX</SelectItem>
                <SelectItem value="qbcore">QBCore</SelectItem>
                <SelectItem value="qbox">QBox</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.virusScan} onValueChange={(value) => setFilters({ ...filters, virusScan: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Virus Scan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scans</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="clean">Clean</SelectItem>
                <SelectItem value="threat">Threat</SelectItem>
                <SelectItem value="error">Error</SelectItem>
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
      {selectedAssets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
        >
          <span className="font-medium">{selectedAssets.length} assets selected</span>
          <Select value={bulkAction} onValueChange={setBulkAction}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Choose action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="approve">Approve Assets</SelectItem>
              <SelectItem value="reject">Reject Assets</SelectItem>
              <SelectItem value="feature">Feature Assets</SelectItem>
              <SelectItem value="scan">Virus Scan</SelectItem>
              <SelectItem value="delete">Delete Assets</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleBulkAction} disabled={!bulkAction}>
            Execute
          </Button>
          <Button variant="outline" onClick={() => setSelectedAssets([])}>
            Clear Selection
          </Button>
        </motion.div>
      )}

      {/* Assets Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedAssets.length === assets.length && assets.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedAssets(assets.map(a => a.id))
                      } else {
                        setSelectedAssets([])
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Security</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {assets.map((asset, index) => (
                  <motion.tr
                    key={asset.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-muted/50"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedAssets.includes(asset.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedAssets([...selectedAssets, asset.id])
                          } else {
                            setSelectedAssets(selectedAssets.filter(id => id !== asset.id))
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img src={asset.thumbnail} alt={asset.title} className="w-10 h-10 rounded object-cover" />
                        <div>
                          <p className="font-medium">{asset.title}</p>
                          <p className="text-sm text-muted-foreground">by {asset.author.username}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(asset.category)}
                        <span className="capitalize">{asset.category}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(asset.status)}</TableCell>
                    <TableCell>{getVirusScanBadge(asset.virusScanStatus, scanProgress[asset.id])}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {asset.downloads.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Star className="h-3 w-3" />
                          {asset.rating.toFixed(1)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(asset.createdAt).toLocaleDateString()}
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
                            setSelectedAsset(asset)
                            setShowAssetDialog(true)
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAssetAction(asset.id, "approve")}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAssetAction(asset.id, "feature")}>
                            <Star className="h-4 w-4 mr-2" />
                            Feature
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleVirusScan(asset.id)}>
                            <Shield className="h-4 w-4 mr-2" />
                            Virus Scan
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleAssetAction(asset.id, "delete")}
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

      {/* Asset Details Dialog */}
      <Dialog open={showAssetDialog} onOpenChange={setShowAssetDialog}>
        {selectedAsset && <AssetDetailsDialog asset={selectedAsset} />}
      </Dialog>
    </div>
  )
}