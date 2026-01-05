import { NextResponse } from "next/server"

export async function GET() {
  // Event Lucky Spin telah berakhir
  return NextResponse.json({ 
    error: "Lucky Spin event telah berakhir. Terima kasih telah berpartisipasi!",
    message: "Event sudah tidak tersedia lagi.",
    status: "event_ended",
    winners: [] // Return empty array for compatibility
  }, { status: 410 }) // 410 Gone - resource no longer available
}