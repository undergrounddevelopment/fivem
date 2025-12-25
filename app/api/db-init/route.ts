import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://linnqtixdfjwbrixitrb.supabase.co"
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpbm5xdGl4ZGZqd2JyaXhpdHJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDUzMTA2NywiZXhwIjoyMDUwMTA3MDY3fQ.TdLBWCXn4z1VKMvh9Cd7oGv3sVyEk9eJXZp8Y33EiVA"

export async function POST() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Check if tables exist
    const { error: checkError } = await supabase.from("banners").select("id").limit(1)

    if (!checkError) {
      return NextResponse.json({
        success: true,
        message: "Database already initialized",
        alreadyExists: true,
      })
    }

    // Tables don't exist, need to create them
    // This would require running SQL directly or using Supabase SQL editor
    const setupInstructions = `
Please run the following SQL in Supabase SQL Editor:

1. Go to https://supabase.com/dashboard/project/linnqtixdfjwbrixitrb/editor
2. Run the SQL script at: scripts/010-admin-features-complete.sql

Or use the Supabase CLI:
supabase db push --db-url "postgresql://postgres.linnqtixdfjwbrixitrb:06Zs04s8vCBrW4XE@aws-1-us-east-1.pooler.supabase.com:6543/postgres"
    `

    return NextResponse.json({
      success: false,
      message: "Tables need to be created",
      instructions: setupInstructions,
      sqlFile: "scripts/010-admin-features-complete.sql",
    })
  } catch (error: unknown) {
    console.error("[v0] Database init error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return POST()
}
