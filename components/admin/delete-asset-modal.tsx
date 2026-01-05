"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Trash2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface DeleteAssetModalProps {
  assetId: string
  assetTitle: string
  onDelete: () => void
}

export function DeleteAssetModal({ assetId, assetTitle, onDelete }: DeleteAssetModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/assets/${assetId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Asset deleted successfully')
        setOpen(false)
        onDelete()
      } else {
        toast.error('Failed to delete asset')
      }
    } catch (error) {
      toast.error('Error deleting asset')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Asset
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{assetTitle}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}