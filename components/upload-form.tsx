"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export function UploadForm() {
  const { user, isLoading } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    framework: '',
    coinPrice: 0,
    tags: [] as string[]
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return

    const form = e.currentTarget
    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement
    const file = fileInput?.files?.[0]

    if (!file) {
      alert('Please select a file')
      return
    }

    setUploading(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('title', formData.title)
      uploadFormData.append('description', formData.description)
      uploadFormData.append('category', formData.category)
      uploadFormData.append('framework', formData.framework)
      uploadFormData.append('coinPrice', formData.coinPrice.toString())
      uploadFormData.append('tags', JSON.stringify(formData.tags))

      const response = await fetch('/api/upload/asset', {
        method: 'POST',
        body: uploadFormData
      })

      const result = await response.json()

      if (result.success) {
        alert('Asset uploaded successfully!')
        form.reset()
        setFormData({
          title: '',
          description: '',
          category: '',
          framework: '',
          coinPrice: 0,
          tags: []
        })
      } else {
        alert('Upload failed: ' + result.error)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (!user) return <div>Please login to upload assets</div>

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload New Asset</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
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
              <Label htmlFor="framework">Framework</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, framework: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select framework" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="qbcore">QBCore</SelectItem>
                  <SelectItem value="esx">ESX</SelectItem>
                  <SelectItem value="standalone">Standalone</SelectItem>
                  <SelectItem value="qbox">QBox</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="coinPrice">Coin Price (0 for free)</Label>
            <Input
              id="coinPrice"
              type="number"
              min="0"
              value={formData.coinPrice}
              onChange={(e) => setFormData(prev => ({ ...prev, coinPrice: parseInt(e.target.value) || 0 }))}
            />
          </div>

          <div>
            <Label htmlFor="file">File (ZIP only)</Label>
            <Input
              id="file"
              type="file"
              accept=".zip"
              required
            />
          </div>

          <Button type="submit" disabled={uploading} className="w-full">
            {uploading ? 'Uploading...' : 'Upload Asset'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
