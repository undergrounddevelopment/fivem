// Advanced Discord Webhook System
import { notifyAssetUpload, notifyAdmin, logActivity, BANNER_URL, AVATAR_URL } from './discord-webhook'

const CATEGORY_EMOJIS = {
  scripts: '📜',
  mlo: '🏗️',
  vehicles: '🚗',
  clothing: '👕',
  other: '📦'
}

const FRAMEWORK_EMOJIS = {
  qbcore: '🔵',
  esx: '🟢',
  standalone: '⚪',
  other: '🔘'
}

interface AdvancedWebhookOptions {
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  mentions?: boolean
  customMessage?: string
  additionalData?: Record<string, any>
}

// Enhanced webhook untuk berbagai event
export class AdvancedDiscordWebhook {
  private static instance: AdvancedDiscordWebhook
  private webhookUrl: string

  constructor() {
    this.webhookUrl = process.env.DISCORD_WEBHOOK_UPLOADS || ''
  }

  static getInstance(): AdvancedDiscordWebhook {
    if (!AdvancedDiscordWebhook.instance) {
      AdvancedDiscordWebhook.instance = new AdvancedDiscordWebhook()
    }
    return AdvancedDiscordWebhook.instance
  }

  // Notifikasi asset trending
  async notifyTrendingAsset(asset: any, stats: any): Promise<void> {
    if (!this.webhookUrl) return

    const categoryEmoji = CATEGORY_EMOJIS[asset.category as keyof typeof CATEGORY_EMOJIS] || CATEGORY_EMOJIS.other

    const embed = {
      title: `🔥 TRENDING ASSET ALERT!`,
      description: `**${asset.title}** sedang trending di FiveM Tools!`,
      color: 0xFF4500, // Orange red untuk trending
      fields: [
        {
          name: "📊 Statistics",
          value: `👁️ Views: ${stats.views}\n📥 Downloads: ${stats.downloads}\n⭐ Rating: ${stats.rating}/5`,
          inline: true
        },
        {
          name: "📂 Details",
          value: `${categoryEmoji} ${asset.category.toUpperCase()}\n💰 ${asset.coin_price > 0 ? `${asset.coin_price} Coins` : 'FREE'}`,
          inline: true
        },
        {
          name: "🔗 Quick Access",
          value: `[View Asset](https://www.fivemtools.net/asset/${asset.id})`,
          inline: false
        }
      ],
      thumbnail: {
        url: asset.thumbnail || 'https://r2.fivemanage.com/GTB2ekcdxMdnkeOh40eMi/logo.png'
      },
      footer: {
        text: "FiveM Tools V7 • Trending Alert",
        icon_url: "https://r2.fivemanage.com/GTB2ekcdxMdnkeOh40eMi/logo.png"
      },
      timestamp: new Date().toISOString()
    }

    const payload = {
      username: "FiveM Tools Trending Bot",
      avatar_url: "https://r2.fivemanage.com/GTB2ekcdxMdnkeOh40eMi/logo.png",
      content: `🔥 **TRENDING ALERT!** Asset populer sedang viral di community!`,
      embeds: [embed]
    }

    await this.sendWebhook(payload)
  }

  // Notifikasi milestone downloads
  async notifyDownloadMilestone(asset: any, milestone: number): Promise<void> {
    if (!this.webhookUrl) return

    const categoryEmoji = CATEGORY_EMOJIS[asset.category as keyof typeof CATEGORY_EMOJIS] || CATEGORY_EMOJIS.other

    const embed = {
      title: `🎉 MILESTONE ACHIEVED!`,
      description: `**${asset.title}** telah mencapai ${milestone.toLocaleString()} downloads!`,
      color: 0x00FF00, // Green untuk achievement
      fields: [
        {
          name: "🏆 Achievement",
          value: `${milestone.toLocaleString()} Downloads Reached!`,
          inline: true
        },
        {
          name: "📂 Asset Info",
          value: `${categoryEmoji} ${asset.category.toUpperCase()}\n👤 ${asset.author_name}`,
          inline: true
        },
        {
          name: "🎯 Next Milestone",
          value: `Target: ${(milestone * 2).toLocaleString()} downloads`,
          inline: true
        }
      ],
      thumbnail: {
        url: asset.thumbnail || 'https://r2.fivemanage.com/GTB2ekcdxMdnkeOh40eMi/logo.png'
      },
      footer: {
        text: "FiveM Tools V7 • Milestone Tracker",
        icon_url: "https://r2.fivemanage.com/GTB2ekcdxMdnkeOh40eMi/logo.png"
      },
      timestamp: new Date().toISOString()
    }

    const payload = {
      username: "FiveM Tools Achievement Bot",
      avatar_url: "https://r2.fivemanage.com/GTB2ekcdxMdnkeOh40eMi/logo.png",
      content: `🎉 **MILESTONE ALERT!** Selamat kepada creator atas pencapaian luar biasa!`,
      embeds: [embed]
    }

    await this.sendWebhook(payload)
  }

