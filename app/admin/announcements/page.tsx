import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '@/lib/database-direct'
import { validateAdminRole } from '@/lib/security'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Edit, Trash2, Eye, Megaphone } from "lucide-react"
import Link from "next/link"

export default async function AdminAnnouncementsPage() {
  const session = await getServerSession(authOptions)
  
  if (!validateAdminRole(session)) {
    return <div>Access Denied</div>
  }

  const announcements = await getAnnouncements()

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
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-primary" />
            Announcements
          </h1>
          <p className="text-muted-foreground">Manage site-wide announcements and notifications.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Announcement
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Title</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Type</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Created</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((announcement) => (
              <tr key={announcement.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                <td className="py-4 px-4">
                  <div>
                    <span className="font-medium text-foreground">{announcement.title}</span>
                    <p className="text-sm text-muted-foreground truncate max-w-md">
                      {announcement.content}
                    </p>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <Badge 
                    variant="outline" 
                    className={
                      announcement.type === 'info' ? 'border-blue-500 text-blue-500' :
                      announcement.type === 'warning' ? 'border-yellow-500 text-yellow-500' :
                      announcement.type === 'success' ? 'border-green-500 text-green-500' :
                      'border-red-500 text-red-500'
                    }
                  >
                    {announcement.type}
                  </Badge>
                </td>
                <td className="py-4 px-4">
                  <Badge 
                    className={
                      announcement.is_active 
                        ? "bg-success/20 text-success" 
                        : "bg-secondary text-muted-foreground"
                    }
                  >
                    {announcement.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="py-4 px-4 text-muted-foreground">
                  {new Date(announcement.created_at).toLocaleDateString()}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
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