import { getAssets, updateAsset, deleteAsset } from '@/lib/database-direct'
import { validateAdminRole } from '@/lib/security'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Edit, Trash2, Eye, CheckCircle, XCircle, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default async function AdminAssetsPage() {
  const session = await getServerSession(authOptions)
  
  if (!validateAdminRole(session)) {
    return <div>Access Denied</div>
  }

  const assets = await getAssets()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
      case "active":
        return (
          <Badge className="bg-success/20 text-success border-success/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-warning/20 text-warning border-warning/30">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-destructive/20 text-destructive border-destructive/30">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return <Badge className="bg-secondary">{status}</Badge>
    }
  }

  return (
    <div>
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Admin
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Asset Management</h1>
          <p className="text-muted-foreground">Manage all uploaded assets and resources.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Asset
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{assets.length}</p>
          <p className="text-sm text-muted-foreground">Total Assets</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-success">{assets.filter(a => a.status === "active" || a.status === "approved").length}</p>
          <p className="text-sm text-muted-foreground">Active</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-warning">{assets.filter(a => a.status === "pending").length}</p>
          <p className="text-sm text-muted-foreground">Pending</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-destructive">{assets.filter(a => a.status === "rejected").length}</p>
          <p className="text-sm text-muted-foreground">Rejected</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Asset</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Category</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Author</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Price</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Created</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-16 rounded-lg overflow-hidden bg-secondary/50">
                      {asset.thumbnail ? (
                        <Image
                          src={asset.thumbnail}
                          alt={asset.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <div className="w-6 h-6 bg-muted-foreground/20 rounded" />
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-foreground">{asset.title}</span>
                      <p className="text-sm text-muted-foreground truncate max-w-xs">
                        {asset.description}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <Badge variant="outline" className="capitalize">{asset.category}</Badge>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="relative h-6 w-6 rounded-full overflow-hidden bg-secondary">
                      {asset.users?.avatar ? (
                        <Image
                          src={asset.users.avatar}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="h-full w-full bg-primary/20" />
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">{asset.users?.username || "Unknown"}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="font-medium">{asset.coin_price || 0} coins</span>
                </td>
                <td className="py-4 px-4">
                  {getStatusBadge(asset.status)}
                </td>
                <td className="py-4 px-4 text-muted-foreground">
                  {new Date(asset.created_at).toLocaleDateString()}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    <Link href={`/asset/${asset.id}`} target="_blank">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
