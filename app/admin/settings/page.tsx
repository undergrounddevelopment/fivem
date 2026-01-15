"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Globe, Shield, Coins, Mail, Link as LinkIcon, AlertTriangle, Loader2, MessageSquare, ExternalLink } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { SiteSettings } from "@/lib/settings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState<SiteSettings | null>(null)

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings')
            if (!res.ok) throw new Error('Failed to fetch settings')
            const data = await res.json()
            setSettings(data)
        } catch (error) {
            toast.error('Could not load settings')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!settings) return
        setSaving(true)
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            })

            if (!res.ok) throw new Error('Failed to save')
            toast.success("Settings saved successfully")
        } catch (error) {
            toast.error('Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    const handleChange = (section: keyof SiteSettings, key: string, value: any) => {
        if (!settings) return
        setSettings({
            ...settings,
            [section]: {
                // @ts-ignore
                ...settings[section],
                [key]: value
            }
        })
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!settings) return null

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
            <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-xl z-20 py-4 -my-4 px-4 -mx-4 border-b border-border/40 mb-4">
                <div className="space-y-1">
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-1"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold">Platform Settings</h1>
                </div>
                <Button onClick={handleSave} disabled={saving} className="gap-2 shadow-lg shadow-primary/20">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                </Button>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="links">Links</TabsTrigger>
                    <TabsTrigger value="discord">Discord</TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general" className="space-y-6 mt-6">
                    <Card className="glass border-white/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5 text-blue-400" />
                                Site Information
                            </CardTitle>
                            <CardDescription>
                                Basic details about your platform.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Site Name</label>
                                <Input
                                    value={settings.site_info.name}
                                    onChange={(e) => handleChange('site_info', 'name', e.target.value)}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    value={settings.site_info.description}
                                    onChange={(e) => handleChange('site_info', 'description', e.target.value)}
                                    className="bg-white/5 border-white/10 h-24 resize-none"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Contact Email</label>
                                <Input
                                    value={settings.site_info.email}
                                    onChange={(e) => handleChange('site_info', 'email', e.target.value)}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Logo URL</label>
                                <Input
                                    value={settings.site_info.logo}
                                    onChange={(e) => handleChange('site_info', 'logo', e.target.value)}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Features & Economy */}
                <TabsContent value="features" className="space-y-6 mt-6">
                    <Card className="glass border-white/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Coins className="h-5 w-5 text-amber-400" />
                                Economy & Rewards
                            </CardTitle>
                            <CardDescription>
                                Configure daily rewards, costs, and XP rates.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Coins</h4>
                                    <div className="grid gap-2">
                                        <label className="text-sm">Daily Login Bonus</label>
                                        <Input
                                            type="number"
                                            value={settings.features.dailyCoins}
                                            onChange={(e) => handleChange('features', 'dailyCoins', parseInt(e.target.value))}
                                            className="bg-white/5 border-white/10"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-sm">New User Bonus</label>
                                        <Input
                                            type="number"
                                            value={settings.features.newUserCoins}
                                            onChange={(e) => handleChange('features', 'newUserCoins', parseInt(e.target.value))}
                                            className="bg-white/5 border-white/10"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-sm">Spin Wheel Cost</label>
                                        <Input
                                            type="number"
                                            value={settings.features.spinCostCoins}
                                            onChange={(e) => handleChange('features', 'spinCostCoins', parseInt(e.target.value))}
                                            className="bg-white/5 border-white/10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Experience (XP)</h4>
                                    <div className="grid gap-2">
                                        <label className="text-sm">XP per Post</label>
                                        <Input
                                            type="number"
                                            value={settings.features.xpPerPost}
                                            onChange={(e) => handleChange('features', 'xpPerPost', parseInt(e.target.value))}
                                            className="bg-white/5 border-white/10"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-sm">XP per Comment</label>
                                        <Input
                                            type="number"
                                            value={settings.features.xpPerComment}
                                            onChange={(e) => handleChange('features', 'xpPerComment', parseInt(e.target.value))}
                                            className="bg-white/5 border-white/10"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-sm">XP per Action (Like/etc)</label>
                                        <Input
                                            type="number"
                                            value={settings.features.xpPerAction}
                                            onChange={(e) => handleChange('features', 'xpPerAction', parseInt(e.target.value))}
                                            className="bg-white/5 border-white/10"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Linkvertise & Monetization */}
                <TabsContent value="links" className="space-y-6 mt-6">
                    <Card className="glass border-white/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LinkIcon className="h-5 w-5 text-green-400" />
                                Linkvertise Integration
                            </CardTitle>
                            <CardDescription>
                                Manage monetization settings for external links.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="space-y-0.5">
                                    <div className="font-medium">Enable Linkvertise</div>
                                    <div className="text-xs text-muted-foreground">Redirect downloads through Linkvertise</div>
                                </div>
                                <Switch
                                    checked={settings.linkvertise.enabled}
                                    onCheckedChange={(checked) => handleChange('linkvertise', 'enabled', checked)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">User ID</label>
                                <Input
                                    value={settings.linkvertise.userId}
                                    onChange={(e) => handleChange('linkvertise', 'userId', e.target.value)}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Discord & Socials */}
                <TabsContent value="discord" className="space-y-6 mt-6">
                    <Card className="glass border-white/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-indigo-400" />
                                Discord Configuration
                            </CardTitle>
                            <CardDescription>
                                manage discord integration and community links.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Client ID</label>
                                <Input
                                    value={settings.discord.clientId}
                                    onChange={(e) => handleChange('discord', 'clientId', e.target.value)}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Community Invite URL</label>
                                <div className="flex gap-2">
                                    <Input
                                        value={settings.discord.communityUrl}
                                        onChange={(e) => handleChange('discord', 'communityUrl', e.target.value)}
                                        className="bg-white/5 border-white/10"
                                    />
                                    <Button size="icon" variant="outline" asChild>
                                        <a href={settings.discord.communityUrl} target="_blank" rel="noreferrer">
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </Button>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Support Server URL</label>
                                <div className="flex gap-2">
                                    <Input
                                        value={settings.discord.supportUrl}
                                        onChange={(e) => handleChange('discord', 'supportUrl', e.target.value)}
                                        className="bg-white/5 border-white/10"
                                    />
                                    <Button size="icon" variant="outline" asChild>
                                        <a href={settings.discord.supportUrl} target="_blank" rel="noreferrer">
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
