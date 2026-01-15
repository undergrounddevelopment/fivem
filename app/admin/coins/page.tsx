"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Plus, Coins } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function AdminCoinsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [formData, setFormData] = useState({
    userId: '',
    amount: 0,
    description: ''
  })

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/admin/coins/transactions')
      const data = await res.json()
      setTransactions(data.transactions || [])
    } catch (error) {
      toast.error("Failed to load")
    } finally {
      setLoading(false)
    }
  }

  const handleAward = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        toast.success("Coins awarded")
        setShowDialog(false)
        setFormData({ userId: '', amount: 0, description: '' })
        fetchTransactions()
      }
    } catch (error) {
      toast.error("Failed to award")
    }
  }

  return (
    <div>
      <Link href="/admin" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Admin
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Coins className="h-6 w-6 text-primary" />
            Coins Management
          </h1>
          <p className="text-muted-foreground">Manage user coins and transactions</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Award Coins
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Award Coins</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAward} className="space-y-4">
              <div>
                <label className="text-sm font-medium">User ID (Discord ID)</label>
                <Input
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  placeholder="Enter Discord ID"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Amount</label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) })}
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Reason for award"
                  required
                />
              </div>
              <Button type="submit" className="w-full">Award Coins</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b bg-secondary/30">
                <th className="text-left py-4 px-4 text-sm font-medium">User</th>
                <th className="text-left py-4 px-4 text-sm font-medium">Amount</th>
                <th className="text-left py-4 px-4 text-sm font-medium">Type</th>
                <th className="text-left py-4 px-4 text-sm font-medium">Description</th>
                <th className="text-left py-4 px-4 text-sm font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b last:border-0 hover:bg-secondary/20">
                  <td className="py-4 px-4">{tx.user_id}</td>
                  <td className="py-4 px-4">
                    <span className={tx.amount > 0 ? 'text-success' : 'text-destructive'}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </span>
                  </td>
                  <td className="py-4 px-4">{tx.type}</td>
                  <td className="py-4 px-4">{tx.description}</td>
                  <td className="py-4 px-4 text-muted-foreground">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
