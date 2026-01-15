"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Edit, Save, X } from "lucide-react"
import { toast } from "sonner"

interface Asset {
  id: string
  title: string
  description: string
  category: string
  status: string
  coin_price: number
  thumbnail?: string
}

interface EditAssetModalProps {
  asset: Asset
  onUpdate: () => void
}

export function EditAssetModal({ asset, onUpdate }: EditAssetModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<{
    title: string
    description: string
    category: string
    status: string
    coin_price: number
    thumbnail: string
    file?: File
  }>({
    title: asset.title,
    description: asset.description,
    category: asset.category,
    status: asset.status,
    coin_price: asset.coin_price,
    thumbnail: asset.thumbnail || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = new FormData()
      data.append('title', formData.title)
      data.append('description', formData.description)
      data.append('category', formData.category)
      data.append('status', formData.status)
      data.append('coin_price', formData.coin_price.toString())
      if (formData.file) {
        data.append('file', formData.file)
      }

      const response = await fetch(`/api/admin/assets/${asset.id}`, {
        method: 'PUT',
        body: data,
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('Asset updated successfully')
        setOpen(false)
        onUpdate()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update asset')
      }
    } catch (error) {
      toast.error('Error updating asset')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Asset</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="thumbnail">Thumbnail (Optional - Upload to Replace)</Label>
            <div className="flex flex-col gap-2">
              {(formData.thumbnail || formData.file) && (
                 <div className="relative h-20 w-32 rounded-lg overflow-hidden border border-white/10">
                    <img 
                      src={formData.file ? URL.createObjectURL(formData.file) : formData.thumbnail} 
                      alt="Preview" 
                      className="h-full w-full object-cover"
                    />
                 </div>
              )}
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) setFormData({ ...formData, file })
                }}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scripts">Scripts</SelectItem>
                <SelectItem value="mlo">MLO</SelectItem>
                <SelectItem value="vehicles">Vehicles</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="coin_price">Price (Coins)</Label>
            <Input
              id="coin_price"
              type="number"
              value={formData.coin_price}
              onChange={(e) => setFormData({ ...formData, coin_price: parseInt(e.target.value) || 0 })}
              min="0"
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}