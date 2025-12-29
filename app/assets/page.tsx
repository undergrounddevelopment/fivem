import { getAssets } from '@/lib/database-direct'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Download, Star, Eye, Filter } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AssetsPage() {
  let assets = []
  
  try {
    assets = await getAssets()
  } catch (error) {
    console.error('Failed to load assets:', error)
    // Return empty array if database fails during build
    assets = []
  }
  
  const activeAssets = assets.filter(asset => asset.status === 'active' || asset.status === 'approved')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Browse Assets</h1>
          <p className="text-muted-foreground">Discover amazing FiveM resources</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search assets..." className="pl-10 w-64" />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {['All', 'Scripts', 'MLO', 'Vehicles', 'Clothing'].map((category) => (
          <Button
            key={category}
            variant={category === 'All' ? 'default' : 'outline'}
            size="sm"
            className="whitespace-nowrap"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {activeAssets.map((asset) => (
          <Card key={asset.id} className="group hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div className="relative aspect-video overflow-hidden rounded-t-lg">
                {asset.thumbnail ? (
                  <Image
                    src={asset.thumbnail}
                    alt={asset.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <div className="w-16 h-16 bg-muted-foreground/20 rounded" />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="capitalize">
                    {asset.category}
                  </Badge>
                </div>
                <div className="absolute top-2 right-2">
                  <Badge variant="outline" className="bg-background/80">
                    {asset.coin_price || 0} coins
                  </Badge>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-1">{asset.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {asset.description}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      {asset.downloads || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      {asset.rating || 0}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {asset.framework || 'Standalone'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
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
                    <span className="text-sm text-muted-foreground">
                      {asset.users?.username || 'Unknown'}
                    </span>
                  </div>
                  
                  <Link href={`/asset/${asset.id}`}>
                    <Button size="sm" className="gap-2">
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {activeAssets.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No assets found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}