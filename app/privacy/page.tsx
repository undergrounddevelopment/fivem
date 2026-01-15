"use client"

import { motion } from "framer-motion"
import { Lock, Eye, Database, Cookie, ShieldCheck } from "lucide-react"
import { SITE_NAME, SITE_URL } from "@/lib/constants"

export default function PrivacyPage() {
  const lastUpdated = "January 15, 2026"

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Ambience */}
      <div className="blur-orb" style={{ top: '15%', left: '10%', opacity: 0.15 }} />
      <div className="blur-orb" style={{ top: '55%', right: '15%', opacity: 0.1 }} />

      <div className="container mx-auto px-4 py-16 relative z-10 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-6 ring-1 ring-primary/20">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">Privacy Policy</h1>
          <p className="text-xl text-muted-foreground">
            We value your privacy and are committed to protecting your personal data.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Last Updated: {lastUpdated}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          {/* Section 1: Information We Collect */}
          <div className="glass rounded-2xl p-8 border-white/10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <Eye className="h-6 w-6 text-primary" />
              Information We Collect
            </h2>
            <div className="prose prose-invert max-w-none text-muted-foreground">
              <p>
                We collect information you provide directly to us when you register an account, utilize our services, or communicate with us.
              </p>
              <ul className="grid md:grid-cols-2 gap-4 mt-4">
                <li className="bg-secondary/20 p-4 rounded-xl">
                  <span className="font-semibold text-foreground block mb-1">Account Data</span>
                  Discord ID, username, and avatar from OAuth2.
                </li>
                <li className="bg-secondary/20 p-4 rounded-xl">
                  <span className="font-semibold text-foreground block mb-1">Usage Data</span>
                  Pages visited, assets downloaded, and interaction logs.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 2: How We Use Information */}
          <div className="glass rounded-2xl p-8 border-white/10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <Database className="h-6 w-6 text-primary" />
              How We Use Information
            </h2>
            <div className="prose prose-invert max-w-none text-muted-foreground">
              <ul className="space-y-2 list-disc pl-5">
                <li>To provide, maintain, and improve our services.</li>
                <li>To verify your identity via Discord OAuth.</li>
                <li>To monitor and analyze trends, usage, and activities.</li>
                <li>To detect, prevent, and address technical issues and fraud.</li>
              </ul>
            </div>
          </div>

          {/* Section 3: Cookies */}
          <div className="glass rounded-2xl p-8 border-white/10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <Cookie className="h-6 w-6 text-primary" />
              Cookies
            </h2>
            <div className="prose prose-invert max-w-none text-muted-foreground">
              <p>
                We use cookies and similar tracking technologies to track the activity on our Service and hold certain information.
              </p>
              <p className="mt-2">
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
              </p>
            </div>
          </div>

          {/* Section 4: Security */}
          <div className="glass rounded-2xl p-8 border-white/10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-primary" />
              Data Security
            </h2>
            <div className="prose prose-invert max-w-none text-muted-foreground">
              <p>
                The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
