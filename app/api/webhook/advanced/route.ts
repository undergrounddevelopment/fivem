import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { 
  notifyTrending, 
  notifyMilestone, 
  notifyNewMember, 
  notifyDailyReport, 
  notifySystemMaintenance 
} from "@/lib/discord-advanced-webhook"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, data } = body

    console.log(`🚀 Advanced webhook trigger: ${type}`)

    switch (type) {
      case 'trending':
        if (!data.asset || !data.stats) {
          return NextResponse.json({ error: "Asset and stats data required" }, { status: 400 })
        }
        await notifyTrending(data.asset, data.stats)
        break

      case 'milestone':
        if (!data.asset || !data.milestone) {
          return NextResponse.json({ error: "Asset and milestone data required" }, { status: 400 })
        }
        await notifyMilestone(data.asset, data.milestone)
        break

      case 'new_member':
        if (!data.user) {
          return NextResponse.json({ error: "User data required" }, { status: 400 })
        }
        await notifyNewMember(data.user)
        break

      case 'daily_report':
        if (!data.stats) {
          return NextResponse.json({ error: "Stats data required" }, { status: 400 })
        }
        await notifyDailyReport(data.stats)
        break

      case 'maintenance':
        if (!data.action) {
          return NextResponse.json({ error: "Action (start/end) required" }, { status: 400 })
        }
        await notifySystemMaintenance(data.action, data.details)
        break

      default:
        return NextResponse.json({ error: "Invalid webhook type" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `${type} webhook sent successfully`
    })

  } catch (error: any) {
    console.error("Advanced webhook error:", error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

// GET endpoint untuk test advanced webhooks
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const testType = searchParams.get('test')

    if (!testType) {
      return NextResponse.json({
        available_tests: [
          'trending',
          'milestone', 
          'new_member',
          'daily_report',
          'maintenance_start',
          'maintenance_end'
        ],
        usage: "Add ?test=TYPE to test specific webhook"
      })
    }

    // Generate test data based on type
    let testData: any = {}

    switch (testType) {
      case 'trending':
        testData = {
          type: 'trending',
          data: {
            asset: {
              id: 'test-123',
              title: 'Advanced Police System V2',
              category: 'scripts',
              coin_price: 0,
              thumbnail: 'https://r2.fivemanage.com/GTB2ekcdxMdnkeOh40eMi/logo.png'
            },
            stats: {
              views: 15420,
              downloads: 3250,
              rating: 4.8
            }
          }
        }
        break

      case 'milestone':
        testData = {
          type: 'milestone',
          data: {
            asset: {
              id: 'test-456',
              title: 'Lamborghini Pack V3',
              category: 'vehicles',
              author_name: 'TestCreator',
              thumbnail: 'https://r2.fivemanage.com/GTB2ekcdxMdnkeOh40eMi/logo.png'
            },
            milestone: 10000
          }
        }
        break

      case 'new_member':
        testData = {
          type: 'new_member',
          data: {
            user: {
              username: 'NewFiveMUser',
              avatar: 'https://cdn.discordapp.com/embed/avatars/0.png'
            }
          }
        }
        break

      case 'daily_report':
        testData = {
          type: 'daily_report',
          data: {
            stats: {
              newAssets: 12,
              downloads: 1547,
              newUsers: 23,
              categories: {
                scripts: 8,
                vehicles: 3,
                mlo: 1
              },
              topAsset: 'Police System V2',
              topCreator: 'DevMaster',
              topRated: 'Modern MLO Pack'
            }
          }
        }
        break

      case 'maintenance_start':
        testData = {
          type: 'maintenance',
          data: {
            action: 'start',
            details: 'Scheduled maintenance untuk update database dan performance improvements. Estimasi 30 menit.'
          }
        }
        break

      case 'maintenance_end':
        testData = {
          type: 'maintenance',
          data: {
            action: 'end',
            details: 'Maintenance selesai. Added new features: advanced search, better performance, bug fixes.'
          }
        }
        break

      default:
        return NextResponse.json({ error: "Invalid test type" }, { status: 400 })
    }

    // Send test webhook
    const response = await fetch(request.url.replace('/advanced', '/advanced'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('Cookie') || ''
      },
      body: JSON.stringify(testData)
    })

    const result = await response.json()

    return NextResponse.json({
      test_type: testType,
      test_data: testData,
      result: result,
      message: `Test ${testType} webhook executed`
    })

  } catch (error: any) {
    console.error("Advanced webhook test error:", error)
    return NextResponse.json({
      error: error.message
    }, { status: 500 })
  }
}