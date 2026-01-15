
import { createClient } from './supabase/server'
import { CONFIG } from './config'
import { cache } from 'react'

export type SiteSettings = {
    linkvertise: {
        enabled: boolean
        userId: string
        baseUrl: string
    }
    features: {
        dailyCoins: number
        spinCostCoins: number
        maxSpinsPerDay: number
        newUserCoins: number
        adminCoins: number
        xpPerAction: number
        xpPerPost: number
        xpPerComment: number
    }
    discord: {
        clientId: string
        communityUrl: string
        supportUrl: string
        adminRoleId: string
    }
    rate_limits: {
        api: { limit: number; window: number }
        auth: { limit: number; window: number }
        upload: { limit: number; window: number }
        spin: { limit: number; window: number }
    }
    site_info: {
        name: string
        description: string
        logo: string
        email: string
    }
    forum: {
        title: string
        subtitle: string
        banner: string
        header_title: string
        header_subtitle: string
    }
}

// Default settings from CONFIG
const DEFAULT_SETTINGS: SiteSettings = {
    linkvertise: {
        enabled: CONFIG.linkvertise.enabled,
        userId: CONFIG.linkvertise.userId,
        baseUrl: 'https://direct-link.net'
    },
    features: CONFIG.features,
    discord: {
        clientId: CONFIG.discord.clientId,
        communityUrl: 'https://discord.gg/tZXg4GVRM5', // Default
        supportUrl: 'https://discord.gg/fivemtools', // Default
        adminRoleId: '1047719075322810378' // Default
    },
    rate_limits: CONFIG.rateLimit,
    site_info: {
        name: CONFIG.site.name,
        description: CONFIG.site.description,
        logo: CONFIG.site.logo,
        email: 'contact@fivemtools.net' // Default
    },
    forum: {
        title: "FiveM Tools",
        subtitle: "V 7.0",
        banner: "https://r2.fivemanage.com/pjW8diq5cgbXePkRb7YQg/banner1.png",
        header_title: "FiveM Community Hub",
        header_subtitle: "Join the elite community of developers, server owners, and enthusiasts."
    }
}

export const getSiteSettings = cache(async (key?: keyof SiteSettings) => {
    try {
        const supabase = await createClient()

        // If specific key requested
        if (key) {
            const { data } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', key)
                .single()

            if (data?.value) {
                return { ...DEFAULT_SETTINGS[key], ...data.value }
            }
            return DEFAULT_SETTINGS[key]
        }

        // Fetch all
        const { data: allSettings } = await supabase
            .from('site_settings')
            .select('key, value')

        if (!allSettings) return DEFAULT_SETTINGS
        
        const settings = { ...DEFAULT_SETTINGS }

        allSettings.forEach(setting => {
            if (setting.key in settings) {
                // @ts-ignore
                settings[setting.key] = { ...settings[setting.key], ...setting.value }
            }
        })

        return settings
    } catch (error) {
        console.error('Failed to fetch site settings:', error)
        return key ? DEFAULT_SETTINGS[key] : DEFAULT_SETTINGS
    }
})
