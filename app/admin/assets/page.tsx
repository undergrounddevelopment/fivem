"use client"

import { useState, useEffect } from "react"
import { EditAssetModal } from "@/components/admin/edit-asset-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, CheckCircle, XCircle, Star, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function AdminAssetsPage() {
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  useEffect(() => {
    fetchAssets()
  }, [filter])

  const fetchAssets = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/assets?status=${filter}`)
      const data = await res.json()
      setAssets(data.assets || [])
    } catch (error) {
      toast.error("Failed to load assets")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/assets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      })
      if (res.ok) {
        toast.success("Asset approved")
        fetchAssets()
      }
    } catch (error) {
      toast.error("Failed to approve")
    }
  }

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/assets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' })
      })
      if (res.ok) {
        toast.success("Asset rejected")
        fetchAssets()
      }
    } catch (error) {
      toast.error("Failed to reject")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this asset?")) return
    try {
      const res = await fetch(`/api/admin/assets/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success("Asset deleted")
        fetchAssets()
      }
    } catch (error) {
      toast.error("Failed to delete")
    }
  }

  const handleFeature = async (id: string, featured: boolean) => {
    try {
      const res = await fetch(`/api/admin/assets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !featured })
      })
      if (res.ok) {
        toast.success(featured ? "Unfeatured" : "Featured")
        fetchAssets()
      }
    } catch (error) {
      toast.error("Failed to update")
    }
  }

  const stats = {
    total: assets.length,
    pending: assets.filter(a => a.status === 'pending').length,
    approved: assets.filter(a => a.status === 'approved' || a.status === 'active').length,
    rejected: assets.filter(a => a.status === 'rejected').length
  }

  return (
    <div className="min-h-screen bg-transparent relative">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="blur-orb" style={{ top: '20%', left: '10%', background: 'rgba(16, 185, 129, 0.1)' }} />
      </div>

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
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Asset Management</h1>
          <p className="text-muted-foreground">Manage and moderate community submissions.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="glass border-white/10 hover:border-white/20 transition-all hover:scale-[1.02] cursor-default">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">{stats.total}</p>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">Total Assets</p>
          </CardContent>
        </Card>
        <Card className="glass border-white/10 hover:border-yellow-500/30 transition-all hover:scale-[1.02] cursor-default">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-yellow-500">{stats.pending}</p>
            <p className="text-xs font-medium text-yellow-500/70 uppercase tracking-widest mt-1">Pending Review</p>
          </CardContent>
        </Card>
        <Card className="glass border-white/10 hover:border-green-500/30 transition-all hover:scale-[1.02] cursor-default">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-green-500">{stats.approved}</p>
            <p className="text-xs font-medium text-green-500/70 uppercase tracking-widest mt-1">Active / Approved</p>
          </CardContent>
        </Card>
        <Card className="glass border-white/10 hover:border-red-500/30 transition-all hover:scale-[1.02] cursor-default">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-red-500">{stats.rejected}</p>
            <p className="text-xs font-medium text-red-500/70 uppercase tracking-widest mt-1">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
        {[
          { id: 'all', label: 'All Assets' },
          { id: 'pending', label: 'Pending Review' },
          { id: 'approved', label: 'Approved' },
          { id: 'rejected', label: 'Rejected' }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            size="sm"
            onClick={() => setFilter(tab.id as any)}
            className={filter === tab.id
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
              : "text-muted-foreground hover:text-white hover:bg-white/5"
            }
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="glass rounded-xl border border-white/10 overflow-hidden shadow-2xl shadow-black/20 min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 text-muted-foreground animate-pulse">
            <div className="h-10 w-10 bg-white/10 rounded-lg mb-4" />
            <p>Loading assets...</p>
          </div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-muted-foreground">
            <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
              <Eye className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-lg font-medium">No assets found</p>
            <p className="text-sm">Try changing the filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Asset Details</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Pricing</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-right py-4 px-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="relative h-12 w-16 rounded-lg overflow-hidden ring-1 ring-white/10 shrink-0 group-hover:ring-primary/50 transition-all">
                          <img src={asset.thumbnail || '/placeholder.svg'} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate max-w-[200px]" title={asset.title}>{asset.title}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]">by {asset.author?.username || 'Unknown'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant="outline" className="bg-secondary/30 border-white/10 text-muted-foreground">
                        {asset.category}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium">
                      {asset.coin_price > 0 ? (
                        <span className="text-yellow-500">{asset.coin_price} Coins</span>
                      ) : (
                        <span className="text-muted-foreground">Free</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <Badge className={
                        asset.status === 'approved' || asset.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20' :
                          asset.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20' :
                            'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'
                      }>
                        {asset.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      {/* Edit button */}
                      <EditAssetModal asset={asset} onUpdate={fetchAssets} />
                        <Link href={`/asset/${asset.id}`} target="_blank">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-400"><Eye className="h-4 w-4" /></Button>
                        </Link>

                        {asset.status === 'pending' && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleApprove(asset.id)} className="h-8 w-8 hover:text-green-500 hover:bg-green-500/10">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleReject(asset.id)} className="h-8 w-8 hover:text-red-500 hover:bg-red-500/10">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleFeature(asset.id, asset.is_featured)}
                          className={asset.is_featured ? "h-8 w-8 text-yellow-500 hover:text-yellow-400 bg-yellow-500/10" : "h-8 w-8 hover:text-yellow-500"}
                        >
                          <Star className={`h-4 w-4 ${asset.is_featured ? 'fill-current' : ''}`} />
                        </Button>

                        <Button variant="ghost" size="icon" onClick={() => handleDelete(asset.id)} className="h-8 w-8 hover:text-red-500 hover:bg-red-500/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
