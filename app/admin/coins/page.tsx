"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { Plus, Minus, Search, TrendingUp, Users, History, Loader2 } from "lucide-react"
import { CoinIcon } from "@/components/coin-icon"
import { getCSRFToken } from "@/lib/csrf"

interface Transaction {
  id: string
  username: string
  avatar: string | null
  type: string
  amount: number
  reason: string
  date: string
}

export default function AdminCoinsPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingTransactions, setLoadingTransactions] = useState(true)

  useEffect(() => {
    if (!isAdmin) router.push("/")
  }, [isAdmin, router])

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch("/api/users")
        const data = await res.json()
        setUsers(data.users || [])
      } catch (e) {
        console.error("Failed to load users:", e)
      }
    }
    loadUsers()
  }, [])

  useEffect(() => {
    async function loadTransactions() {
      try {
        const res = await fetch("/api/admin/coins/transactions")
        const data = await res.json()
        setTransactions(data.transactions || [])
      } catch (e) {
        setTransactions([])
      } finally {
        setLoadingTransactions(false)
      }
    }
    loadTransactions()
  }, [])

  const handleAddCoins = async () => {
    if (!selectedUser || !amount) return
    const csrfToken = getCSRFToken()
    const res = await fetch("/api/admin/coins", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
      },
      body: JSON.stringify({ userId: selectedUser.id, amount: Number.parseInt(amount), reason, action: "add" }),
    })
    const data = await res.json()
    if (res.ok) {
      setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, coins: data.totalCoins } : u)))
      setTransactions([
        {
          id: Date.now().toString(),
          username: selectedUser.username,
          avatar: selectedUser.avatar,
          type: "add",
          amount: Number.parseInt(amount),
          reason: reason || "Admin added coins",
          date: new Date().toISOString().split("T")[0],
        },
        ...transactions,
      ])
      setSelectedUser(null)
      setAmount("")
      setReason("")
    }
  }

  const handleRemoveCoins = async () => {
    if (!selectedUser || !amount) return
    const csrfToken = getCSRFToken()
    const res = await fetch("/api/admin/coins", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
      },
      body: JSON.stringify({ userId: selectedUser.id, amount: Number.parseInt(amount), reason, action: "remove" }),
    })
    const data = await res.json()
    if (res.ok) {
      setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, coins: data.totalCoins } : u)))
      setTransactions([
        {
          id: Date.now().toString(),
          username: selectedUser.username,
          avatar: selectedUser.avatar,
          type: "remove",
          amount: Number.parseInt(amount),
          reason: reason || "Admin removed coins",
          date: new Date().toISOString().split("T")[0],
        },
        ...transactions,
      ])
      setSelectedUser(null)
      setAmount("")
      setReason("")
    }
  }

  const filteredUsers = users.filter((u) => u.username?.toLowerCase().includes(searchQuery.toLowerCase()))
  const totalCoins = users.reduce((sum, u) => sum + (u.coins || 0), 0)

  if (!isAdmin) return null

  return (
    <div>
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-3">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-warning to-chart-5 flex items-center justify-center glow-sm">
                <CoinIcon size="lg" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Coin Management</h1>
                <p className="text-muted-foreground">Manage user coins and transactions</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                User List
              </h2>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-secondary/50 border-border/50 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin">
                {filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all cursor-pointer ${selectedUser?.id === u.id ? "bg-primary/20 border-2 border-primary" : "bg-secondary/30 hover:bg-secondary/50"}`}
                    onClick={() => setSelectedUser(u)}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar || "/placeholder.svg"}
                        alt={u.username}
                        className="h-10 w-10 rounded-xl object-cover"
                      />
                      <div>
                        <p className="font-medium text-foreground">{u.username}</p>
                        <Badge variant="secondary" className="text-xs">
                          {u.membership}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CoinIcon size="sm" />
                      <span className="text-lg font-bold text-warning">{u.coins || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Manage Coins</h2>
                {selectedUser ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={selectedUser.avatar || "/placeholder.svg"}
                          alt={selectedUser.username}
                          className="h-12 w-12 rounded-xl"
                        />
                        <div>
                          <p className="font-semibold text-foreground">{selectedUser.username}</p>
                          <div className="flex items-center gap-2">
                            <CoinIcon size="xs" />
                            <span className="text-sm text-warning font-bold">{selectedUser.coins || 0} coins</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Amount</label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-secondary/50 border-border/50 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Reason</label>
                      <Input
                        placeholder="Transaction reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="bg-secondary/50 border-border/50 rounded-xl"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={handleAddCoins}
                        disabled={!amount}
                        className="flex-1 bg-success hover:bg-success/90 rounded-xl gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Coins
                      </Button>
                      <Button
                        onClick={handleRemoveCoins}
                        disabled={!amount}
                        variant="destructive"
                        className="flex-1 rounded-xl gap-2"
                      >
                        <Minus className="h-4 w-4" />
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
                    {transactions.map((t) => (
                      <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                        <div className="flex items-center gap-3">
                          {t.avatar && (
                            <img
                              src={t.avatar || "/placeholder.svg"}
                              alt={t.username}
                              className="h-8 w-8 rounded-full"
                            />
                          )}
                          <div>
                            <p className="font-medium text-foreground text-sm">{t.username}</p>
                            <p className="text-xs text-muted-foreground">{t.reason || "No reason"}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${t.type === "add" ? "text-success" : "text-destructive"}`}>
                            {t.type === "add" ? "+" : "-"}
                            {t.amount}
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
    </div>
  )
}
