import { getSpinWheelPrizes, getSpinHistory } from '@/lib/database-direct'
import { validateAdminRole } from '@/lib/security'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Edit, Trash2, Zap, Gift, TrendingUp } from "lucide-react"
import Link from "next/link"

export default async function AdminSpinWheelPage() {
  const session = await getServerSession(authOptions)
  
  if (!validateAdminRole(session)) {
    return <div>Access Denied</div>
  }

  const [prizes, history] = await Promise.all([
    getSpinWheelPrizes(),
    getSpinHistory().then(h => h.slice(0, 10))
  ])

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
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Prize
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Prizes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Prizes ({prizes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Spins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Spins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((spin) => (
                <div key={spin.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{spin.users?.username}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(spin.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Badge variant="outline">{spin.spin_wheel_prizes?.name}</Badge>
                  </div>
                </div>
              ))}
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
            {prizes.map((prize) => (
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
                  <Badge className={prize.is_active ? "bg-success/20 text-success" : "bg-secondary text-muted-foreground"}>
                    {prize.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
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