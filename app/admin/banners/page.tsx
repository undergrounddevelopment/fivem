"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { BannerManager } from "@/components/admin/banner-manager"
import { ArrowLeft, Image as ImageIcon, Loader2 } from "lucide-react"
import Link from "next/link"

export default function AdminBannersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAdmin() {
      if (status === "loading") return
      
      if (!session?.user) {
        router.push("/")
        return
      }

      try {
        const res = await fetch("/api/auth/check-admin")
        const data = await res.json()
        if (data.isAdmin) {
          setIsAdmin(true)
        } else {
          router.push("/")
        }
      } catch (error) {
        router.push("/")
      } finally {
        setLoading(false)
      }
    }
    checkAdmin()
  }, [session, status, router])

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAdmin) {
    return <div className="text-center py-8">Access Denied</div>
  }

  return (
    <div className="space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to Admin
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-primary" />
            Banner Management
          </h1>
          <p className="text-muted-foreground">Manage promotional banners and advertisements. Changes update in realtime.</p>
        </div>
      </div>

      <BannerManager />
    </div>
  )
}
