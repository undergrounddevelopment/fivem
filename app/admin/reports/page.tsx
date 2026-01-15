"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input" 
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ArrowLeft, Flag, CheckCircle, XCircle, AlertTriangle, ExternalLink, MessageSquare } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Report {
  id: string
  created_at: string
  reporter_id: string
  target_id: string
  type: string
  reason: string
  description: string
  status: 'pending' | 'resolved' | 'dismissed'
  admin_notes?: string
  reporter?: { username: string, avatar: string }
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'resolved' | 'dismissed'>('pending')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [adminNote, setAdminNote] = useState("")

  useEffect(() => {
    fetchReports()
  }, [filter])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/reports?status=${filter}`) 
      const data = await res.json()
      setReports(data.reports || [])
    } catch (error) {
      toast.error("Failed to load reports")
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (status: 'resolved' | 'dismissed') => {
    if (!selectedReport) return

    try {
      const res = await fetch(`/api/reports/${selectedReport.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status, 
          admin_notes: adminNote 
        })
      })

      if (res.ok) {
        toast.success(`Report ${status}`)
        setSelectedReport(null)
        setAdminNote("")
        fetchReports()
      }
    } catch (error) {
      toast.error("Failed to update report")
    }
  }

  return (
    <div className="min-h-screen bg-transparent relative">
       {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="blur-orb" style={{ top: '20%', right: '20%', background: 'rgba(239, 68, 68, 0.1)' }} />
      </div>

      <div className="flex items-center justify-between mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:bg-white/10 mb-4">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xs font-medium">Dashboard</span>
          </Link>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Report Center</h1>
          <p className="text-muted-foreground">Review and manage user reports.</p>
        </div>
      </div>

       <div className="flex flex-wrap gap-2 mb-6 p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
        {[
          { id: 'pending', label: 'Pending' },
          { id: 'resolved', label: 'Resolved' },
          { id: 'dismissed', label: 'Dismissed' }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            size="sm"
            onClick={() => setFilter(tab.id as any)}
            className={filter === tab.id
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
              : "text-muted-foreground hover:text-white hover:bg-white/5"
            }
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Loading...</div>
        ) : reports.length === 0 ? (
          <div className="glass rounded-xl border border-white/10 p-12 text-center">
             <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4 opacity-50" />
             <h3 className="text-lg font-medium">All Clear</h3>
             <p className="text-muted-foreground">No reports found with this status.</p>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="glass rounded-xl border border-white/10 p-6 flex flex-col md:flex-row gap-6 hover:bg-white/5 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                   <Badge variant="outline" className="border-red-500/20 text-red-500 bg-red-500/10 uppercase tracking-widest">{report.type}</Badge>
                   <span className="text-xs text-muted-foreground">{new Date(report.created_at).toLocaleString()}</span>
                </div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                   <AlertTriangle className="h-5 w-5 text-yellow-500" />
                   {report.reason}
                </h3>
                <p className="text-muted-foreground mt-2 bg-secondary/30 p-3 rounded-lg text-sm">
                  "{report.description}"
                </p>
                
                <div className="mt-4 flex items-center gap-4 text-sm">
                   <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Reporter:</span>
                      <Link href={`/profile/${report.reporter_id}`} className="hover:text-primary transition-colors">
                        {report.reporter_id}
                      </Link>
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Target ID:</span>
                      <code className="bg-black/20 px-2 py-0.5 rounded">{report.target_id}</code>
                      <Link href={`/${report.type === 'asset' ? 'asset' : 'profile'}/${report.target_id}`} target="_blank">
                         <ExternalLink className="h-3 w-3 hover:text-primary cursor-pointer" />
                      </Link>
                   </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 justify-center min-w-[200px]">
                 {report.status === 'pending' ? (
                   <>
                     <Button onClick={() => setSelectedReport(report)} className="w-full bg-primary hover:bg-primary/90">
                        Review & Take Action
                     </Button>
                   </>
                 ) : (
                   <div className="text-right">
                      <Badge className={report.status === 'resolved' ? "bg-green-500" : "bg-secondary"}>
                        {report.status.toUpperCase()}
                      </Badge>
                      {report.admin_notes && (
                        <p className="text-xs text-muted-foreground mt-2 italic">Note: {report.admin_notes}</p>
                      )}
                   </div>
                 )}
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Handle Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
             <div className="bg-secondary/30 p-4 rounded-lg text-sm">
                <p><strong>Reason:</strong> {selectedReport?.reason}</p>
                <p><strong>Description:</strong> {selectedReport?.description}</p>
             </div>
             
             <div>
                <label className="text-sm font-medium mb-1 block">Admin Actions / Notes</label>
                <Textarea 
                  placeholder="Explain actions taken (e.g., 'User banned', 'Content removed', 'False report')..." 
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="destructive" 
                  onClick={() => handleAction('resolved')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Resolved
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => handleAction('dismissed')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Dismiss Report
                </Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
