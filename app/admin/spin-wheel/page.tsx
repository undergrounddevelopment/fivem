"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label" 
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Plus, Edit, Trash2, Zap, Gift, TrendingUp, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function AdminSpinWheelPage() {
  const [prizes, setPrizes] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const initialFormState = {
    name: "",
    type: "coins",
    value: 0,
    probability: 10,
    is_active: true
  }
  
  const [formData, setFormData] = useState(initialFormState)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [prizesRes, historyRes] = await Promise.all([
        fetch('/api/admin/spin-wheel'),
        fetch('/api/admin/spin-wheel/history') // Need to ensure this exists or use safe fallback
      ])
      
      const prizesData = await prizesRes.json()
      setPrizes(prizesData.prizes || [])
      
      // Handle history if API exists, else empty
      if (historyRes.ok) {
        const historyData = await historyRes.json()
        setHistory(historyData.history || [])
      }

    } catch (error) {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId ? { id: editingId, ...formData } : formData
      
      const res = await fetch('/api/admin/spin-wheel', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        toast.success(editingId ? "Prize updated" : "Prize created")
        setDialogOpen(false)
        resetForm()
        fetchData()
      } else {
        throw new Error("Action failed")
      }
    } catch (error) {
      toast.error("Failed to save prize")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this prize?")) return

    try {
      const res = await fetch(`/api/admin/spin-wheel?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success("Prize deleted")
        fetchData()
      }
    } catch (error) {
      toast.error("Failed to delete")
    }
  }

  const resetForm = () => {
    setFormData(initialFormState)
    setEditingId(null)
  }

  const openEdit = (prize: any) => {
    setFormData({
      name: prize.name,
      type: prize.type,
      value: prize.value,
      probability: prize.probability,
      is_active: prize.is_active
    })
    setEditingId(prize.id)
    setDialogOpen(true)
  }

  return (
    <div>
      <Link href="/admin" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Admin
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Spin Wheel Management
          </h1>
          <p className="text-muted-foreground">Manage prizes and spin wheel settings.</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Prize
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Prize" : "New Prize"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Prize Name</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. 50 Coins"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="coins">Coins</option>
                    <option value="xp">XP</option>
                    <option value="item">Item</option>
                  </select>
                </div>
                <div>
                  <Label>Value</Label>
                  <Input 
                    type="number"
                    value={formData.value} 
                    onChange={(e) => setFormData({...formData, value: Number(e.target.value)})} 
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Probability (%)</Label>
                <Input 
                  type="number"
                  value={formData.probability} 
                  onChange={(e) => setFormData({...formData, probability: Number(e.target.value)})} 
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={formData.is_active} 
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label>Active</Label>
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Saving..." : (editingId ? "Update Prize" : "Create Prize")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Prizes Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Prizes ({prizes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <div className="p-4 text-center">Loading...</div> : (
            <div className="space-y-3">
              {prizes.slice(0, 5).map((prize) => (
                <div key={prize.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{prize.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {prize.type} • {prize.probability}% chance
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{prize.value}</Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(prize)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Spins Placeholder (or connected if API exists) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Spins
            </CardTitle>
          </CardHeader>
          <CardContent>
             {/* Simple list or placeholder if no history API yet */}
             <div className="text-muted-foreground text-center py-8">
                View functionality coming soon
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Prizes Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Prize</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Type</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Value</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Probability</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center">Loading...</td></tr>
            ) : prizes.map((prize) => (
              <tr key={prize.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                <td className="py-4 px-4">
                  <span className="font-medium text-foreground">{prize.name}</span>
                </td>
                <td className="py-4 px-4">
                  <Badge variant="outline" className="capitalize">{prize.type}</Badge>
                </td>
                <td className="py-4 px-4">
                  <span className="font-medium">{prize.value}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-muted-foreground">{prize.probability}%</span>
                </td>
                <td className="py-4 px-4">
                  <Badge className={prize.is_active ? "bg-green-500/10 text-green-500" : "bg-secondary text-muted-foreground"}>
                    {prize.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(prize)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(prize.id)}>
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
