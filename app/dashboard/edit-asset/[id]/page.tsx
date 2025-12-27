"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Save, X, ImageIcon, FileText, Settings, Link2, ArrowLeft, Loader2, Eye, Wand2 } from "lucide-react"
import Link from "next/link"
import { formatDescription, formatFeatures, formatInstallation, formatChangelog } from "@/lib/text-formatter"

const categories = [
  { value: "scripts", label: "Scripts" },
  { value: "mlo", label: "MLO/Maps" },
  { value: "vehicles", label: "Vehicles" },
  { value: "eup", label: "EUP/Clothing" },
  { value: "weapons", label: "Weapons" },
  { value: "sounds", label: "Sounds" },
  { value: "tools", label: "Tools" },
]

const frameworks = [
  { value: "standalone", label: "Standalone" },
  { value: "esx", label: "ESX" },
  { value: "qbcore", label: "QBCore" },
  { value: "qbox", label: "QBox" },
  { value: "vrp", label: "vRP" },
]

export default function EditAssetPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [asset, setAsset] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    features: "",
    installation: "",
    changelog: "",
    category: "scripts",
    framework: "standalone",
    version: "1.0.0",
    coinPrice: 0,
    tags: [] as string[],
    thumbnail: "",
    downloadLink: "",
    youtubeLink: "",
    githubLink: "",
    docsLink: "",
  })
  const [tagInput, setTagInput] = useState("")
  const [previewTab, setPreviewTab] = useState("description")

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const response = await fetch(`/api/assets/${resolvedParams.id}`)
        if (!response.ok) throw new Error("Asset not found")
        const data = await response.json()

        // Check ownership
        if (data.author_id !== user?.discordId) {
          toast.error("You don't have permission to edit this asset")
          router.push(`/asset/${resolvedParams.id}`)
          return
        }

        setAsset(data)
        setFormData({
          title: data.title || "",
          description: data.description || "",
          features: data.features || "",
          installation: data.installation || "",
          changelog: data.changelog || "",
          category: data.category || "scripts",
          framework: data.framework || "standalone",
          version: data.version || "1.0.0",
          coinPrice: data.coin_price || 0,
          tags: data.tags || [],
          thumbnail: data.thumbnail || "",
          downloadLink: data.download_link || "",
          youtubeLink: data.youtube_link || "",
          githubLink: data.github_link || "",
          docsLink: data.docs_link || "",
        })
      } catch (err) {
        toast.error("Failed to load asset")
        router.push("/dashboard")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchAsset()
    }
  }, [resolvedParams.id, user, router])

  const handleAutoFormat = (field: "description" | "features" | "installation" | "changelog") => {
    const formatters = {
      description: formatDescription,
      features: formatFeatures,
      installation: formatInstallation,
      changelog: formatChangelog,
    }

    const formatted = formatters[field](formData[field])
    setFormData((prev) => ({ ...prev, [field]: formatted }))
    toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} formatted!`)
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim()) && formData.tags.length < 10) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }))
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/assets/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          features: formData.features,
          installation: formData.installation,
          changelog: formData.changelog,
          category: formData.category,
          framework: formData.framework,
          version: formData.version,
          coin_price: formData.coinPrice,
          tags: formData.tags,
          thumbnail: formData.thumbnail,
          download_link: formData.downloadLink,
          youtube_link: formData.youtubeLink,
          github_link: formData.githubLink,
          docs_link: formData.docsLink,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update asset")
      }

      toast.success("Asset updated successfully!")
      router.push(`/asset/${resolvedParams.id}`)
    } catch (err: any) {
      toast.error(err.message || "Failed to update asset")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/asset/${resolvedParams.id}`}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Edit Asset</h1>
              <p className="text-muted-foreground">Update your asset details</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/asset/${resolvedParams.id}`}>
                <Eye className="h-4 w-4 mr-2" /> Preview
              </Link>
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Asset title"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(v) => setFormData((prev) => ({ ...prev, category: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Framework</Label>
                      <Select
                        value={formData.framework}
                        onValueChange={(v) => setFormData((prev) => ({ ...prev, framework: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {frameworks.map((fw) => (
                            <SelectItem key={fw.value} value={fw.value}>
                              {fw.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="version">Version</Label>
                      <Input
                        id="version"
                        value={formData.version}
                        onChange={(e) => setFormData((prev) => ({ ...prev, version: e.target.value }))}
                        placeholder="1.0.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="coinPrice">Price (Coins)</Label>
                      <Input
                        id="coinPrice"
                        type="number"
                        min="0"
                        value={formData.coinPrice}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, coinPrice: Number.parseInt(e.target.value) || 0 }))
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Content Tabs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Content
                  </CardTitle>
                  <CardDescription>
                    Use markdown formatting. Click the magic wand to auto-format your text.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={previewTab} onValueChange={setPreviewTab}>
                    <TabsList className="grid grid-cols-4 w-full">
                      <TabsTrigger value="description">Description</TabsTrigger>
                      <TabsTrigger value="features">Features</TabsTrigger>
                      <TabsTrigger value="installation">Installation</TabsTrigger>
                      <TabsTrigger value="changelog">Changelog</TabsTrigger>
                    </TabsList>

                    <TabsContent value="description" className="space-y-2 mt-4">
                      <div className="flex items-center justify-between">
                        <Label>Description *</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAutoFormat("description")}
                        >
                          <Wand2 className="h-4 w-4 mr-2" /> Auto Format
                        </Button>
                      </div>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your asset in detail..."
                        className="min-h-[250px] font-mono text-sm"
                      />
                    </TabsContent>

                    <TabsContent value="features" className="space-y-2 mt-4">
                      <div className="flex items-center justify-between">
                        <Label>Features</Label>
                        <Button type="button" variant="outline" size="sm" onClick={() => handleAutoFormat("features")}>
                          <Wand2 className="h-4 w-4 mr-2" /> Auto Format
                        </Button>
                      </div>
                      <Textarea
                        value={formData.features}
                        onChange={(e) => setFormData((prev) => ({ ...prev, features: e.target.value }))}
                        placeholder="List the features of your asset..."
                        className="min-h-[250px] font-mono text-sm"
                      />
                    </TabsContent>

                    <TabsContent value="installation" className="space-y-2 mt-4">
                      <div className="flex items-center justify-between">
                        <Label>Installation Guide</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAutoFormat("installation")}
                        >
                          <Wand2 className="h-4 w-4 mr-2" /> Auto Format
                        </Button>
                      </div>
                      <Textarea
                        value={formData.installation}
                        onChange={(e) => setFormData((prev) => ({ ...prev, installation: e.target.value }))}
                        placeholder="Explain how to install your asset..."
                        className="min-h-[250px] font-mono text-sm"
                      />
                    </TabsContent>

                    <TabsContent value="changelog" className="space-y-2 mt-4">
                      <div className="flex items-center justify-between">
                        <Label>Changelog</Label>
                        <Button type="button" variant="outline" size="sm" onClick={() => handleAutoFormat("changelog")}>
                          <Wand2 className="h-4 w-4 mr-2" /> Auto Format
                        </Button>
                      </div>
                      <Textarea
                        value={formData.changelog}
                        onChange={(e) => setFormData((prev) => ({ ...prev, changelog: e.target.value }))}
                        placeholder="Document version changes..."
                        className="min-h-[250px] font-mono text-sm"
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Thumbnail */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    Thumbnail
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.thumbnail && (
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                      <img
                        src={formData.thumbnail || "/placeholder.svg"}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <Input
                    value={formData.thumbnail}
                    onChange={(e) => setFormData((prev) => ({ ...prev, thumbnail: e.target.value }))}
                    placeholder="Thumbnail URL"
                  />
                </CardContent>
              </Card>

              {/* Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link2 className="h-5 w-5 text-primary" />
                    Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Download Link *</Label>
                    <Input
                      value={formData.downloadLink}
                      onChange={(e) => setFormData((prev) => ({ ...prev, downloadLink: e.target.value }))}
                      placeholder="https://..."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>YouTube Video</Label>
                    <Input
                      value={formData.youtubeLink}
                      onChange={(e) => setFormData((prev) => ({ ...prev, youtubeLink: e.target.value }))}
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>GitHub Repository</Label>
                    <Input
                      value={formData.githubLink}
                      onChange={(e) => setFormData((prev) => ({ ...prev, githubLink: e.target.value }))}
                      placeholder="https://github.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Documentation</Label>
                    <Input
                      value={formData.docsLink}
                      onChange={(e) => setFormData((prev) => ({ ...prev, docsLink: e.target.value }))}
                      placeholder="https://docs...."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add tag..."
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                    />
                    <Button type="button" variant="outline" onClick={handleAddTag}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
