"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/components/auth-provider"
import { Plus, Minus, Search, TrendingUp, Users, History, Loader2, Settings, Save, RefreshCw } from "lucide-react"
import { CoinIcon } from "@/components/coin-icon"
import { toast } from "sonner"

interface Transaction {
  id: string
  username: string
  avatar: string | null
  type: string
  amount: number
  reason: string
  date: string
}

interface CoinSettings {
  dailyReward: number
  dailyRewardEnabled: boolean
  downloadReward: number
  commentReward: number
  likeReward: number
  threadReward: number
  replyReward: number
  maxDailyEarnings: number
  premiumMultiplier: number
}

interface User {
  id: string
  username: string
  avatar: string | null
  coins: number
  membership: string
  xp?: number
  level?: number
}

export default function AdminCoinsPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingTransactions, setLoadingTransactions] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState<"users" | "settings">("users")
  const [settings, setSettings] = useState<CoinSettings>({
    dailyReward: 50,
    dailyRewardEnabled: true,
    downloadReward: 10,
    commentReward: 15,
    likeReward: 5,
    threadReward: 25,
    replyReward: 10,
    maxDailyEarnings: 500,
    premiumMultiplier: 2
  })
  const [savingSettings, setSavingSettings] = useState(false)

  useEffect(() => {
    if (!isAdmin) router.push("/")
  }, [isAdmin, router])

  const loadUsers = async () => {
    setLoadingUsers(true)
    try {
      const res = await fetch("/api/users?limit=100")
      const data = await res.json()
      setUsers(data.users || [])
    } catch (e) {
      console.error("Failed to load users:", e)
      toast.error("Failed to load users")
    } finally {
      setLoadingUsers(false)
    }
  }

  const loadTransactions = async () => {
    setLoadingTransactions(true)
    try {
      const res = await fetch("/api/admin/coins/transactions")
      const data = await res.json()
      setTransactions(data.transactions || [])
    } catch (e) {
      console.error("Failed to load transactions:", e)
    } finally {
      setLoadingTransactions(false)
    }
  }

  const loadSettings = async () => {
    try {
      const res = await fetch("/api/admin/coins")
      const data = await res.json()
      if (data.settings) {
        setSettings(data.settings)
      }
    } catch (e) {
      console.error("Failed to load settings:", e)
    }
  }

  useEffect(() => {
    loadUsers()
    loadTransactions()
    loadSettings()
  }, [])

  const handleAddCoins = async () => {
    if (!selectedUser || !amount) return
    setProcessing(true)
    try {
      const res = await fetch("/api/admin/coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser.id, amount: parseInt(amount), reason, action: "add" }),
      })
      const data = await res.json()
      if (res.ok) {
        setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, coins: data.totalCoins } : u)))
        toast.success(`Added ${amount} coins to ${selectedUser.username}`)
        loadTransactions()
        setSelectedUser(null)
        setAmount("")
        setReason("")
      } else {
        toast.error(data.error || "Failed to add coins")
      }
    } catch (e) {
      toast.error("Failed to add coins")
    } finally {
      setProcessing(false)
    }
  }

  const handleRemoveCoins = async () => {
    if (!selectedUser || !amount) return
    setProcessing(true)
    try {
      const res = await fetch("/api/admin/coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser.id, amount: parseInt(amount), reason, action: "remove" }),
      })
      const data = await res.json()
      if (res.ok) {
        setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, coins: data.totalCoins } : u)))
        toast.success(`Removed ${amount} coins from ${selectedUser.username}`)
        loadTransactions()
        setSelectedUser(null)
        setAmount("")
        setReason("")
      } else {
        toast.error(data.error || "Failed to remove coins")
      }
    } catch (e) {
      toast.error("Failed to remove coins")
    } finally {
      setProcessing(false)
    }
  }

  const handleSaveSettings = async () => {
    setSavingSettings(true)
    try {
      const res = await fetch("/api/admin/coins", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      if (res.ok) {
        toast.success("Settings saved successfully")
      } else {
        toast.error("Failed to save settings")
      }
    } catch (e) {
      toast.error("Failed to save settings")
    } finally {
      setSavingSettings(false)
    }
  }

  const filteredUsers = users.filter((u) => u.username?.toLowerCase().includes(searchQuery.toLowerCase()))
  const totalCoins = users.reduce((sum, u) => sum + (u.coins || 0), 0)

  if (!isAdmin) return null

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-warning to-chart-5 flex items-center justify-center glow-sm">
              <CoinIcon size="lg" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Coin Management</h1>
              <p className="text-muted-foreground">Manage user coins, transactions, and settings</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => { loadUsers(); loadTransactions(); }} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-warning/20 flex items-center justify-center">
              <CoinIcon size="sm" />
            </div>
            <span className="text-sm text-muted-foreground">Total Coins</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{totalCoins.toLocaleString()}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Total Users</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{users.length}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-success/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <span className="text-sm text-muted-foreground">Transactions</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{transactions.length}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <CoinIcon size="sm" />
            </div>
            <span className="text-sm text-muted-foreground">Avg Coins/User</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{users.length > 0 ? Math.round(totalCoins / users.length) : 0}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button variant={activeTab === "users" ? "default" : "outline"} onClick={() => setActiveTab("users")} className="gap-2">
          <Users className="h-4 w-4" />
          Users & Transactions
        </Button>
        <Button variant={activeTab === "settings" ? "default" : "outline"} onClick={() => setActiveTab("settings")} className="gap-2">
          <Settings className="h-4 w-4" />
          Coin Settings
        </Button>
      </div>

      {activeTab === "users" ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* User List */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              User List ({filteredUsers.length})
            </h2>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-secondary/50 border-border/50 rounded-xl" />
              </div>
            </div>
            {loadingUsers ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No users found</div>
                ) : (
                  filteredUsers.map((u) => (
                    <div key={u.id} className={`flex items-center justify-between p-4 rounded-xl transition-all cursor-pointer ${selectedUser?.id === u.id ? "bg-primary/20 border-2 border-primary" : "bg-secondary/30 hover:bg-secondary/50"}`} onClick={() => setSelectedUser(u)}>
                      <div className="flex items-center gap-3">
                        <img src={u.avatar || "/placeholder.svg"} alt={u.username} className="h-10 w-10 rounded-xl object-cover" />
                        <div>
                          <p className="font-medium text-foreground">{u.username}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">{u.membership}</Badge>
                            {u.level && <Badge variant="outline" className="text-xs">Lv.{u.level}</Badge>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CoinIcon size="sm" />
                        <span className="text-lg font-bold text-warning">{(u.coins || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Manage & Transactions */}
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Manage Coins</h2>
              {selectedUser ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                    <div className="flex items-center gap-3 mb-2">
                      <img src={selectedUser.avatar || "/placeholder.svg"} alt={selectedUser.username} className="h-12 w-12 rounded-xl" />
                      <div>
                        <p className="font-semibold text-foreground">{selectedUser.username}</p>
                        <div className="flex items-center gap-2">
                          <CoinIcon size="xs" />
                          <span className="text-sm text-warning font-bold">{(selectedUser.coins || 0).toLocaleString()} coins</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Amount</label>
                    <Input type="number" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-secondary/50 border-border/50 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Reason</label>
                    <Input placeholder="Transaction reason" value={reason} onChange={(e) => setReason(e.target.value)} className="bg-secondary/50 border-border/50 rounded-xl" />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleAddCoins} disabled={!amount || processing} className="flex-1 bg-success hover:bg-success/90 rounded-xl gap-2">
                      {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      Add Coins
                    </Button>
                    <Button onClick={handleRemoveCoins} disabled={!amount || processing} variant="destructive" className="flex-1 rounded-xl gap-2">
                      {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Minus className="h-4 w-4" />}
                      Remove Coins
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Select a user to manage coins</p>
                </div>
              )}
            </div>

            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Recent Transactions
              </h2>
              {loadingTransactions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin">
                  {transactions.slice(0, 20).map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                      <div className="flex items-center gap-3">
                        {t.avatar && <img src={t.avatar} alt={t.username} className="h-8 w-8 rounded-full" />}
                        <div>
                          <p className="font-medium text-foreground text-sm">{t.username}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]">{t.reason}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${t.type === "add" ? "text-success" : "text-destructive"}`}>
                          {t.type === "add" ? "+" : "-"}{t.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">{t.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      ) : (
        /* Settings Tab */
        <div className="glass rounded-2xl p-6 max-w-2xl">
          <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Coin Reward Settings
          </h2>
          <div className="space-y-6">
            {/* Daily Reward */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
              <div>
                <p className="font-medium text-foreground">Daily Reward</p>
                <p className="text-sm text-muted-foreground">Coins users get from daily claim</p>
              </div>
              <div className="flex items-center gap-3">
                <Input type="number" value={settings.dailyReward} onChange={(e) => setSettings({...settings, dailyReward: parseInt(e.target.value) || 0})} className="w-24 text-center" />
                <Switch checked={settings.dailyRewardEnabled} onCheckedChange={(v) => setSettings({...settings, dailyRewardEnabled: v})} />
              </div>
            </div>

            {/* Download Reward */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
              <div>
                <p className="font-medium text-foreground">Download Reward</p>
                <p className="text-sm text-muted-foreground">Coins for downloading assets</p>
              </div>
              <Input type="number" value={settings.downloadReward} onChange={(e) => setSettings({...settings, downloadReward: parseInt(e.target.value) || 0})} className="w-24 text-center" />
            </div>

            {/* Comment Reward */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
              <div>
                <p className="font-medium text-foreground">Comment Reward</p>
                <p className="text-sm text-muted-foreground">Coins for posting comments</p>
              </div>
              <Input type="number" value={settings.commentReward} onChange={(e) => setSettings({...settings, commentReward: parseInt(e.target.value) || 0})} className="w-24 text-center" />
            </div>

            {/* Like Reward */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
              <div>
                <p className="font-medium text-foreground">Like Reward</p>
                <p className="text-sm text-muted-foreground">Coins for giving likes</p>
              </div>
              <Input type="number" value={settings.likeReward} onChange={(e) => setSettings({...settings, likeReward: parseInt(e.target.value) || 0})} className="w-24 text-center" />
            </div>

            {/* Thread Reward */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
              <div>
                <p className="font-medium text-foreground">Thread Reward</p>
                <p className="text-sm text-muted-foreground">Coins for creating forum threads</p>
              </div>
              <Input type="number" value={settings.threadReward} onChange={(e) => setSettings({...settings, threadReward: parseInt(e.target.value) || 0})} className="w-24 text-center" />
            </div>

            {/* Reply Reward */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
              <div>
                <p className="font-medium text-foreground">Reply Reward</p>
                <p className="text-sm text-muted-foreground">Coins for forum replies</p>
              </div>
              <Input type="number" value={settings.replyReward} onChange={(e) => setSettings({...settings, replyReward: parseInt(e.target.value) || 0})} className="w-24 text-center" />
            </div>

            {/* Max Daily Earnings */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
              <div>
                <p className="font-medium text-foreground">Max Daily Earnings</p>
                <p className="text-sm text-muted-foreground">Maximum coins per day (0 = unlimited)</p>
              </div>
              <Input type="number" value={settings.maxDailyEarnings} onChange={(e) => setSettings({...settings, maxDailyEarnings: parseInt(e.target.value) || 0})} className="w-24 text-center" />
            </div>

            {/* Premium Multiplier */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
              <div>
                <p className="font-medium text-foreground">Premium Multiplier</p>
                <p className="text-sm text-muted-foreground">Coin multiplier for premium users</p>
              </div>
              <Input type="number" step="0.1" value={settings.premiumMultiplier} onChange={(e) => setSettings({...settings, premiumMultiplier: parseFloat(e.target.value) || 1})} className="w-24 text-center" />
            </div>

            <Button onClick={handleSaveSettings} disabled={savingSettings} className="w-full gap-2">
              {savingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Settings
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
