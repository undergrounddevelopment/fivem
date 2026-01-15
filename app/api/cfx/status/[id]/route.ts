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

        // Parallel Execution Strategy
        // We race multiple sources to get the fastest valid response
        
        const fetchWithTimeout = async (url: string, timeoutMs: number) => {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
            
            try {
                const res = await fetch(url, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                        "Accept": "application/json",
                        "Origin": "https://servers.fivem.net",
                        "Referer": "https://servers.fivem.net/"
                    },
                    signal: controller.signal,
                    next: { revalidate: 30 }
                })
                clearTimeout(timeoutId)
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                const data = await res.json()
                if (!data || (!data.Data && !data.hostname)) throw new Error("Invalid data")
                return data
            } catch (e) {
                clearTimeout(timeoutId)
                throw e
            }
        }

        // Strategy 3 (Direct Join) Wrapper
        const tryDirectJoin = async () => {
            try {
                const joinUrl = `https://cfx.re/join/${id}`
                const joinRes = await fetch(joinUrl, {
                    method: "HEAD",
                    redirect: "manual",
                    headers: { "User-Agent": "Mozilla/5.0" },
                    signal: AbortSignal.timeout(2500) // Fast timeout for scraping
                })

                const location = joinRes.headers.get("location") || joinRes.headers.get("x-citizenfx-url")
                
                if (location && location.includes("fivem://connect/")) {
                    const ipPort = location.replace("fivem://connect/", "").replace(/\/$/, "")
                    const infoUrl = `http://${ipPort}/info.json`
                    
                    const infoRes = await fetch(infoUrl, { 
                        next: { revalidate: 60 }, 
                        signal: AbortSignal.timeout(2500) 
                    })
                    
                    if (infoRes.ok) {
                        const infoData = await infoRes.json()
                        return {
                            Data: {
                                hostname: infoData.vars?.sv_hostname || infoData.hostname || "Unknown Server",
                                clients: infoData.players?.length || infoData.clients || 0,
                                sv_maxclients: infoData.vars?.sv_maxclients || infoData.sv_maxclients || 32,
                                connectEndPoints: [ipPort],
                                vars: infoData.vars || {}
                            },
                            EndPoint: ipPort
                        }
                    }
                }
                throw new Error("Direct join failed")
            } catch (e) {
                throw e
            }
        }

        try {
            // Race all strategies with a global 5s timeout
            const result = await Promise.any([
                fetchWithTimeout(`https://servers-frontend.fivem.net/api/servers/single/${id}`, 3500),
                fetchWithTimeout(`https://servers-live.fivem.net/api/servers/single/${id}`, 3500),
                tryDirectJoin()
            ])

            return NextResponse.json(result)

        } catch (aggregateError) {
             console.warn(`[FiveM Proxy] All strategies failed for ID ${id}`)
             return NextResponse.json(
                { error: "Server unavailable or timeout", serverId: id },
                { status: 404 }
            )
        }

    } catch (error) {
        console.error("[FiveM Proxy] Critical Error:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
