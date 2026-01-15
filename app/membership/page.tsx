"use client"

import { motion } from "framer-motion"
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
  Info,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { RewarblePaymentModal } from "@/components/membership/payment-modal"
import { useState, useEffect } from "react"
import { useStatsStore } from "@/lib/store"
import { formatNumber } from "@/lib/utils"

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
  const { stats: globalStats } = useStatsStore()

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState({ name: "Lifetime VIP", price: "$50" })

  const liveStats = [
    { value: formatNumber(globalStats.totalMembers) + "+", label: "VIP Members" },
    { value: formatNumber(globalStats.totalAssets) + "+", label: "Assets Available" },
    { value: "99.9%", label: "Uptime" },
    { value: "24/7", label: "Support" },
  ]

  const handleUpgrade = (plan?: any) => {
    if (plan) {
      setSelectedPlan({ name: plan.name, price: plan.price })
    }
    setIsPaymentModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="blur-orb" style={{ top: '5%', left: '20%', opacity: 0.25 }} />
      <div className="blur-orb" style={{ top: '40%', right: '10%', opacity: 0.2 }} />
      <div className="blur-orb" style={{ top: '70%', left: '30%', opacity: 0.15 }} />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 relative"
        >
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
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12"
        >
          {liveStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="glass rounded-xl p-4 text-center card-hover border-white/10"
            >
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

          {/* Pricing Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16"
          >
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
                          onClick={() => handleUpgrade(plan)}
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
          </motion.div>

          {/* How to Get VIP Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-4xl mx-auto mb-16"
          >
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
                  <h3 className="font-semibold text-foreground mb-2">Pilih Plan</h3>
                  <p className="text-sm text-muted-foreground">Pilih paket VIP Lifetime yang sesuai dengan kebutuhan Anda.</p>
                </div>
                <div className="text-center">
                  <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Input Data & Bayar</h3>
                  <p className="text-sm text-muted-foreground">
                    Masukkan Discord ID Anda dan gunakan Rewarble Giftcard untuk melakukan pembayaran.
                  </p>
                </div>
                <div className="text-center">
                  <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Aktivasi Instan</h3>
                  <p className="text-sm text-muted-foreground">Setelah verifikasi 1-5 menit, akun VIP Anda akan diaktifkan secara otomatis.</p>
                </div>
              </div>
              <div className="mt-8 text-center">
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-12 px-8 text-base font-bold uppercase tracking-wider glow-sm"
                  onClick={() => handleUpgrade()}
                >
                  <Crown className="h-5 w-5 mr-2" />
                  Get VIP Membership Now
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-4xl mx-auto mb-16"
          >
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
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {
                  q: "Is this a one-time payment?",
                  a: "Yes! $50 is a one-time lifetime payment. You get VIP access forever with no recurring charges.",
                },
                {
                  q: "What payment methods do you accept?",
                  a: "Kami menerima pembayaran menggunakan Rewarble Giftcard (Paypal/Global) yang bisa Anda beli di G2A atau platform retail lainnya.",
                },
                {
                  q: "Berapa lama proses verifikasi?",
                  a: "Proses verifikasi otomatis/manual kami memakan waktu sekitar 1 hingga 5 menit setelah Anda memasukkan kode giftcard.",
                },
                {
                  q: "How fast will I get VIP?",
                  a: "After payment confirmation, your VIP access is activated within 5-10 minutes. Our team is available 24/7.",
                },
                {
                  q: "Is there a refund policy?",
                  a: "We offer a 7-day money-back guarantee if you're not satisfied with your VIP membership.",
                },
              ].map((faq, index) => (
                <motion.div
                  key={faq.q}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="glass rounded-xl p-5 border-white/10"
                >
                  <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <RewarblePaymentModal 
            isOpen={isPaymentModalOpen}
            onOpenChange={setIsPaymentModalOpen}
            planName={selectedPlan.name}
            planPrice={selectedPlan.price}
          />
      </div>
    </div>
  )
}
