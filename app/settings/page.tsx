"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Settings, Image as ImageIcon, Link as LinkIcon, Save, Loader2, Github, Instagram, Youtube, Globe } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    avatar: "",
    banner: "",
    socials: {
      github: "",
      instagram: "",
      youtube: "",
      website: ""
    }
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username,
      }))
      
      fetch(`/api/profile/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setFormData(prev => ({
              ...prev,
              bio: data.user.bio || "",
              avatar: data.user.avatar || "",
              banner: data.user.banner || "",
              socials: data.user.social_links || { github: "", instagram: "", youtube: "", website: "" }
            }))
          }
        })
        .catch(console.error)
    }
  }, [user, isLoading, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name.startsWith("social_")) {
      const social = name.replace("social_", "")
      setFormData(prev => ({
        ...prev,
        socials: { ...prev.socials, [social]: value }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          username: formData.username,
          bio: formData.bio,
          avatar: formData.avatar,
          banner: formData.banner,
          social_links: formData.socials
        })
      })

      if (!res.ok) throw new Error("Failed to update profile")

      toast.success("Profile updated successfully!")
      router.refresh()
    } catch (error) {
      toast.error("Failed to save changes")
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="blur-orb" style={{ top: '10%', left: '20%', opacity: 0.15 }} />
      
      <div className="container mx-auto px-4 py-12 relative z-10 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold gradient-text mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your profile and account preferences</p>
        </motion.div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-secondary/30 p-1 rounded-xl">
            <TabsTrigger value="profile" className="rounded-lg gap-2">
              <User className="h-4 w-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="appearance" className="rounded-lg gap-2">
              <ImageIcon className="h-4 w-4" /> Appearance
            </TabsTrigger>
            <TabsTrigger value="socials" className="rounded-lg gap-2">
              <LinkIcon className="h-4 w-4" /> Socials
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="profile">
              <Card className="p-6 glass border-white/10 space-y-6">
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input 
                    name="username" 
                    value={formData.username} 
                    onChange={handleChange} 
                    className="bg-secondary/30 border-white/10"
                  />
                  <p className="text-xs text-muted-foreground">This is how you will appear to other users.</p>
                </div>

                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea 
                    name="bio" 
                    value={formData.bio} 
                    onChange={handleChange}
                    placeholder="Tell us about yourself..."
                    className="bg-secondary/30 border-white/10 min-h-[120px]"
                  />
                  <p className="text-xs text-muted-foreground">Markdown is supported.</p>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="appearance">
              <Card className="p-6 glass border-white/10 space-y-6">
                {/* Avatar Section */}
                <div className="space-y-4">
                  <Label>Avatar</Label>
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 bg-secondary">
                        {(formData.avatar || user?.avatar) ? (
                          <img 
                            src={formData.avatar || user?.avatar} 
                            alt="Avatar preview" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="h-10 w-10 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <Input 
                        name="avatar" 
                        value={formData.avatar} 
                        onChange={handleChange}
                        placeholder="https://example.com/avatar.jpg"
                        className="bg-secondary/30 border-white/10"
                      />
                      <p className="text-xs text-muted-foreground">Enter an image URL. Recommended size: 256x256px.</p>
                      <p className="text-xs text-muted-foreground">Leave empty to use your Discord avatar.</p>
                    </div>
                  </div>
                </div>

                {/* Banner Section */}
                 <div className="space-y-2">
                  <Label>Banner URL</Label>
                  <div className="flex gap-2">
                    <Input 
                      name="banner" 
                      value={formData.banner} 
                      onChange={handleChange}
                      placeholder="https://example.com/banner.jpg"
                      className="bg-secondary/30 border-white/10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Recommended size: 1200x300px. Leave empty for default.</p>
                  
                  {formData.banner && (
                    <div className="mt-4 rounded-xl overflow-hidden h-32 w-full relative group">
                      <img src={formData.banner} alt="Banner preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="socials">
              <Card className="p-6 glass border-white/10 space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2"><Github className="h-4 w-4" /> GitHub</Label>
                    <Input 
                      name="social_github" 
                      value={formData.socials.github} 
                      onChange={handleChange}
                      placeholder="username"
                      className="bg-secondary/30 border-white/10"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2"><Instagram className="h-4 w-4" /> Instagram</Label>
                    <Input 
                      name="social_instagram" 
                      value={formData.socials.instagram} 
                      onChange={handleChange}
                      placeholder="username"
                      className="bg-secondary/30 border-white/10"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2"><Youtube className="h-4 w-4" /> YouTube</Label>
                    <Input 
                      name="social_youtube" 
                      value={formData.socials.youtube} 
                      onChange={handleChange}
                      placeholder="Channel URL"
                      className="bg-secondary/30 border-white/10"
                    />
                  </div>
                   <div className="grid gap-2">
                    <Label className="flex items-center gap-2"><Globe className="h-4 w-4" /> Website</Label>
                    <Input 
                      name="social_website" 
                      value={formData.socials.website} 
                      onChange={handleChange}
                      placeholder="https://your-site.com"
                      className="bg-secondary/30 border-white/10"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <div className="flex justify-end mt-6">
              <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90 text-white min-w-[120px]">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Tabs>
      </div>
    </div>
  )
}
