"use client"

import { motion } from "framer-motion"
import { HelpCircle, ChevronDown, Rocket, CreditCard, Shield, Code } from "lucide-react"
import { useState } from "react"
import { SITE_NAME } from "@/lib/constants"
import { cn } from "@/lib/utils"

export default function FAQPage() {
  const categories = [
    {
      id: "general",
      name: "General",
      icon: Rocket,
      questions: [
        {
          q: `What is ${SITE_NAME}?`,
          a: `${SITE_NAME} is a premium community platform for FiveM resources. We provide high-quality scripts, MLOs, vehicles, and tools for server owners and developers.`
        },
        {
          q: "How do I download assets?",
          a: "Simply browse our catalog, select an asset, and click the download button. Some assets are free, while others require a specific membership tier or coins."
        },
        {
          q: "Is it safe to use?",
          a: "Yes! All assets are scanned for malware and backdoors before being published. We prioritize the security of your server."
        }
      ]
    },
    {
      id: "membership",
      name: "Membership & Coins",
      icon: CreditCard,
      questions: [
        {
          q: "How do I get coins?",
          a: "You can earn coins by being active on the forum, posting helpful content, claiming daily rewards, or purchasing coin packs directly."
        },
        {
          q: "What are the benefits of VIP?",
          a: "VIP members get ad-free browsing, faster download speeds, exclusive access to premium assets, and a special badge on their profile."
        }
      ]
    },
    {
      id: "technical",
      name: "Technical Support",
      icon: Code,
      questions: [
        {
          q: "My script isn't working, can you help?",
          a: "We offer basic support for installation. If a script has a bug, please report it via the 'Report' button on the asset page or ask the community in the Forum."
        },
        {
          q: "Do you offer installation services?",
          a: "Not currently. We provide comprehensive documentation for most resources to help you install them yourself."
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Ambience */}
      <div className="blur-orb" style={{ top: '10%', left: '50%', opacity: 0.2 }} />

      <div className="container mx-auto px-4 py-16 relative z-10 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-6 ring-1 ring-primary/20">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">Frequency Asked Questions</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about our platform, membership, and resources.
          </p>
        </motion.div>

        <div className="space-y-8">
          {categories.map((category, catIndex) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIndex * 0.1 }}
              className="glass rounded-2xl p-6 md:p-8 border-white/10"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-secondary/30">
                  <category.icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold">{category.name}</h2>
              </div>

              <div className="space-y-4">
                {category.questions.map((item, index) => (
                  <FAQItem key={index} question={item.q} answer={item.a} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground">
            Can't find what you're looking for?{" "}
            <a href="/messages" className="text-primary hover:underline font-medium">Contact Support</a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-white/5 rounded-xl bg-secondary/10 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-4 text-left transition-colors hover:bg-secondary/20"
      >
        <span className="font-medium text-foreground">{question}</span>
        <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
      </button>
      <div 
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="p-4 pt-0 text-muted-foreground text-sm leading-relaxed border-t border-white/5 bg-secondary/5">
          {answer}
        </div>
      </div>
    </div>
  )
}
