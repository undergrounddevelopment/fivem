import { NextResponse } from "next/server"

export const revalidate = 600 // Cache for 10 minutes

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
            return NextResponse.json({ error: "Invalid server ID format" }, { status: 400 })
        }

        console.log(`[CFX API] Fetching server: ${id}`)

        const fetchWithTimeout = async (url: string, timeoutMs: number) => {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
            
            try {
                console.log(`[CFX API] Trying: ${url}`)
                const res = await fetch(url, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                        "Accept": "application/json"
                    },
                    signal: controller.signal,
                    cache: 'no-store'
                })
                clearTimeout(timeoutId)
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                const data = await res.json()
                console.log(`[CFX API] Success from: ${url}`)
                return data
            } catch (e: any) {
                clearTimeout(timeoutId)
                console.log(`[CFX API] Failed: ${url} - ${e.message}`)
                throw e
            }
        }

        try {
            const result = await Promise.any([
                fetchWithTimeout(`https://servers.fivem.net/api/servers/single/${id}`, 5000),
                fetchWithTimeout(`https://servers-frontend.fivem.net/api/servers/single/${id}`, 5000)
            ])

            return NextResponse.json(result)

        } catch (error) {
            console.error(`[CFX API] All failed for: ${id}`)
            return NextResponse.json(
                { error: "Server not found or offline" },
                { status: 404 }
            )
        }

    } catch (error) {
        console.error("[CFX API] Error:", error)
        return NextResponse.json({ error: "Internal error" }, { status: 500 })
    }
}
