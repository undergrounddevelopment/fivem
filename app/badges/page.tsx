"use client"

import { motion } from "framer-motion"
import { Trophy, Shield, Crown, Zap, Gift, CheckCircle, Lock } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const BADGES = [
  { 
    id: "1", 
    name: "Beginner", 
    description: "Start your journey. Required XP: 0", 
    image_url: "/badges/badge1.png", 
    min_xp: 0, 
    max_xp: 999, 
    color: "from-lime-400 to-lime-600",
    icon: Zap
  },
  { 
    id: "2", 
    name: "Intermediate", 
    description: "Rising star. Required XP: 1,000", 
    image_url: "/badges/badge2.png", 
    min_xp: 1000, 
    max_xp: 4999, 
    color: "from-blue-400 to-blue-600",
    icon: Shield
  },
  { 
    id: "3", 
    name: "Advanced", 
    description: "Skilled member. Required XP: 5,000", 
    image_url: "/badges/badge3.png", 
    min_xp: 5000, 
    max_xp: 14999, 
    color: "from-purple-400 to-purple-600",
    icon: StarIcon
  },
  { 
    id: "4", 
    name: "Expert", 
    description: "Elite status. Required XP: 15,000", 
    image_url: "/badges/badge4.png", 
    min_xp: 15000, 
    max_xp: 49999, 
    color: "from-red-400 to-red-600",
    icon: Trophy
  },
  { 
    id: "5", 
    name: "Legend", 
    description: "Legendary status. Required XP: 50,000", 
    image_url: "/badges/badge5.png", 
    min_xp: 50000, 
    max_xp: 9999999, 
    color: "from-amber-400 to-amber-600",
    icon: Crown
  }
]

// Helper function since I missed importing Star
function StarIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

export default function BadgesPage() {
  const { user } = useAuth()
  const userXp = user?.xp || 0

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="blur-orb" style={{ top: '10%', right: '20%', opacity: 0.15 }} />
      <div className="blur-orb" style={{ top: '60%', left: '10%', opacity: 0.15 }} />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            Achievements
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Badges & Ranks
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
             Complete activities, earn XP, and unlock exclusive badges to showcase your status in the community.
          </p>

          {!user && (
            <div className="mt-6">
              <Link href="/login">
                <Button>Login to track your progress</Button>
              </Link>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {BADGES.map((badge, index) => {
             const isUnlocked = userXp >= badge.min_xp
             const isNext = !isUnlocked && (index === 0 || userXp >= BADGES[index-1].min_xp)
             const progress = Math.min(100, Math.max(0, ((userXp - (index > 0 ? BADGES[index-1].max_xp : 0)) / (badge.min_xp - (index > 0 ? BADGES[index-1].max_xp : 0))) * 100))
             // Fix progress calculation logic simplified for visuals:
             const simpleProgress = isUnlocked ? 100 : Math.min(100, (userXp / badge.min_xp) * 100)

             return (
               <motion.div
                 key={badge.id}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: index * 0.1 }}
                 className={`relative glass rounded-2xl border-white/10 p-6 overflow-hidden group ${isUnlocked ? 'border-primary/30' : 'opacity-80'}`}
               >
                 {isUnlocked && (
                   <div className="absolute top-4 right-4 text-green-500">
                     <CheckCircle className="h-6 w-6" />
                   </div>
                 )}
                 {!isUnlocked && (
                   <div className="absolute top-4 right-4 text-muted-foreground/50">
                     <Lock className="h-6 w-6" />
                   </div>
                 )}

                 <div className="flex flex-col items-center text-center z-10 relative">
                   <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center mb-4 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform`}>
                     <badge.icon className="h-10 w-10 text-white" />
                   </div>
                   
                   <h3 className="text-xl font-bold mb-1">{badge.name}</h3>
                   <p className="text-sm text-primary font-semibold mb-2">{badge.min_xp.toLocaleString()} XP</p>
                   <p className="text-sm text-muted-foreground mb-6">{badge.description}</p>

                   {user && !isUnlocked && (
                     <div className="w-full space-y-2">
                       <div className="flex justify-between text-xs text-muted-foreground">
                         <span>Progress</span>
                         <span>{Math.round(simpleProgress)}%</span>
                       </div>
                       <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                         <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${simpleProgress}%` }} />
                       </div>
                       <p className="text-xs text-muted-foreground mt-1">
                         {Math.max(0, badge.min_xp - userXp).toLocaleString()} XP to unlock
                       </p>
                     </div>
                   )}
                   
                   {isUnlocked && (
                     <div className="w-full mt-auto pt-4">
                       <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 w-full justify-center py-1">
                         Unlocked
                       </Badge>
                     </div>
                   )}
                 </div>
                 
                 {/* Background Glow */}
                 <div className={`absolute inset-0 bg-gradient-to-b ${badge.color} opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none`} />
               </motion.div>
             )
          })}
        </div>
      </div>
    </div>
  )
}
