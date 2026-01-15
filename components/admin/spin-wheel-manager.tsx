"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import {
  Plus,
  Pencil,
  Trash2,
  Coins,
  Loader2,
  RefreshCw,
  Percent,
  Palette,
  TrendingUp,
  Users,
  Sparkles,
} from "lucide-react"

interface Prize {
  id: string
  name: string
  coins: number
  color: string
  probability: number
  rarity: string
  is_active: boolean
  sort_order: number
  win_count: number
}

interface SpinStats {
  totalSpins: number
  totalCoinsWon: number
  uniqueSpinners: number
  todaySpins: number
  todayCoinsWon: number
  avgCoinsPerSpin: number
  mostWonPrize: string
}

const RARITY_OPTIONS = [
  { value: "common", label: "Common", color: "#6b7280" },
  { value: "uncommon", label: "Uncommon", color: "#22c55e" },
  { value: "rare", label: "Rare", color: "#3b82f6" },
  { value: "epic", label: "Epic", color: "#a855f7" },
  { value: "legendary", label: "Legendary", color: "#eab308" },
]

const COLOR_OPTIONS = [
  "#6b7280",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#eab308",
  "#ef4444",
  "#f59e0b",
  "#14b8a6",
  "#ec4899",
  "#8b5cf6",
]

export function SpinWheelManager() {
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [stats, setStats] = useState<SpinStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Prize | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    coins: 10,
    color: "#3b82f6",
    probability: 10,
    rarity: "common",
    sort_order: 0,
    is_active: true,
  })

  const fetchPrizes = useCallback(async () => {
    try {
      console.log('[SpinWheel] Fetching prizes...')
      const res = await fetch("/api/admin/spin-wheel/prizes")
      console.log('[SpinWheel] Response status:', res.status)
      const data = await res.json()
      console.log('[SpinWheel] Prizes data:', data)
      setPrizes(data.prizes || [])
    } catch (error) {
      console.error("Failed to fetch prizes:", error)
      toast.error("Failed to load prizes")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/spin-wheel/stats")
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats || data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }, [])

  useEffect(() => {
    fetchPrizes()
    fetchStats()
  }, [fetchPrizes, fetchStats])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error("Prize name is required")
      return
    }

    setSaving(true)

    try {
      const method = editing ? "PUT" : "POST"
      const body = editing ? { id: editing.id, ...formData } : formData

      const res = await fetch("/api/admin/spin-wheel/prizes", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to save prize")
      }

      toast.success(editing ? "Prize updated!" : "Prize created!")
      fetchPrizes()
      setIsDialogOpen(false)
      resetForm()
    } catch (error: any) {
      toast.error(error.message || "An error occurred")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this prize?")) return

    try {
      const res = await fetch(`/api/admin/spin-wheel/prizes?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Prize deleted!")
        fetchPrizes()
      } else {
        toast.error("Failed to delete prize")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const toggleActive = async (prize: Prize) => {
    try {
      const res = await fetch("/api/admin/spin-wheel/prizes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: prize.id, is_active: !prize.is_active }),
      })

      if (res.ok) {
        toast.success(`Prize ${prize.is_active ? "disabled" : "enabled"}!`)
        fetchPrizes()
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      coins: 10,
      color: "#3b82f6",
      probability: 10,
      rarity: "common",
      sort_order: 0,
      is_active: true,
    })
    setEditing(null)
  }

  const openEditDialog = (prize: Prize) => {
    setEditing(prize)
    setFormData({
      name: prize.name,
      coins: prize.coins,
      color: prize.color,
      probability: prize.probability,
      rarity: prize.rarity,
      sort_order: prize.sort_order,
      is_active: prize.is_active,
    })
    setIsDialogOpen(true)
  }

  const totalProbability = prizes.filter((p) => p.is_active).reduce((sum, p) => sum + p.probability, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Spin Wheel Management</h2>
          <p className="text-muted-foreground text-sm mt-1">Manage prizes and view statistics</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchPrizes()
              fetchStats()
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => {
              resetForm()
              setIsDialogOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Prize
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card/50 border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Spins</p>
                  <p className="text-2xl font-bold">{stats.totalSpins.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Coins className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Coins Won</p>
                  <p className="text-2xl font-bold">{stats.totalCoinsWon.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Unique Spinners</p>
                  <p className="text-2xl font-bold">{stats.uniqueSpinners}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Coins/Spin</p>
                  <p className="text-2xl font-bold">{stats.avgCoinsPerSpin}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Probability Warning */}
      {totalProbability !== 100 && prizes.length > 0 && (
        <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
          <p className="text-sm text-yellow-500">
            Warning: Total probability is {totalProbability.toFixed(1)}%. It should be 100% for accurate distribution.
          </p>
        </div>
      )}

      {/* Prizes Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : prizes.length === 0 ? (
        <Card className="bg-card/50 border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Coins className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No prizes configured</p>
            <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
              Add Your First Prize
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prizes
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((prize) => (
              <Card key={prize.id} className="bg-card/50 border-border overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${prize.color}30` }}
                    >
                      <Coins className="h-6 w-6" style={{ color: prize.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold truncate">{prize.name}</span>
                        {!prize.is_active && <Badge variant="secondary">Inactive</Badge>}
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-yellow-500 font-bold">+{prize.coins}</span>
                        <Badge
                          variant="outline"
                          className="capitalize"
                          style={{ borderColor: prize.color, color: prize.color }}
                        >
                          {prize.rarity}
                        </Badge>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Percent className="h-3 w-3" />
                          {prize.probability}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Won {prize.win_count || 0} times</p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Switch checked={prize.is_active} onCheckedChange={() => toggleActive(prize)} />
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(prize)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(prize.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Prize" : "Create Prize"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Prize name"
                className="bg-background border-border"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Coins</Label>
                <Input
                  type="number"
                  value={formData.coins}
                  onChange={(e) =>
                    setFormData({ ...formData, coins: Math.max(0, Number.parseInt(e.target.value) || 0) })
                  }
                  className="bg-background border-border"
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label>Probability (%)</Label>
                <Input
                  type="number"
                  value={formData.probability}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      probability: Math.max(0, Math.min(100, Number.parseFloat(e.target.value) || 0)),
                    })
                  }
                  className="bg-background border-border"
                  min={0}
                  max={100}
                  step={0.1}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Rarity</Label>
              <Select value={formData.rarity} onValueChange={(value) => setFormData({ ...formData, rarity: value })}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {RARITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: opt.color }} />
                        {opt.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Color
              </Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-lg border-2 transition-transform ${formData.color === color ? "border-white scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: Number.parseInt(e.target.value) || 0 })}
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center gap-2 h-10">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <span className="text-sm">{formData.is_active ? "Active" : "Inactive"}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !formData.name.trim()}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editing ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
