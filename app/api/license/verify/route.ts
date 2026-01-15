
import { NextRequest, NextResponse } from "next/server"

// SECURE KEY STORAGE - SERVER SIDE ONLY
// In a real production app, these would be in a DATABASE or ENVIRONMENT VARIABLES
const VALID_LICENSE_KEYS = [
    "RUNKZERIGALA-UDGKEY",
    "ADMIN-RUNKZERIGALA",
    "FIVEMTOOLS-V7-PRO",
    "UDG-LIFETIME-2025"
]

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { key } = body

        if (!key || typeof key !== "string") {
            return NextResponse.json(
                { success: false, message: "Invalid key format" },
                { status: 400 }
            )
        }

        // DELAY TO PREVENT BRUTE FORCE (Simulated Latency)
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))

        const normalizedKey = key.trim().toUpperCase()

        if (VALID_LICENSE_KEYS.includes(normalizedKey)) {
            // Generate unique session token for this verification
            // This token could be validated in subsequent requests
            const sessionToken = `b5m_${Math.random().toString(36).substring(2)}_${Date.now()}`

            return NextResponse.json({
                success: true,
                message: "License verified successfully",
                token: sessionToken,
                tier: normalizedKey.includes("ADMIN") ? "ADMIN_ROOT" : "ELITE_TIER"
            })
        } else {
            return NextResponse.json(
                { success: false, message: "Invalid license key" },
                { status: 401 }
            )
        }

    } catch (error) {
        console.error("License Verification Error:", error)
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        )
    }
}
