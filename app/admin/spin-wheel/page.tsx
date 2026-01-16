"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label" 
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Save, History, Trophy, UserPlus, ShieldAlert, Key } from "lucide-react"
import { ArrowLeft, Plus, Edit, Trash2, Zap, Gift, TrendingUp, Loader2, Upload, Settings, Users, Check } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

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
    image_url: "",
    color: "#343a46c2",
    is_active: true
  }
  
  const [formData, setFormData] = useState(initialFormState)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [settings, setSettings] = useState<any>({
    ticket_cost: "1",
    is_enabled: "true",
    ticket_price_coins: "500"
  })
  const [savingSettings, setSavingSettings] = useState(false)
  
  // Eligible Users & Force Wins State
  const [eligibleUsers, setEligibleUsers] = useState<any[]>([])
  const [forceWins, setForceWins] = useState<any[]>([])
  const [loadingExtras, setLoadingExtras] = useState(false)
  const [targetUserId, setTargetUserId] = useState("")
  const [grantSpins, setGrantSpins] = useState(1)
  const [forcePrizeId, setForcePrizeId] = useState("")
  const [isGranting, setIsGranting] = useState(false)
  const [isForcing, setIsForcing] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const data = new FormData()
    data.append('file', file)

    try {
      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: data
      })
      const json = await res.json()
      
      if (res.ok) {
        setFormData(prev => ({ ...prev, image_url: json.url }))
        toast.success("Image uploaded")
      } else {
        toast.error(json.error || "Upload failed")
      }
    } catch (e) {
      toast.error("Upload error")
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [prizesRes, historyRes, settingsRes] = await Promise.all([
        fetch('/api/admin/spin-wheel'),
        fetch('/api/admin/spin-wheel?type=history'),
        fetch('/api/admin/spin-wheel?type=settings')
      ])
      
      const pData = await prizesRes.json()
      const hData = await historyRes.json()
      const sData = await settingsRes.json()
      
      if (pData.prizes) setPrizes(pData.prizes)
      if (hData.history) setHistory(hData.history)
      if (sData.settings) setSettings(sData.settings)

    } catch (error) {
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
    
    fetchExtras()
  }

  const fetchExtras = async () => {
    try {
      setLoadingExtras(true)
      const [euRes, fwRes] = await Promise.all([
        fetch('/api/admin/spin-wheel/eligible-users'),
        fetch('/api/admin/spin-wheel/force-wins')
      ])
      const { eligibleUsers: euData } = await euRes.json()
      const { forceWins: fwData } = await fwRes.json()
      if (euData) setEligibleUsers(euData)
      if (fwData) setForceWins(fwData)
    } catch (e) {
      console.error("Extras load fail")
    } finally {
      setLoadingExtras(false)
    }
  }

  const handleGrantSpins = async () => {
    if (!targetUserId) return
    setIsGranting(true)
    try {
      const res = await fetch('/api/admin/spin-wheel/eligible-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: targetUserId, spins_remaining: grantSpins })
      })
      if (res.ok) {
        toast.success("Spins granted successfully")
        setTargetUserId("")
        fetchExtras()
      } else {
        const d = await res.json()
        toast.error(d.error || "Failed to grant spins")
      }
    } catch (e) {
      toast.error("Network error")
    } finally {
      setIsGranting(false)
    }
  }

  const handleForceWin = async () => {
    if (!targetUserId || !forcePrizeId) {
      toast.error("Select user and prize first")
      return
    }
    setIsForcing(true)
    try {
      const res = await fetch('/api/admin/spin-wheel/force-wins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: targetUserId, prize_id: forcePrizeId, max_uses: 1 })
      })
      if (res.ok) {
        toast.success("Force win established")
        setTargetUserId("")
        setForcePrizeId("")
        fetchExtras()
      } else {
        const d = await res.json()
        toast.error(d.error || "Failed to force win")
      }
    } catch (e) {
      toast.error("Network error")
    } finally {
      setIsForcing(false)
    }
  }

  const handleDeleteForceWin = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/spin-wheel/force-wins?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success("Force win removed")
        fetchExtras()
      }
    } catch (e) { toast.error("Delete failed") }
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

  const handleSaveSettings = async () => {
    setSavingSettings(true)
    try {
      const res = await fetch('/api/admin/spin-wheel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_settings', ...settings })
      })
      if (res.ok) {
        toast.success("Settings updated")
      } else {
        toast.error("Failed to update settings")
      }
    } catch (e) {
      toast.error("Error saving settings")
    } finally {
      setSavingSettings(false)
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
      image_url: prize.image_url || "",
      color: prize.color || "#343a46c2",
      is_active: prize.is_active
    })
    setEditingId(prize.id)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Admin
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Daily Spin Dashboard
          </h1>
          <p className="text-muted-foreground">Comprehensive management of prizes, winners, and system configuration.</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-secondary/50 p-1">
          <TabsTrigger value="overview" className="gap-2"><TrendingUp className="h-4 w-4" /> Overview</TabsTrigger>
          <TabsTrigger value="prizes" className="gap-2"><Gift className="h-4 w-4" /> Prizes</TabsTrigger>
          <TabsTrigger value="settings" className="gap-2"><Settings className="h-4 w-4" /> Config</TabsTrigger>
          <TabsTrigger value="users" className="gap-2"><Users className="h-4 w-4" /> Eligible Users</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-muted-foreground">Total Tickets Sold</p>
                  <p className="text-2xl font-bold text-primary mt-1">--</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-muted-foreground">Total Spins (History)</p>
                  <p className="text-2xl font-bold text-green-500 mt-1">{history.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-muted-foreground">System Status</p>
                  <p className={`text-2xl font-bold mt-1 ${settings.is_enabled === "true" ? "text-emerald-500" : "text-destructive"}`}>
                    {settings.is_enabled === "true" ? "Online" : "Offline"}
                  </p>
                </CardContent>
              </Card>
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><Trophy className="h-4 w-4 text-yellow-500" /> Recent Winners</CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="space-y-3">
                      {history.slice(0, 8).map((h, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/10 border border-border/50">
                           <div className="flex items-center gap-3 text-sm">
                              <img src={h.user?.avatar_url || "/placeholder.png"} className="size-8 rounded-full border border-white/5" />
                              <span className="font-bold truncate max-w-[120px]">{h.user?.username || "Unknown"}</span>
                           </div>
                           <div className="text-right">
                              <p className="text-xs font-bold text-white leading-tight">{h.prize_name}</p>
                              <p className="text-[10px] text-muted-foreground">{new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </CardContent>
              </Card>
              
              <Card>
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><Settings className="h-4 w-4" /> Quick Settings</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <Label className="text-xs">Spin Cost (Tickets)</Label>
                          <Input value={settings.ticket_cost} onChange={e => setSettings({...settings, ticket_cost: e.target.value})} />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-xs">Ticket Price (Coins)</Label>
                          <Input value={settings.ticket_price_coins} onChange={e => setSettings({...settings, ticket_price_coins: e.target.value})} />
                       </div>
                    </div>
                    <Button onClick={handleSaveSettings} className="w-full" disabled={savingSettings}>
                       {savingSettings ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                       Apply Settings
                    </Button>
                 </CardContent>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="prizes" className="space-y-4">
           <div className="flex justify-between items-center bg-secondary/20 p-4 rounded-xl border border-border/50">
              <div>
                 <h2 className="text-lg font-bold">Prize Pool</h2>
                 <p className="text-xs text-muted-foreground">Manage active rewards on the wheel.</p>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="h-4 w-4" /> Add Prize</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add New Prize</DialogTitle></DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label>Prize Name</Label>
                      <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. 100 Coins" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Type</Label>
                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                          <option value="coins">Coins</option>
                          <option value="ticket">Ticket</option>
                          <option value="item">Item</option>
                          <option value="license">License</option>
                        </select>
                      </div>
                      <div>
                        <Label>Value</Label>
                        <Input type="number" value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})} required />
                      </div>
                    </div>
                    <div>
                      <Label>Probability (%)</Label>
                      <Input type="number" value={formData.probability} onChange={e => setFormData({...formData, probability: Number(e.target.value)})} required />
                    </div>
                    <div className="flex items-center gap-2">
                        <Switch checked={formData.is_active} onCheckedChange={checked => setFormData({...formData, is_active: checked})} />
                        <Label>Active</Label>
                    </div>
                    <Button type="submit" className="w-full" disabled={saving}>{saving ? "Saving..." : (editingId ? "Update Prize" : "Create Prize")}</Button>
                  </form>
                </DialogContent>
              </Dialog>
           </div>
           
           <div className="rounded-xl border border-border bg-card overflow-hidden">
             <table className="w-full text-left">
               <thead>
                 <tr className="border-b border-border bg-secondary/30">
                   <th className="py-3 px-4 text-xs font-semibold text-muted-foreground">Prize</th>
                   <th className="py-3 px-4 text-xs font-semibold text-muted-foreground">Type</th>
                   <th className="py-3 px-4 text-xs font-semibold text-muted-foreground">Prob.</th>
                   <th className="py-3 px-4 text-xs font-semibold text-muted-foreground text-right">Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {prizes.map((p) => (
                   <tr key={p.id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                     <td className="py-3 px-4 font-medium text-sm">{p.name}</td>
                     <td className="py-3 px-4"><Badge variant="outline" className="text-[10px] uppercase">{p.type}</Badge></td>
                     <td className="py-3 px-4 text-sm font-mono">{p.probability}%</td>
                     <td className="py-3 px-4 text-right flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)} className="h-8 w-8"><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </TabsContent>

        <TabsContent value="settings">
           <Card>
              <CardHeader>
                 <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" /> Detailed Winners Log</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-left">
                       <thead className="bg-secondary/30 border-b border-border">
                          <tr>
                             <th className="py-3 px-4 text-xs font-bold text-muted-foreground">User</th>
                             <th className="py-3 px-4 text-xs font-bold text-muted-foreground">Prize</th>
                             <th className="py-3 px-4 text-xs font-bold text-muted-foreground">Date</th>
                          </tr>
                       </thead>
                       <tbody>
                          {history.map((h, i) => (
                             <tr key={i} className="border-b border-border/50 text-sm">
                                <td className="py-2.5 px-4 font-bold">{h.user?.username || "Unknown"}</td>
                                <td className="py-2.5 px-4">{h.prize_name}</td>
                                <td className="py-2.5 px-4 text-muted-foreground text-xs">{new Date(h.created_at).toLocaleString()}</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="users">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <Card className="border-primary/20 shadow-lg shadow-primary/5">
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2 text-xl italic"><Users className="h-5 w-5 text-primary" /> Elite Privilege Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                     <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-4">
                        <div className="space-y-2">
                           <Label className="text-xs uppercase tracking-widest font-bold">Target User (Discord ID or Database ID)</Label>
                           <Input 
                              placeholder="Enter ID..." 
                              value={targetUserId} 
                              onChange={e => setTargetUserId(e.target.value)}
                              className="bg-background/50"
                           />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <Label className="text-xs uppercase tracking-widest font-bold">Grant Spins</Label>
                              <Input type="number" value={grantSpins} onChange={e => setGrantSpins(Number(e.target.value))} />
                           </div>
                           <div className="flex items-end">
                              <Button onClick={handleGrantSpins} className="w-full gap-2" disabled={isGranting}>
                                 {isGranting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                                 Grant Elite Spins
                              </Button>
                           </div>
                        </div>
                     </div>

                     <div className="p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/10 space-y-4">
                        <div className="space-y-2">
                           <Label className="text-xs uppercase tracking-widest font-bold text-yellow-500">Force Future Win</Label>
                           <select 
                              className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm"
                              value={forcePrizeId}
                              onChange={e => setForcePrizeId(e.target.value)}
                           >
                              <option value="">Select Prize to Force...</option>
                              {prizes.map(p => (
                                 <option key={p.id} value={p.id}>{p.name} ({p.probability}%)</option>
                              ))}
                           </select>
                        </div>
                        <Button onClick={handleForceWin} variant="outline" className="w-full gap-2 border-yellow-500/20 hover:bg-yellow-500/10 text-yellow-500" disabled={isForcing}>
                           {isForcing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
                           Execute Force Win
                        </Button>
                     </div>
                  </CardContent>
               </Card>

               <Card>
                  <CardHeader>
                     <CardTitle className="text-lg">Elite & Forced Queue</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className="space-y-6">
                        <div>
                           <h4 className="text-xs font-bold text-muted-foreground uppercase mb-3 tracking-widest">Active Force Wins</h4>
                           <div className="space-y-2">
                              {forceWins.length === 0 ? (
                                 <p className="text-xs text-center py-4 opacity-30 italic">No active forced wins</p>
                              ) : forceWins.map((f, i) => (
                                 <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10 transition-all hover:bg-yellow-500/10">
                                    <div className="flex items-center gap-3">
                                       <img src={f.user?.avatar || "/placeholder.png"} className="size-8 rounded-full border border-yellow-500/20" />
                                       <div>
                                          <p className="text-sm font-bold leading-none">{f.user?.username || "Discord User"}</p>
                                          <p className="text-[10px] text-yellow-500 font-mono mt-1 font-bold italic">FORCED: {f.prize?.name}</p>
                                       </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteForceWin(f.id)} className="text-destructive h-8 w-8 hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                                 </div>
                              ))}
                           </div>
                        </div>

                        <div className="pt-4 border-t border-border">
                           <h4 className="text-xs font-bold text-muted-foreground uppercase mb-3 tracking-widest">Elite Eligible Users</h4>
                           <div className="space-y-2">
                              {eligibleUsers.length === 0 ? (
                                 <p className="text-xs text-center py-4 opacity-30 italic">No eligible users configured</p>
                              ) : eligibleUsers.map((e, i) => (
                                 <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 transition-all hover:bg-emerald-500/10">
                                    <div className="flex items-center gap-3">
                                       <img src={e.user?.avatar || "/placeholder.png"} className="size-8 rounded-full border border-emerald-500/20" />
                                       <div>
                                          <p className="text-sm font-bold leading-none">{e.user?.username || e.user?.name || "Premium User"}</p>
                                          <p className="text-[10px] text-emerald-500 font-bold mt-1">SPINS REMAINING: {e.spins_remaining}</p>
                                       </div>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] border-emerald-500/20 text-emerald-500 font-mono">ELITE</Badge>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </CardContent>
               </Card>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
