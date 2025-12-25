"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, LifeBuoy, Mic, Award, Calendar, Users, Globe, Shield } from "lucide-react"
import Link from "next/link"
import { DISCORD_LINKS } from "@/lib/constants"

const serverData = [
  {
    id: "community",
    name: "Community Server",
    description: "Main hub for discussions, announcements, and community events",
    link: DISCORD_LINKS.COMMUNITY,
    members: "12,500+",
    features: ["Community Events", "Asset Showcase", "Feedback Forums", "Trading Zone"],
    channels: [
      { name: "announcements", description: "Important updates and news", icon: Calendar },
      { name: "general-chat", description: "Casual conversations", icon: Users },
      { name: "showcase", description: "Display your creations", icon: Award },
      { name: "trading", description: "Buy and sell assets", icon: Globe },
    ]
  },
  {
    id: "support",
    name: "Support Server",
    description: "Technical assistance and troubleshooting",
    link: DISCORD_LINKS.SUPPORT,
    members: "3,200+",
    features: ["24/7 Support", "Tech Assistance", "Bug Reports", "Script Help"],
    channels: [
      { name: "support-tickets", description: "Create support tickets", icon: Shield },
      { name: "scripting-help", description: "Coding assistance", icon: Mic },
      { name: "bug-reports", description: "Report issues", icon: Calendar },
      { name: "documentation", description: "Resource guides", icon: Award },
    ]
  }
]

const DiscordPage = () => {
  const activeServerData = serverData[0]

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="md:ml-72 transition-all duration-300">
        <Header />
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Discord Servers</h1>
            <p className="text-muted-foreground">
              Connect with our community and get support
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Server Cards */}
              {serverData.map((server) => (
                <Card key={server.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{server.name}</CardTitle>
                        <CardDescription>{server.description}</CardDescription>
                      </div>
                      <Badge variant="secondary">{server.members} members</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-6">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium leading-none">
                          {server.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {server.description}
                        </p>
                      </div>
                      <Link href={server.link} target="_blank" rel="noopener noreferrer">
                        <Button size="lg" className="gap-2">
                          <MessageCircle className="h-4 w-4" />
                          Join Server
                        </Button>
                      </Link>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="font-semibold text-lg text-foreground mb-3">Key Features</h3>
                      <div className="flex flex-wrap gap-2">
                        {server.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="px-3 py-1.5">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg text-foreground mb-3">Popular Channels</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {server.channels.map((channel, index) => (
                          <div key={index} className="flex items-center gap-3 rounded-lg bg-secondary/30 p-3">
                            <channel.icon className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium text-foreground">#{channel.name}</div>
                              <div className="text-sm text-muted-foreground">{channel.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Benefits Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Why Join Our Discord?</CardTitle>
                  <CardDescription>
                    Connect with thousands of FiveM developers and server owners
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-lg border border-border p-4">
                      <div className="mb-3 rounded-lg bg-blue-500/10 p-2 w-fit">
                        <Mic className="h-5 w-5 text-blue-500" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">Real-Time Support</h3>
                      <p className="text-sm text-muted-foreground">
                        Get instant help from our support team and community experts.
                      </p>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                      <div className="mb-3 rounded-lg bg-green-500/10 p-2 w-fit">
                        <Award className="h-5 w-5 text-green-500" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">Exclusive Access</h3>
                      <p className="text-sm text-muted-foreground">
                        Early access to new assets, beta releases, and special events.
                      </p>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                      <div className="mb-3 rounded-lg bg-purple-500/10 p-2 w-fit">
                        <Users className="h-5 w-5 text-purple-500" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">Community</h3>
                      <p className="text-sm text-muted-foreground">
                        Connect with fellow developers and server owners worldwide.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rules */}
              <Card>
                <CardHeader>
                  <CardTitle>Server Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary"></div>
                      <span>Be respectful to all members</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary"></div>
                      <span>No spam or self-promotion</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary"></div>
                      <span>Follow Discord ToS and Community Guidelines</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary"></div>
                      <span>Use appropriate channels for your discussions</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Join */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Join</CardTitle>
                  <CardDescription>
                    Instantly connect to our communities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link href={DISCORD_LINKS.COMMUNITY} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700">
                      <MessageCircle className="h-4 w-4" />
                      Community Server
                    </Button>
                  </Link>
                  <Link href={DISCORD_LINKS.SUPPORT} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full gap-2">
                      <LifeBuoy className="h-4 w-4" />
                      Support Server
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Server Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Server Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-muted-foreground">Community</span>
                        <span className="text-sm font-medium text-foreground">92% Up</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary">
                        <div className="h-2 rounded-full bg-green-500" style={{ width: "92%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-muted-foreground">Support</span>
                        <span className="text-sm font-medium text-foreground">98% Up</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary">
                        <div className="h-2 rounded-full bg-green-500" style={{ width: "98%" }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DiscordPage
