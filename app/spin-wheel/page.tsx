import { getSpinWheelPrizes } from '@/lib/database-direct'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Gift, Coins, Star } from "lucide-react"
import { redirect } from 'next/navigation'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SpinWheelPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/')
  }

  let prizes = []
  
  try {
    prizes = await getSpinWheelPrizes()
  } catch (error) {
    console.error('Failed to load prizes:', error)
    prizes = []
  }
  
  const activePrizes = prizes.filter(prize => prize.is_active)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3 mb-4">
            <Zap className="h-10 w-10 text-primary" />
            Spin Wheel
          </h1>
          <p className="text-muted-foreground text-lg">
            Test your luck and win amazing prizes!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Spin Wheel */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-8">
                <div className="relative">
                  {/* Wheel Container */}
                  <div className="w-80 h-80 mx-auto relative">
                    <div className="w-full h-full rounded-full border-8 border-primary bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <div className="text-center">
                        <Zap className="h-16 w-16 mx-auto text-primary mb-4" />
                        <p className="text-lg font-semibold">Ready to Spin!</p>
                        <p className="text-sm text-muted-foreground">
                          Cost: 10 coins
                        </p>
                      </div>
                    </div>
                    
                    {/* Spin Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button 
                        size="lg" 
                        className="w-24 h-24 rounded-full text-lg font-bold shadow-lg"
                        disabled={!session.user.coins || session.user.coins < 10}
                      >
                        SPIN
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Coins className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{session.user.coins || 0} Coins</span>
                    </div>
                  </div>
                  
                  {(!session.user.coins || session.user.coins < 10) && (
                    <p className="text-sm text-destructive">
                      You need at least 10 coins to spin
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Prizes */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Available Prizes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activePrizes.map((prize) => (
                    <div key={prize.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{prize.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {prize.probability}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground capitalize">
                          {prize.type}
                        </span>
                        <span className="font-semibold text-primary">
                          {prize.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Rules */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Rules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Each spin costs 10 coins</p>
                  <p>• You can spin once every 24 hours</p>
                  <p>• Prizes are awarded instantly</p>
                  <p>• Check your inventory for items</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}