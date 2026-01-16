"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Zap, Save, RefreshCw, Settings, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function UpvoteSettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    min_upvotes: 1,
    max_upvotes: 50000,
    default_upvotes: 100
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/upvotes/settings")
      const data = await res.json()
      setSettings({
        min_upvotes: data.min_upvotes || 1,
        max_upvotes: data.max_upvotes || 50000,
        default_upvotes: data.default_upvotes || 100
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (settings.min_upvotes >= settings.max_upvotes) {
      toast({
        title: "Invalid Values",
        description: "Minimum must be less than maximum",
        variant: "destructive"
      })
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/upvotes/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      })

      if (!res.ok) throw new Error("Failed to save")

      toast({
        title: "Success",
        description: "Settings updated successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Upvote Settings</h1>
            <p className="text-muted-foreground">Configure upvote limits and defaults</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Upvote Limits Configuration
            </CardTitle>
            <CardDescription>
              Set minimum, maximum, and default upvote values for the upvote bot system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="min">Minimum Upvotes</Label>
                <Input
                  id="min"
                  type="number"
                  min="1"
                  value={settings.min_upvotes}
                  onChange={(e) => setSettings({ ...settings, min_upvotes: parseInt(e.target.value) || 1 })}
                  className="h-12 text-lg font-mono"
                />
                <p className="text-xs text-muted-foreground">Lowest value users can select</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max">Maximum Upvotes</Label>
                <Input
                  id="max"
                  type="number"
                  min="1"
                  max="100000"
                  value={settings.max_upvotes}
                  onChange={(e) => setSettings({ ...settings, max_upvotes: parseInt(e.target.value) || 50000 })}
                  className="h-12 text-lg font-mono"
                />
                <p className="text-xs text-muted-foreground">Highest value users can select</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default">Default Upvotes</Label>
                <Input
                  id="default"
                  type="number"
                  min={settings.min_upvotes}
                  max={settings.max_upvotes}
                  value={settings.default_upvotes}
                  onChange={(e) => setSettings({ ...settings, default_upvotes: parseInt(e.target.value) || 100 })}
                  className="h-12 text-lg font-mono"
                />
                <p className="text-xs text-muted-foreground">Initial value on page load</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <AlertCircle className="w-4 h-4" />
                Preview Range
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Min: {settings.min_upvotes.toLocaleString()}</span>
                <span>Default: {settings.default_upvotes.toLocaleString()}</span>
                <span>Max: {settings.max_upvotes.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-background rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary"
                  style={{ 
                    width: `${((settings.default_upvotes - settings.min_upvotes) / (settings.max_upvotes - settings.min_upvotes)) * 100}%` 
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 h-12 text-base font-bold"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
              <Button
                onClick={fetchSettings}
                variant="outline"
                className="h-12"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium">Settings Applied Globally</p>
                <p className="text-sm text-muted-foreground">
                  These limits will be enforced on the upvote bot page slider and input fields. Users cannot exceed the maximum value you set.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
