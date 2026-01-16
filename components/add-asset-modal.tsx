"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload, CheckCircle } from "lucide-react"

interface AddAssetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddAssetModal({ open, onOpenChange }: AddAssetModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "scripts",
    framework: "standalone",
    coinPrice: "0",
    version: "1.0.0",
    downloadLink: "",
    thumbnail: "",
    tags: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch("/api/admin/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          coinPrice: parseInt(formData.coinPrice),
          tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
          version: formData.version,
        })
      })

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          onOpenChange(false)
          setSuccess(false)
          setFormData({
            title: "",
            description: "",
            category: "scripts",
            framework: "standalone",
            coinPrice: "0",
            version: "1.0.0",
            downloadLink: "",
            thumbnail: "",
            tags: "",
          })
          window.location.reload()
        }, 1500)
      }
    } catch (error) {
      console.error("Failed to add asset:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-2xl font-bold text-foreground">Add New Asset</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Complete the form below to upload a new script, MLO, or vehicle asset.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="p-6 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-success mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">Asset Added!</h2>
            <p className="text-muted-foreground">Redirecting...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
            
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Title</label>
              <Input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Asset title"
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Description</label>
              <Textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Asset description"
                className="rounded-xl min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Category</label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scripts">Scripts</SelectItem>
                    <SelectItem value="mlo">MLO</SelectItem>
                    <SelectItem value="vehicles">Vehicles</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Framework</label>
                <Select value={formData.framework} onValueChange={(v) => setFormData({ ...formData, framework: v })}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standalone">Standalone</SelectItem>
                    <SelectItem value="qbcore">QBCore</SelectItem>
                    <SelectItem value="esx">ESX</SelectItem>
                    <SelectItem value="qbox">QBox</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Coin Price</label>
                <Input
                  type="number"
                  required
                  value={formData.coinPrice}
                  onChange={(e) => setFormData({ ...formData, coinPrice: e.target.value })}
                  placeholder="0"
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Version</label>
                <Input
                  required
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="1.0.0"
                  className="rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Download Link</label>
              <Input
                required
                value={formData.downloadLink}
                onChange={(e) => setFormData({ ...formData, downloadLink: e.target.value })}
                placeholder="/uploads/asset.zip"
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Thumbnail URL</label>
              <Input
                required
                value={formData.thumbnail}
                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                placeholder="/placeholder.jpg"
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Tags (comma separated)</label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="banking, economy, qbcore"
                className="rounded-xl"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" onClick={() => onOpenChange(false)} variant="outline" className="flex-1 rounded-xl">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-primary hover:bg-primary/90 rounded-xl">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Add Asset
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
