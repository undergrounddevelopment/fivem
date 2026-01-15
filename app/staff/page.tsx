"use client"

import { motion } from "framer-motion"
import { Shield, Crown, Code, Star, ExternalLink } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface StaffMember {
  id: string
  username: string
  avatar: string | null
  membership: string
  is_admin: boolean
  reputation: number
  created_at: string
}

export default function StaffPage() {
  const [staff, setStaff] = useState<{ owners: StaffMember[], admins: StaffMember[] }>({ owners: [], admins: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStaff() {
      const supabase = createClient()
      
      // Fetch admins and owners
      const { data } = await supabase
        .from('users')
        .select('*')
        .or('membership.eq.owner,membership.eq.admin,is_admin.eq.true')
        .order('reputation', { ascending: false })

      if (data) {
        setStaff({
          owners: data.filter(u => u.membership === 'owner'),
          admins: data.filter(u => u.membership === 'admin' || (u.is_admin && u.membership !== 'owner'))
        })
      }
      setLoading(false)
    }

    fetchStaff()
  }, [])

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Ambience */}
      <div className="blur-orb" style={{ top: '20%', right: '20%', opacity: 0.15 }} />
      <div className="blur-orb" style={{ top: '60%', left: '10%', opacity: 0.1 }} />

      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-6 ring-1 ring-primary/20">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">Meet the Team</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The dedicated individuals working behind the scenes to keep FiveM Tools running smoothly and securely.
          </p>
        </motion.div>

        {/* Owners Section */}
        {staff.owners.length > 0 && (
          <div className="mb-20">
            <h2 className="text-2xl font-bold mb-8 flex items-center justify-center gap-3">
              <Crown className="h-6 w-6 text-amber-500" />
              <span className="text-amber-500">Project Leaders</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
              {staff.owners.map((member, i) => (
                <StaffCard key={member.id} member={member} role="Owner" color="amber" delay={i * 0.1} />
              ))}
            </div>
          </div>
        )}

        {/* Admins Section */}
        {loading ? (
           <div className="flex justify-center py-20">
             <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
           </div>
        ) : staff.admins.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold mb-8 flex items-center justify-center gap-3">
              <Shield className="h-6 w-6 text-red-500" />
              <span className="text-red-500">Administrators</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {staff.admins.map((member, i) => (
                <StaffCard key={member.id} member={member} role="Admin" color="red" delay={0.2 + (i * 0.1)} />
              ))}
            </div>
          </div>
        ) : (
          !loading && <div className="text-center text-muted-foreground">No admins found.</div>
        )}
      </div>
    </div>
  )
}

function StaffCard({ member, role, color, delay }: { member: StaffMember, role: string, color: string, delay: number }) {
  // Map color strings to tailwind classes carefully
  const colorClasses = {
    amber: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      text: "text-amber-500",
      ring: "group-hover:ring-amber-500/50"
    },
    red: {
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      text: "text-red-500",
      ring: "group-hover:ring-red-500/50"
    }
  }
  const theme = colorClasses[color as keyof typeof colorClasses]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`glass group relative overflow-hidden rounded-2xl p-6 border transition-all hover:-translate-y-1 ${theme.bg} ${theme.border}`}
    >
      <div className="flex flex-col items-center text-center relative z-10">
        <div className={`relative w-24 h-24 mb-4 rounded-full p-1 ring-2 ring-white/10 ${theme.ring} transition-all`}>
          <Image
            src={member.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${member.username}`}
            alt={member.username}
            fill
            className="rounded-full object-cover"
          />
          <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1.5 shadow-lg border border-white/10">
            {role === 'Owner' ? <Crown className="h-4 w-4 text-amber-500" /> : <Shield className="h-4 w-4 text-red-500" />}
          </div>
        </div>

        <h3 className="text-xl font-bold mb-1">{member.username}</h3>
        <Badge variant="outline" className={`mb-4 ${theme.text} ${theme.border}`}>
          {role}
        </Badge>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground w-full justify-center border-t border-white/5 pt-4">
          <div className="flex flex-col items-center">
            <span className="font-bold text-foreground">{member.reputation || 0}</span>
            <span className="text-xs">Reputation</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="font-bold text-foreground">{new Date(member.created_at).getFullYear()}</span>
            <span className="text-xs">Joined</span>
          </div>
        </div>

        <Link 
          href={`/profile/${member.id}`}
          className="mt-6 inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          View Profile <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Decorative gradient */}
      <div className={`absolute inset-0 bg-gradient-to-t from-${color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
    </motion.div>
  )
}
