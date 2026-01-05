"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, Clock, Gift, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SpinWheelPage() {
  const activities = [
    {
      emoji: "📦",
      title: "Browse Assets",
      description: "Download scripts, MLO, vehicles",
      href: "/assets",
      color: "bg-blue-500/20"
    },
    {
      emoji: "📤",
      title: "Upload Assets",
      description: "Share your creations",
      href: "/upload",
      color: "bg-green-500/20"
    },
    {
      emoji: "💬",
      title: "Join Forum",
      description: "Discuss with community",
      href: "/forum",
      color: "bg-purple-500/20"
    },
    {
      emoji: "👑",
      title: "Get Membership",
      description: "Unlock premium features",
      href: "/membership",
      color: "bg-amber-500/20"
    }
  ]

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Effects */}
      <div className="blur-orb" style={{ top: '10%', left: '10%', opacity: 0.15 }} />
      <div className="blur-orb" style={{ top: '50%', right: '5%', opacity: 0.1 }} />

      <div className="container mx-auto p-6 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Lucky Spin Wheel</h1>
          </div>
          <Badge variant="destructive" className="text-base px-4 py-2 bg-red-500/15 text-red-400 border-red-500/30">
            <Clock className="h-4 w-4 mr-2" />
            Event Berakhir
          </Badge>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Event Ended Notice */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="glass border-red-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <div className="h-10 w-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-red-400" />
                  </div>
                  Event Telah Berakhir
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Terima kasih telah berpartisipasi dalam event Lucky Spin Wheel! 
                  Event ini telah berakhir dan tidak lagi tersedia.
                </p>
                
                <div className="bg-secondary/30 p-4 rounded-xl">
                  <h4 className="font-semibold mb-3 text-sm">Informasi Event:</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                      Event berlangsung selama periode terbatas
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                      Semua hadiah telah didistribusikan
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                      Spin tickets tidak lagi dapat digunakan
                    </li>
                  </ul>
                </div>

                <Link href="/assets">
                  <Button className="w-full gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Assets
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Alternative Activities */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
                    <Gift className="h-5 w-5 text-primary" />
                  </div>
                  Aktivitas Lainnya
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Jangan khawatir! Masih banyak cara untuk mendapatkan coins dan menikmati fitur-fitur lainnya:
                </p>

                <div className="space-y-3">
                  {activities.map((activity, index) => (
                    <motion.div
                      key={activity.href}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                    >
                      <Link href={activity.href}>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start h-auto py-3 px-4 hover:bg-secondary/50 transition-all border-white/10"
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activity.color}`}>
                              <span className="text-xl">{activity.emoji}</span>
                            </div>
                            <div className="text-left flex-1">
                              <div className="font-semibold">{activity.title}</div>
                              <div className="text-xs text-muted-foreground">{activity.description}</div>
                            </div>
                          </div>
                        </Button>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Footer Message */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-8 max-w-4xl mx-auto"
        >
          <Card className="glass">
            <CardContent className="py-6 text-center">
              <p className="text-muted-foreground">
                Pantau terus untuk event-event menarik lainnya di masa depan! 
                <br />
                <span className="text-sm">Terima kasih telah menjadi bagian dari komunitas FiveM Tools V7.</span>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
