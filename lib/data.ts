// Mock data for the application

// Mock stats for admin analytics
export const mockStats = {
  totalUsers: 12500,
  activeUsers: 8700,
  onlineUsers: 3420,
  totalMembers: 12500,
  totalDownloads: 42000,
  totalThreads: 4250,
  totalPosts: 18900,
  totalAssets: 1250,
  revenue: 125000,
  popularAssets: [
    { id: 1, name: "Premium Car Pack", downloads: 2450, rating: 4.8 },
    { id: 2, name: "Modern Weapon Collection", downloads: 1980, rating: 4.6 },
    { id: 3, name: "Realistic Weather System", downloads: 1875, rating: 4.9 },
  ],
};

// Mock assets data
export const mockAssets = [
  {
    id: 1,
    name: "Premium Car Pack",
    author: "AssetMaster",
    downloads: 2450,
    rating: 4.8,
    price: 19.99,
    image: "/placeholder.svg?height=200&width=300",
    description: "A collection of high-quality premium cars for your FiveM server.",
    tags: ["vehicles", "luxury", "realistic"],
  },
  {
    id: 2,
    name: "Modern Weapon Collection",
    author: "WeaponForge",
    downloads: 1980,
    rating: 4.6,
    price: 24.99,
    image: "/placeholder.svg?height=200&width=300",
    description: "Realistic weapon models with enhanced textures and effects.",
    tags: ["weapons", "combat", "realistic"],
  },
  {
    id: 3,
    name: "Realistic Weather System",
    author: "WeatherWizards",
    downloads: 1875,
    rating: 4.9,
    price: 14.99,
    image: "/placeholder.svg?height=200&width=300",
    description: "Dynamic weather system that enhances immersion in your server.",
    tags: ["weather", "environment", "immersive"],
  },
];

// Mock forum categories
export const mockForumCategories = [
  {
    id: "1",
    name: "General Discussion",
    description: "Talk about anything FiveM related",
    threadCount: 1250,
    threads: 1250,
    posts: 5400,
    lastPost: {
      title: "Welcome to our community!",
      author: "Admin",
      time: "2 hours ago",
    },
  },
  {
    id: "2",
    name: "Asset Releases",
    description: "Share your latest creations",
    threadCount: 870,
    threads: 870,
    posts: 2100,
    lastPost: {
      title: "New realistic weapon pack released",
      author: "AssetCreator",
      time: "5 hours ago",
    },
  },
  {
    id: "3",
    name: "Server Advertising",
    description: "Promote your FiveM servers",
    threadCount: 640,
    threads: 640,
    posts: 1800,
    lastPost: {
      title: "Join our roleplay server!",
      author: "ServerOwner",
      time: "1 hour ago",
    },
  },
];

// Mock notifications
export const mockNotifications = [
  { id: "1", type: "reply" as const, title: "New Reply", message: "Someone replied to your thread", createdAt: "2024-03-08", read: false },
  { id: "2", type: "like" as const, title: "New Like", message: "Your post received a like", createdAt: "2024-03-07", read: false },
  { id: "3", type: "system" as const, title: "System Update", message: "New features available", createdAt: "2024-03-06", read: true },
];

// Mock forum threads
export const mockThreads = [
  {
    id: "1",
    categoryId: "1",
    category: "General Discussion",
    title: "Welcome to our community!",
    author: { id: "admin", username: "Admin", avatar: "/admin-avatar.jpg", membership: "admin" as const, reputation: 1000 },
    replies: 24,
    views: 540,
    likes: 45,
    isPinned: true,
    isLocked: false,
    createdAt: "2023-01-15T10:00:00Z",
    lastActivity: "2023-06-20T14:30:00Z",
    content: "Welcome to our FiveM tools community forum!",
  },
  {
    id: "2",
    categoryId: "2",
    category: "Asset Releases",
    title: "New realistic weapon pack released",
    author: { id: "creator", username: "AssetCreator", avatar: "/creator-avatar.jpg", membership: "vip" as const, reputation: 500 },
    replies: 18,
    views: 420,
    likes: 32,
    isPinned: false,
    isLocked: false,
    createdAt: "2023-06-18T09:15:00Z",
    lastActivity: "2023-06-20T12:45:00Z",
    content: "Check out our latest weapon pack with enhanced realism!",
  },
];
