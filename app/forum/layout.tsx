import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FiveM Community Forum - Discussions, Help, Requests",
  description:
    "FiveM community forum. Discuss FiveM development, get help with scripts, request resources, share your creations. Join the best FiveM community.",
  keywords: [
    "fivem forum",
    "fivem community",
    "fivem help",
    "fivem support",
    "fivem discussion",
    "fivem script help",
    "fivem requests",
    "fivem discord",
    "fivem indonesia",
    "fivem server forum",
    "qbcore help",
    "esx help",
    "fivem development",
  ],
  openGraph: {
    title: "FiveM Community Forum - Discussions & Help",
    description: "Join FiveM community. Discussions, script help, resource requests, showcase.",
  },
}

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  return children
}
