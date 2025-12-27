import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const adminId = process.env.ADMIN_DISCORD_ID || "1047719075322810378"
    const supabase = getSupabaseAdminClient()

    // Check if already seeded
    const { count: existingAssets } = await supabase.from("assets").select("*", { count: "exact", head: true })

    if (existingAssets && existingAssets > 0) {
      return NextResponse.json({ message: "Already seeded", count: existingAssets })
    }

    // First ensure admin user exists
    const { data: existingUser } = await supabase.from("users").select("*").eq("discord_id", adminId).single()

    if (!existingUser) {
      await supabase.from("users").insert({
        discord_id: adminId,
        username: "Admin",
        membership: "admin",
        coins: 999999,
        is_admin: true,
      })
    }

    const forumCategories = [
      {
        name: "Announcements",
        description: "Official announcements and updates",
        icon: "Megaphone",
        color: "#ef4444",
        sort_order: 1,
      },
      {
        name: "General Discussion",
        description: "General FiveM and GTA V discussions",
        icon: "MessageSquare",
        color: "#3b82f6",
        sort_order: 2,
      },
      {
        name: "Help & Support",
        description: "Get help with scripts and resources",
        icon: "HelpCircle",
        color: "#22c55e",
        sort_order: 3,
      },
      { name: "Showcase", description: "Show off your creations", icon: "Star", color: "#f59e0b", sort_order: 4 },
      { name: "Tutorials", description: "Guides and tutorials", icon: "BookOpen", color: "#8b5cf6", sort_order: 5 },
      {
        name: "Off-Topic",
        description: "Non-FiveM related discussions",
        icon: "Coffee",
        color: "#6b7280",
        sort_order: 6,
      },
    ]

    const { count: existingCategories } = await supabase
      .from("forum_categories")
      .select("*", { count: "exact", head: true })

    if (!existingCategories || existingCategories === 0) {
      for (const cat of forumCategories) {
        await supabase.from("forum_categories").insert(cat)
      }
    }

    const allData = [
      {
        title: "QBCore Banking System",
        category: "scripts",
        framework: "qbcore",
        coin_price: 0,
        thumbnail: "/banking-system-ui-dark-theme.jpg",
        tags: ["banking", "economy", "qbcore"],
        downloads: 1250,
      },
      {
        title: "BMW M5 F90",
        category: "vehicles",
        framework: "standalone",
        coin_price: 50,
        thumbnail: "/bmw-m5-f90-gta-style.jpg",
        tags: ["bmw", "vehicle", "car"],
        downloads: 890,
      },
      {
        title: "Hospital MLO",
        category: "mlo",
        framework: "standalone",
        coin_price: 100,
        thumbnail: "/hospital-interior-gta-mlo.jpg",
        tags: ["hospital", "mlo", "interior"],
        downloads: 456,
      },
      {
        title: "Police Uniform Pack",
        category: "clothing",
        framework: "standalone",
        coin_price: 40,
        thumbnail: "/police-uniform-gta-roleplay.jpg",
        tags: ["police", "uniform", "clothing"],
        downloads: 1100,
      },
      {
        title: "ESX Drug System",
        category: "scripts",
        framework: "esx",
        coin_price: 75,
        thumbnail: "/drug-system-dark-ui.jpg",
        tags: ["drugs", "esx", "economy"],
        downloads: 2300,
      },
      {
        title: "Character Customization",
        category: "scripts",
        framework: "standalone",
        coin_price: 0,
        thumbnail: "/character-customization-ui.jpg",
        tags: ["character", "customization", "ui"],
        downloads: 3400,
      },
      {
        title: "Advanced Garage System",
        category: "scripts",
        framework: "qbcore",
        coin_price: 0,
        thumbnail: "/garage-system-preview.jpg",
        tags: ["garage", "vehicles", "qbcore"],
        downloads: 1890,
      },
      {
        title: "Luxury Apartment MLO",
        category: "mlo",
        framework: "standalone",
        coin_price: 150,
        thumbnail: "/luxury-apartment-interior.jpg",
        tags: ["apartment", "luxury", "mlo"],
        downloads: 780,
      },
    ]

    // Insert assets
    for (const asset of allData) {
      await supabase.from("assets").insert({
        ...asset,
        description: `${asset.title} - High quality FiveM resource for your server. Fully optimized and easy to install.`,
        author_id: adminId,
        status: "active",
        is_verified: true,
        is_featured: asset.downloads > 1000,
        download_link: `https://github.com/fivem-tools/releases/download/v1.0/${asset.title.toLowerCase().replace(/\s+/g, "-")}.zip`,
      })
    }

    // Create sample forum thread
    const { data: category } = await supabase.from("forum_categories").select("id").eq("name", "Announcements").single()

    if (category) {
      await supabase.from("forum_threads").insert({
        title: "Welcome to FiveM Tools Forum",
        content:
          "Welcome to our community forum! This is the place to discuss FiveM development, share resources, and get help from fellow developers.\n\nPlease read the rules before posting and be respectful to other members.",
        category_id: category.id,
        author_id: adminId,
        views: 234,
        likes: 12,
        is_pinned: true,
      })
    }

    return NextResponse.json({
      success: true,
      seeded: allData.length,
      categories: forumCategories.length,
    })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
