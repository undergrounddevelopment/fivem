import { getUsers, updateUser } from '@/lib/database-direct'
import { validateAdminRole } from '@/lib/security'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, Filter, Edit, Trash2, Ban, Crown, Download, MessageSquare } from "lucide-react"
import Link from "next/link"

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)
  
  if (!validateAdminRole(session)) {
    return <div>Access Denied</div>
  }

  const users = await getUsers()

  return (
    <div>
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Admin
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage user accounts, memberships, and permissions.</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">User</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Membership</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Coins</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.username}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{user.username}</span>
                        {user.is_admin && <Crown className="h-4 w-4 text-primary" />}
                      </div>
                      <span className="text-sm text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <Badge
                    className={
                      user.membership === "admin" || user.membership === "vip"
                        ? "bg-primary/20 text-primary"
                        : "bg-secondary text-muted-foreground"
                    }
                  >
                    {user.membership?.toUpperCase() || 'FREE'}
                  </Badge>
                </td>
                <td className="py-4 px-4">
                  <span className="font-medium">{user.coins || 0}</span>
                </td>
                <td className="py-4 px-4">
                  <Badge
                    className={
                      !user.is_banned ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                    }
                  >
                    {user.is_banned ? 'banned' : 'active'}
                  </Badge>
                </td>
                <td className="py-4 px-4 text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
