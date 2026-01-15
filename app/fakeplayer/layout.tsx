import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FakePlayer FiveM V7.0 VIP - Premium Server Spoofer",
  description:
    "FakePlayer FiveM V7.0 VIP - Advanced server spoofer tool. Add fake players to your FiveM server. Premium license required.",
  keywords: [
    "fivem fakeplayer",
    "fivem spoofer",
    "fivem tools v7",
    "fivem fake players",
    "fivem server boost",
    "fivem premium tools",
    "fivem vip tools",
    "fake player fivem",
    "server spoofer",
  ],
  openGraph: {
    title: "FakePlayer FiveM V7.0 VIP - Premium Server Spoofer",
    description: "Advanced FakePlayer spoofer tool for FiveM servers. VIP Premium access required.",
  },
}

export default function FakePlayerLayout({ children }: { children: React.ReactNode }) {
  return children
}
