import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FiveM Upvotes Bot - Free Server Upvotes & Ranking Boost",
  description:
    "Free FiveM Upvotes Bot. Boost your FiveM server ranking with unlimited upvotes. FiveM fake players, server boost tool, upvote generator. Get more players on your FiveM server.",
  keywords: [
    "fivem upvotes",
    "fivem upvote bot",
    "fivem server upvotes",
    "fivem boost",
    "fivem fake players",
    "fivem player bot",
    "fivem ranking boost",
    "fivem server boost",
    "fivem upvote generator",
    "free fivem upvotes",
    "fivem fakeplayer",
    "fivem bot",
    "fivem server ranking",
    "boost fivem server",
    "fivem votes",
    "cfx upvotes",
  ],
  openGraph: {
    title: "FiveM Upvotes Bot - Free Server Ranking Boost",
    description: "Boost FiveM server ranking with free upvotes. Fake players, upvote bot, server boost tool.",
    images: ["https://r2.fivemanage.com/GTB2ekcdxMdnkeOh40eMi/fivembanner.gif"],
  },
}

export default function UpvotesLayout({ children }: { children: React.ReactNode }) {
  return children
}
