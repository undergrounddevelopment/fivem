"use client"

import { motion } from "framer-motion"
import { Shield, Lock, FileText, AlertCircle } from "lucide-react"
import { SITE_NAME, SITE_URL } from "@/lib/constants"

export default function TermsPage() {
  const lastUpdated = "January 15, 2026"

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Ambience */}
      <div className="blur-orb" style={{ top: '10%', left: '20%', opacity: 0.15 }} />
      <div className="blur-orb" style={{ top: '60%', right: '10%', opacity: 0.1 }} />

      <div className="container mx-auto px-4 py-16 relative z-10 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-6 ring-1 ring-primary/20">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">Terms of Service</h1>
          <p className="text-xl text-muted-foreground">
            Please read these terms carefully before using {SITE_NAME}.
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
          {/* Section 1: Acceptance */}
          <div className="glass rounded-2xl p-8 border-white/10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 text-primary text-sm font-bold">1</span>
              Acceptance of Terms
            </h2>
            <div className="prose prose-invert max-w-none text-muted-foreground">
              <p>
                By accessing or using {SITE_NAME} ("we", "our", "us"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
              </p>
            </div>
          </div>

          {/* Section 2: Use License */}
          <div className="glass rounded-2xl p-8 border-white/10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 text-primary text-sm font-bold">2</span>
              Use License & Restrictions
            </h2>
            <div className="prose prose-invert max-w-none text-muted-foreground space-y-4">
              <p>
                Permission is granted to temporarily download one copy of the materials (information or software) on {SITE_NAME} for personal, non-commercial transitory viewing only.
              </p>
              <div className="bg-secondary/30 p-4 rounded-xl border-l-4 border-destructive">
                <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  You strictly may not:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Modify or copy the materials for commercial purpose.</li>
                  <li>Use the materials for any public display (commercial or non-commercial).</li>
                  <li>Attempt to decompile or reverse engineer any software contained on {SITE_NAME}.</li>
                  <li>Remove any copyright or other proprietary notations from the materials.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: Disclaimer */}
          <div className="glass rounded-2xl p-8 border-white/10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 text-primary text-sm font-bold">3</span>
              Disclaimer
            </h2>
            <div className="prose prose-invert max-w-none text-muted-foreground">
              <p>
                The materials on {SITE_NAME} are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </div>
          </div>

          {/* Section 4: User Accounts */}
          <div className="glass rounded-2xl p-8 border-white/10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 text-primary text-sm font-bold">4</span>
              User Accounts
            </h2>
            <div className="prose prose-invert max-w-none text-muted-foreground">
              <p>
                When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
              </p>
              <p className="mt-2">
                You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
              </p>
            </div>
          </div>

          {/* Section 5: Termination */}
          <div className="glass rounded-2xl p-8 border-white/10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-destructive/20 text-destructive text-sm font-bold">5</span>
              Termination
            </h2>
            <div className="prose prose-invert max-w-none text-muted-foreground">
              <p>
                We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
              <p className="mt-2">
                All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity and limitations of liability.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
