import { getDashboardStats, getUsers, getAssets } from '@/lib/database-direct'
import { validateAdminRole } from '@/lib/security'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  Package,
  Megaphone,
  Image as ImageIcon,
  TrendingUp,
  Activity,
  Download,
  Star,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  if (!validateAdminRole(session)) {
    return <div>Access Denied</div>
  }

  const [stats, recentUsers, recentAssets] = await Promise.all([
    getDashboardStats(),
    getUsers().then(users => users.slice(0, 5)),
    getAssets().then(assets => assets.slice(0, 5))
  ])


  return (
    <div className="space-y-8 min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/40">
            Admin Intelligence
          </h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Platform overview and high-level command protocol
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass px-4 py-2 rounded-2xl border-white/10 flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-white/70">System Operational</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {[
          { label: "Total Users", value: stats.users, icon: Users, color: "blue", sub: "Registered members" },
          { label: "Total Assets", value: stats.assets, icon: Package, color: "purple", sub: "Resources & scripts" },
          { label: "Announcements", value: stats.announcements, icon: Megaphone, color: "pink", sub: "Public broadcasts" },
          { label: "Active Banners", value: stats.banners, icon: ImageIcon, color: "amber", sub: "Marketing assets" }
        ].map((item, i) => (
          <Card key={i} className="glass-morphism border-white/5 hover:border-white/20 transition-all duration-500 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/50">{item.label}</CardTitle>
              <div className={`h-10 w-10 rounded-xl bg-${item.color}-500/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <item.icon className={`h-5 w-5 text-${item.color}-500`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight text-white">{item.value.toLocaleString()}</div>
              <p className="text-xs text-white/30 mt-1">{item.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {/* Recent Users */}
        <Card className="glass border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Latest registered members</CardDescription>
              </div>
              <Link href="/admin/users">
                <Button variant="ghost" size="sm" className="gap-2 hover:bg-white/5">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden bg-secondary ring-2 ring-white/10">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-primary/20 flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{user.username}</p>
                        <Badge
                          variant={user.is_admin ? "default" : "secondary"}
                          className="text-[10px] h-5"
                        >
                          {user.is_admin ? "Admin" : user.membership || "Free"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Assets */}
        <Card className="glass border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Assets</CardTitle>
                <CardDescription>Latest uploaded resources</CardDescription>
              </div>
              <Link href="/admin/assets">
                <Button variant="ghost" size="sm" className="gap-2 hover:bg-white/5">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAssets.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-16 rounded-md overflow-hidden bg-secondary ring-1 ring-white/10">
                      {asset.thumbnail ? (
                        <img
                          src={asset.thumbnail}
                          alt={asset.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-muted-foreground/20 flex items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate max-w-[150px]">{asset.title}</p>
                        <Badge
                          variant={
                            asset.status === "active" || asset.status === "approved" ? "default" :
                              asset.status === "pending" ? "secondary" : "destructive"
                          }
                          className="text-[10px] h-5"
                        >
                          {asset.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground capitalize">
                        {asset.category} • {asset.coin_price || 0} coins
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-primary rounded-full" />
          <h2 className="text-xl font-bold text-white">Administrative Control</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Manage Users", href: "/admin/users", icon: Users, color: "blue", desc: "Permissions & Bans" },
            { label: "Review Assets", href: "/admin/assets", icon: Package, color: "purple", desc: "Moderation Queue" },
            { label: "Reports", href: "/admin/reports", icon: Megaphone, color: "red", desc: "User Complaints" },
            { label: "Announcements", href: "/admin/announcements", icon: Megaphone, color: "pink", desc: "Global Alerts" },
            { label: "Analytics", href: "/admin/analytics", icon: TrendingUp, color: "amber", desc: "Growth Insights" }
          ].map((action, i) => (
            <Link key={i} href={action.href}>
              <Button variant="outline" className="w-full gap-4 h-auto py-8 flex-col border-white/5 bg-white/[0.02] hover:bg-white/[0.08] hover:border-white/20 transition-all group rounded-[2rem]">
                <div className={`h-14 w-14 rounded-2xl bg-${action.color}-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-${action.color}-500/20 transition-all shadow-xl`}>
                  <action.icon className={`h-7 w-7 text-${action.color}-500`} />
                </div>
                <div className="text-center">
                  <span className="block font-bold text-white text-base">{action.label}</span>
                  <span className="text-[10px] text-white/40 font-medium uppercase tracking-widest mt-1">{action.desc}</span>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </section>
    </div >
  )
}
