import { Metadata } from 'next'
import { UpvoteBotClient } from '@/components/upvote-bot-client'

export const metadata: Metadata = {
  title: "FiveM Upvote Bot | Free Server Boost",
  description: "Boost your FiveM server ranking with our automated upvote tool.",
}

export default async function UpvotesPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-black/50" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      
      <UpvoteBotClient />
    </div>
  )
}
