import { NextRequest, NextResponse } from "next/server"

// Event Lucky Spin telah berakhir
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    error: "Lucky Spin event telah berakhir. Terima kasih telah berpartisipasi!",
    message: "Event sudah tidak tersedia lagi.",
    status: "event_ended"
  }, { status: 410 }) // 410 Gone - resource no longer available
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: "Lucky Spin event telah berakhir. Terima kasih telah berpartisipasi!",
    message: "Event sudah tidak tersedia lagi.",
    status: "event_ended"
  }, { status: 410 }) // 410 Gone - resource no longer available
}