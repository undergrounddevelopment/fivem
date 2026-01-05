"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, LifeBuoy, Mic, Award, Calendar, Users, Globe, Shield } from "lucide-react"
import Link from "next/link"
import { DISCORD_LINKS } from "@/lib/constants"

type DiscordWidgetMember = {
  id: string
  username: string
  discriminator: string
  avatar_url?: string
  status?: string
}

type DiscordWidgetChannel = {
  id: string
  name: string
  position: number
}

type DiscordWidget = {
  id: string
  name: string
  instant_invite?: string
  presence_count?: number
  channels?: DiscordWidgetChannel[]
  members?: DiscordWidgetMember[]
}

const DISCORD_GUILD_ID = "1445784240750067830"

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
  const [widget, setWidget] = useState<DiscordWidget | null>(null)
  const [widgetLoading, setWidgetLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        setWidgetLoading(true)
        const res = await fetch(`/api/discord/widget?guildId=${DISCORD_GUILD_ID}`)
        const json = await res.json()
        if (!cancelled) {
          setWidget(json?.data || null)
        }
      } catch {
        if (!cancelled) {
          setWidget(null)
        }
      } finally {
        if (!cancelled) {
          setWidgetLoading(false)
        }
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Discord Servers</h1>
        <p className="text-muted-foreground">
          Connect with our community and get support
        </p>
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-3">
              <span className="truncate">Live Discord Widget</span>
              <Badge variant="secondary">Guild: {DISCORD_GUILD_ID}</Badge>
            </CardTitle>
            <CardDescription>
              {widgetLoading ? "Loading live data..." : widget ? "Live presence & members" : "Widget data unavailable"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {widget ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{widget.name}</Badge>
                  <Badge variant="secondary">Online: {widget.presence_count ?? 0}</Badge>
                  <Badge variant="secondary">Channels: {(widget.channels || []).length}</Badge>
                </div>

                {(widget.members || []).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(widget.members || []).slice(0, 10).map((m) => (
                      <div key={m.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                        <div className="h-9 w-9 rounded-full overflow-hidden bg-secondary flex items-center justify-center">
                          {m.avatar_url ? (
                            <img src={m.avatar_url} alt={m.username} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xs font-semibold">{m.username?.[0]?.toUpperCase()}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{m.username}</div>
                          <div className="text-xs text-muted-foreground truncate">{m.status || "online"}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No members available from widget.</div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Unable to load widget data.</div>
            )}
          </CardContent>
        </Card>
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
  )
}

export default DiscordPage
