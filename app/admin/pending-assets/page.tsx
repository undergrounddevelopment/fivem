"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { FormattedText } from "@/components/formatted-text"
import { toast } from "sonner"
import { FileText, Check, X, Eye, Loader2, RefreshCw, Calendar, Tag, AlertCircle } from "lucide-react"

interface Asset {
  id: string
  title: string
  description: string
  features: string
  installation: string
  changelog: string
  type: string
  framework: string
  image_url: string
  download_url: string
  status: string
  created_at: string
  user: { username: string; avatar: string }
}

export default function PendingAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [processing, setProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  const fetchAssets = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/pending-assets?type=${activeTab}&status=pending`)
      const data = await res.json()
      setAssets(data.assets || [])
    } catch (error) {
      toast.error("Failed to load assets")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssets()
  }, [activeTab])

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setProcessing(true)
    try {
      const res = await fetch("/api/admin/pending-assets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, reason: action === "reject" ? rejectReason : null })
      })

      if (!res.ok) throw new Error("Action failed")

      toast.success(action === "approve" ? "Asset approved!" : "Asset rejected!")
      fetchAssets()
      setRejectDialogOpen(false)
      setRejectReason("")
      setViewDialogOpen(false)
    } catch (error) {
      toast.error("Action failed")
    } finally {
      setProcessing(false)
    }
  }

  const typeCounts = {
    all: assets.length,
    script: assets.filter(a => a.type === "script").length,
    mlo: assets.filter(a => a.type === "mlo").length,
    vehicle: assets.filter(a => a.type === "vehicle").length,
    clothing: assets.filter(a => a.type === "clothing").length
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Pending Assets</h1>
          <p className="text-muted-foreground mt-1">Review and moderate submissions</p>
        </div>
        <Button onClick={fetchAssets} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="all">All ({typeCounts.all})</TabsTrigger>
          <TabsTrigger value="script">Scripts ({typeCounts.script})</TabsTrigger>
          <TabsTrigger value="mlo">MLO ({typeCounts.mlo})</TabsTrigger>
          <TabsTrigger value="vehicle">Vehicles ({typeCounts.vehicle})</TabsTrigger>
          <TabsTrigger value="clothing">Clothing ({typeCounts.clothing})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : assets.length === 0 ? (
            <Card className="glass">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending assets</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assets.map((asset) => (
                <Card key={asset.id} className="glass glass-hover group">
                  <div className="relative">
                    <img src={asset.image_url || "/placeholder.svg"} alt={asset.title} className="w-full h-48 object-cover rounded-t-lg" />
                    <Badge className="absolute top-2 right-2 capitalize">{asset.type}</Badge>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-lg truncate">{asset.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <img src={asset.user.avatar || "/placeholder.svg"} alt={asset.user.username} className="w-5 h-5 rounded-full" />
                        <span className="text-xs text-muted-foreground">{asset.user.username}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(asset.created_at).toLocaleDateString()}
                      <Tag className="h-3 w-3 ml-2" />
                      {asset.framework}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => { setSelectedAsset(asset); setViewDialogOpen(true) }}>
                        <Eye className="h-4 w-4 mr-1" />View
                      </Button>
                      <Button size="sm" variant="default" onClick={() => handleAction(asset.id, "approve")} disabled={processing}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => { setSelectedAsset(asset); setRejectDialogOpen(true) }} disabled={processing}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{selectedAsset?.title}</DialogTitle></DialogHeader>
          {selectedAsset && (
            <div className="space-y-6">
              <img src={selectedAsset.image_url || "/placeholder.svg"} alt={selectedAsset.title} className="w-full h-64 object-cover rounded-lg" />
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-muted-foreground">Type</p><Badge className="capitalize">{selectedAsset.type}</Badge></div>
                <div><p className="text-sm text-muted-foreground">Framework</p><Badge variant="outline">{selectedAsset.framework}</Badge></div>
              </div>
              <div><h3 className="font-bold mb-2">Description</h3><FormattedText content={selectedAsset.description} /></div>
              {selectedAsset.features && <div><h3 className="font-bold mb-2">Features</h3><FormattedText content={selectedAsset.features} /></div>}
              {selectedAsset.installation && <div><h3 className="font-bold mb-2">Installation</h3><FormattedText content={selectedAsset.installation} /></div>}
              {selectedAsset.changelog && <div><h3 className="font-bold mb-2">Changelog</h3><FormattedText content={selectedAsset.changelog} /></div>}
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => handleAction(selectedAsset.id, "approve")} disabled={processing}>
                  <Check className="h-4 w-4 mr-2" />Approve
                </Button>
                <Button variant="destructive" onClick={() => { setViewDialogOpen(false); setRejectDialogOpen(true) }} disabled={processing}>
                  <X className="h-4 w-4 mr-2" />Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-destructive" />Reject Asset</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Provide rejection reason. User will be notified.</p>
            <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason..." rows={4} className="resize-none" />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={() => selectedAsset && handleAction(selectedAsset.id, "reject")} disabled={processing || !rejectReason.trim()}>
                {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