  // Notifikasi user baru bergabung
  async notifyNewUser(user: any): Promise<void> {
    if (!this.webhookUrl) return

    const embed = {
      title: `👋 Welcome New Member!`,
      description: `**${user.username}** baru saja bergabung dengan FiveM Tools!`,
      color: 0x7289DA, // Discord blue
      fields: [
        {
          name: "👤 User Info",
          value: `Username: ${user.username}\nJoined: ${new Date().toLocaleDateString('id-ID')}`,
          inline: true
        },
        {
          name: "🎯 Quick Start",
          value: `[Browse Assets](https://www.fivemtools.net/assets)\n[Upload Asset](https://www.fivemtools.net/upload)`,
          inline: true
        }
      ],
      thumbnail: {
        url: user.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'
      },
      footer: {
        text: "FiveM Tools V7 • Welcome System",
        icon_url: "https://r2.fivemanage.com/GTB2ekcdxMdnkeOh40eMi/logo.png"
      },
      timestamp: new Date().toISOString()
    }

    const payload = {
      username: "FiveM Tools Welcome Bot",
      avatar_url: "https://r2.fivemanage.com/GTB2ekcdxMdnkeOh40eMi/logo.png",
      content: `👋 **WELCOME!** Mari sambut member baru di community kita!`,
      embeds: [embed]
    }

    await this.sendWebhook(payload)
  }

  // Notifikasi daily stats
  async notifyDailyStats(stats: any): Promise<void> {
    if (!this.webhookUrl) return

    const embed = {
      title: `📊 Daily Statistics Report`,
      description: `Laporan aktivitas harian FiveM Tools`,
      color: 0x36393F, // Dark gray
      fields: [
        {
          name: "📈 Today's Activity",
          value: `📤 New Assets: ${stats.newAssets}\n📥 Total Downloads: ${stats.downloads}\n👥 New Users: ${stats.newUsers}`,
          inline: true
        },
        {
          name: "🔥 Popular Categories",
          value: `${CATEGORY_EMOJIS.scripts} Scripts: ${stats.categories.scripts}\n${CATEGORY_EMOJIS.vehicles} Vehicles: ${stats.categories.vehicles}\n${CATEGORY_EMOJIS.mlo} MLO: ${stats.categories.mlo}`,
          inline: true
        },
        {
          name: "🏆 Top Performers",
          value: `Most Downloaded: ${stats.topAsset}\nTop Creator: ${stats.topCreator}\nHighest Rated: ${stats.topRated}`,
          inline: false
        }
      ],
      footer: {
        text: "FiveM Tools V7 • Daily Report",
        icon_url: "https://r2.fivemanage.com/GTB2ekcdxMdnkeOh40eMi/logo.png"
      },
      timestamp: new Date().toISOString()
    }

    const payload = {
      username: "FiveM Tools Analytics Bot",
      avatar_url: "https://r2.fivemanage.com/GTB2ekcdxMdnkeOh40eMi/logo.png",
      content: `📊 **DAILY REPORT** - Aktivitas hari ini di FiveM Tools`,
      embeds: [embed]
    }

    await this.sendWebhook(payload)
  }

  // Notifikasi system maintenance
  async notifyMaintenance(type: 'start' | 'end', details?: string): Promise<void> {
    if (!this.webhookUrl) return

    const isStart = type === 'start'
    
    const embed = {
      title: `🔧 ${isStart ? 'MAINTENANCE STARTED' : 'MAINTENANCE COMPLETED'}`,
      description: isStart 
        ? `FiveM Tools sedang dalam maintenance. Beberapa fitur mungkin tidak tersedia sementara.`
        : `Maintenance selesai! Semua sistem kembali normal dan siap digunakan.`,
      color: isStart ? 0xFFAA00 : 0x00FF00, // Yellow untuk start, green untuk end
      fields: [
        {
          name: "⏰ Time",
          value: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
          inline: true
        },
        {
          name: "🔧 Status",
          value: isStart ? "Under Maintenance" : "Fully Operational",
          inline: true
        }
      ],
      footer: {
        text: "FiveM Tools V7 • System Status",
        icon_url: "https://r2.fivemanage.com/GTB2ekcdxMdnkeOh40eMi/logo.png"
      },
      timestamp: new Date().toISOString()
    }

    if (details) {
      embed.fields.push({
        name: "📋 Details",
        value: details,
        inline: false
      })
    }

    const payload = {
      username: "FiveM Tools System Bot",
      avatar_url: "https://r2.fivemanage.com/GTB2ekcdxMdnkeOh40eMi/logo.png",
      content: `@here 🔧 **SYSTEM ${isStart ? 'MAINTENANCE' : 'RESTORED'}**`,
      embeds: [embed]
    }

    await this.sendWebhook(payload)
  }

  // Send webhook dengan error handling
  private async sendWebhook(payload: any): Promise<boolean> {
    if (!this.webhookUrl) {
      console.log('⚠️ Discord webhook not configured')
      return false
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        console.error('Discord webhook failed:', response.status, response.statusText)
        return false
      }

      console.log('✅ Advanced Discord webhook sent successfully')
      return true
    } catch (error) {
      console.error('Advanced Discord webhook error:', error)
      return false
    }
  }
}

// Export instance
export const advancedWebhook = AdvancedDiscordWebhook.getInstance()

// Helper functions untuk easy access
export async function notifyTrending(asset: any, stats: any) {
  return advancedWebhook.notifyTrendingAsset(asset, stats)
}

export async function notifyMilestone(asset: any, milestone: number) {
  return advancedWebhook.notifyDownloadMilestone(asset, milestone)
}

export async function notifyNewMember(user: any) {
  return advancedWebhook.notifyNewUser(user)
}

export async function notifyDailyReport(stats: any) {
  return advancedWebhook.notifyDailyStats(stats)
}

export async function notifySystemMaintenance(type: 'start' | 'end', details?: string) {
  return advancedWebhook.notifyMaintenance(type, details)
}