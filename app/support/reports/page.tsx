"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/components/auth-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Flag, Loader2, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface Report {
  id: string
  type: string
  reason: string
  target_id: string
  status: "pending" | "resolved" | "dismissed"
  created_at: string
  description?: string
  admin_notes?: string
}

export default function ReportsDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
      return
    }

    if (user) {
      fetch("/api/reports/user")
        .then((res) => res.json())
        .then((data) => {
          if (data.reports) setReports(data.reports)
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [user, isLoading, router])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 gap-1"><CheckCircle className="h-3 w-3" /> Resolved</Badge>
      case "dismissed":
        return <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30 gap-1"><XCircle className="h-3 w-3" /> Dismissed</Badge>
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 gap-1"><Clock className="h-3 w-3" /> Pending</Badge>
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="blur-orb" style={{ top: '10%', right: '10%', opacity: 0.15 }} />
      
      <div className="container mx-auto px-4 py-12 relative z-10 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-destructive/10">
              <Flag className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">My Reports</h1>
              <p className="text-muted-foreground">Track the status of your submitted reports</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {reports.length === 0 ? (
            <div className="glass rounded-2xl border-white/10 p-12 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mb-4">
                 <CheckCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Reports Found</h3>
              <p className="text-muted-foreground">You haven't submitted any reports yet. Thank you for keeping the community safe!</p>
            </div>
          ) : (
            reports.map((report, i) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl border-white/10 p-6 transition-all hover:bg-secondary/10"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusBadge(report.status)}
                    <span className="text-sm text-muted-foreground">
                      ID: {report.id.slice(0, 8)} • {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <Badge variant="outline" className="capitalize w-fit">
                    Type: {report.type}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    {report.reason}
                  </h3>
                  {report.description && (
                    <p className="text-sm text-muted-foreground bg-secondary/20 p-3 rounded-lg">
                      "{report.description}"
                    </p>
                  )}
                </div>

                {report.admin_notes && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-xs font-semibold text-primary mb-1">Staff Response:</p>
                    <p className="text-sm text-foreground">{report.admin_notes}</p>
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                   <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => router.push(`/asset/${report.target_id}`)}>
                      View Reported Item
                   </Button>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  )
}
