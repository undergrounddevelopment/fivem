"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import {
  Check,
  Crown,
  Sparkles,
  Zap,
  Shield,
  Clock,
  HeadphonesIcon,
  X,
  Infinity,
  Users,
  ExternalLink,
  MessageCircle,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"

const DISCORD_INVITE = "https://discord.gg/fivemtools" // Replace with your Discord invite link

const plans = [
  {
    name: "Starter",
    description: "Perfect for testing the waters",
    price: "$0",
    period: "/forever",
    features: [
      { text: "Access to 1,500+ Free Scripts", included: true },
      { text: "3 Downloads per day", included: true },
      { text: "Standard Download Speed", included: true },
      { text: "15s Waiting Timer", included: true },
      { text: "Community Support", included: true },
      { text: "Premium Assets", included: false },
      { text: "Priority Support", included: false },
      { text: "Discord VIP Role", included: false },
    ],
    cta: "Current Plan",
    highlighted: false,
    icon: Users,
    action: "current",
  },
  {
    name: "Lifetime VIP",
    description: "One-time payment, unlimited access forever",
    price: "$50",
    period: " lifetime",
    badge: "BEST VALUE",
    features: [
      { text: "Everything in Free", included: true },
      { text: "Unlimited Downloads Forever", included: true },
      { text: "High-Speed Direct Links", included: true },
      { text: "No Waiting Timer", included: true },
      { text: "Access to All Premium Assets", included: true },
      { text: "Discord VIP Role", included: true },
      { text: "Priority Request Support", included: true },
      { text: "Early Access to New Assets", included: true },
      { text: "Lifetime Updates", included: true },
    ],
    cta: "Get VIP Now",
    highlighted: true,
    icon: Crown,
    action: "discord",
  },
]

const benefits = [
  {
    icon: Infinity,
    title: "Unlimited Downloads",
    description: "No daily limits. Download as many resources as you need, forever.",
    color: "text-primary",
  },
  {
    icon: Clock,
    title: "No Waiting Timer",
    description: "Instant access to all downloads without any delays.",
    color: "text-warning",
  },
  {
    icon: Shield,
    title: "Premium Assets",
    description: "Access to exclusive paid and leaked resources.",
    color: "text-accent",
  },
  {
    icon: HeadphonesIcon,
    title: "Priority Support",
    description: "Get help faster with priority customer support.",
    color: "text-info",
  },
]

const stats = [
  { value: "5,000+", label: "VIP Members" },
  { value: "15,000+", label: "Assets Available" },
  { value: "99.9%", label: "Uptime" },
  { value: "24/7", label: "Support" },
]

export default function MembershipPage() {
  const { user } = useAuth()

  const handleUpgrade = () => {
    window.open(DISCORD_INVITE, "_blank")
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="md:ml-72 transition-all duration-300">
        <Header />
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-12 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2 text-sm text-primary mb-6 border border-primary/30">
                <Sparkles className="h-4 w-4" />
                <span className="font-medium">UPGRADE YOUR EXPERIENCE</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Simple, Transparent <span className="gradient-text">Pricing</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join over 5,000+ server owners who use FiveM Tools to build their dream servers.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
            {stats.map((stat) => (
              <div key={stat.label} className="glass rounded-xl p-4 text-center card-hover">
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
            {plans.map((plan) => {
              const Icon = plan.icon
              const isCurrentVIP = user?.membership === "vip" || user?.membership === "admin"

              return (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl overflow-hidden ${
                    plan.highlighted ? "glass border-primary/50 glow-sm" : "glass"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                        {plan.badge}
                      </div>
                    </div>
                  )}

                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                          plan.highlighted ? "bg-primary/20" : "bg-secondary"
                        }`}
                      >
                        <Icon className={`h-6 w-6 ${plan.highlighted ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                      </div>
                    </div>

                    <div className="mb-8">
                      <span className="text-5xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature) => (
                        <li key={feature.text} className="flex items-center gap-3">
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-full shrink-0 ${
                              feature.included
                                ? plan.highlighted
                                  ? "bg-primary/20 text-primary"
                                  : "bg-success/20 text-success"
                                : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {feature.included ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          </div>
                          <span className={feature.included ? "text-foreground" : "text-muted-foreground"}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {plan.action === "discord" ? (
                      isCurrentVIP ? (
                        <Button
                          className="w-full rounded-xl h-12 text-base font-medium bg-success hover:bg-success/90 text-white"
                          size="lg"
                          disabled
                        >
                          <Check className="h-5 w-5 mr-2" />
                          Already VIP
                        </Button>
                      ) : (
                        <Button
                          className="w-full rounded-xl h-12 text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground glow-sm"
                          size="lg"
                          onClick={handleUpgrade}
                        >
                          <MessageCircle className="h-5 w-5 mr-2" />
                          {plan.cta}
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      )
                    ) : (
                      <Button
                        className="w-full rounded-xl h-12 text-base font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                        size="lg"
                        disabled
                      >
                        {plan.cta}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* How to Get VIP Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="glass rounded-2xl p-8 border-primary/30">
              <h2 className="text-2xl font-bold text-foreground text-center mb-6 flex items-center justify-center gap-2">
                <MessageCircle className="h-6 w-6 text-primary" />
                How to Get VIP Membership
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Join Discord</h3>
                  <p className="text-sm text-muted-foreground">Click the button above to join our Discord server</p>
                </div>
                <div className="text-center">
                  <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Open Ticket</h3>
                  <p className="text-sm text-muted-foreground">
                    Go to #create-ticket channel and open a VIP purchase ticket
                  </p>
                </div>
                <div className="text-center">
                  <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Get VIP Access</h3>
                  <p className="text-sm text-muted-foreground">Complete payment and receive instant VIP activation</p>
                </div>
              </div>
              <div className="mt-8 text-center">
                <Button
                  className="bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl h-12 px-8 text-base font-medium"
                  onClick={handleUpgrade}
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                  Join Discord & Open Ticket
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8 flex items-center justify-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              Why Go Premium?
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="glass rounded-xl p-5 card-hover flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-secondary/80 flex items-center justify-center shrink-0">
                    <benefit.icon className={`h-6 w-6 ${benefit.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {
                  q: "Is this a one-time payment?",
                  a: "Yes! $50 is a one-time lifetime payment. You get VIP access forever with no recurring charges.",
                },
                {
                  q: "What payment methods do you accept?",
                  a: "We accept PayPal, Credit/Debit Cards, and Cryptocurrency through our Discord ticket system.",
                },
                {
                  q: "How fast will I get VIP?",
                  a: "After payment confirmation, your VIP access is activated within 5-10 minutes. Our team is available 24/7.",
                },
                {
                  q: "Is there a refund policy?",
                  a: "We offer a 7-day money-back guarantee if you're not satisfied with your VIP membership.",
                },
              ].map((faq) => (
                <div key={faq.q} className="glass rounded-xl p-5">
                  <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
