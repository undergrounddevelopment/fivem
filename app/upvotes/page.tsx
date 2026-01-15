import { Metadata } from 'next'
import { UpvoteBotClient } from '@/components/upvote-bot-client'

export const metadata: Metadata = {
  title: "FiveM Upvote Bot | Free Server Boost",
  description: "Boost your FiveM server ranking with our automated upvote tool.",
}

export default async function UpvotesPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center pt-20 pb-20">

      {/* Background FX */}
      <div className="blur-orb" style={{ top: '10%', right: '20%', opacity: 0.15, background: 'radial-gradient(circle, rgba(234,179,8,1) 0%, rgba(0,0,0,0) 70%)' }} />
      <div className="blur-orb" style={{ bottom: '20%', left: '10%', opacity: 0.1 }} />

      <UpvoteBotClient />
    </div>
  )
}
