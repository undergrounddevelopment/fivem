"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button" 
import Link from "next/link"
import { Search, Package, User, MessageSquare, Loader2, ArrowRight } from "lucide-react"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.results)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery)
    }
  }, [initialQuery])

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
       <div className="max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl font-bold mb-4 text-center gradient-text">Global Search</h1>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                className="pl-10 h-12 glass" 
                placeholder="Search resources, users, discussions..."
              />
            </div>
            <Button size="lg" onClick={() => handleSearch(query)} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Search"}
            </Button>
          </div>
       </div>

       {loading ? (
         <div className="text-center py-20">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Searching universe...</p>
         </div>
       ) : results ? (
         <div className="space-y-8">
            {/* Assets */}
            <section>
               <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                 <Package className="h-5 w-5 text-purple-500" /> 
                 Assets ({results?.assets?.length || 0})
               </h2>
               {results?.assets?.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.assets.map((asset: any) => (
                      <Link href={`/asset/${asset.id}`} key={asset.id}>
                        <Card className="glass-hover hover:scale-[1.02] transition-all">
                          <CardContent className="p-4 flex gap-4">
                             <img src={asset.thumbnail || '/placeholder.png'} className="w-16 h-16 rounded object-cover" />
                             <div>
                               <h3 className="font-bold line-clamp-1">{asset.title}</h3>
                               <p className="text-xs text-muted-foreground capitalize">{asset.category}</p>
                             </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                 </div>
               ) : <p className="text-muted-foreground italic">No assets found</p>}
            </section>

             {/* Users */}
             <section>
               <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                 <User className="h-5 w-5 text-blue-500" /> 
                 Users ({results?.users?.length || 0})
               </h2>
               {results?.users?.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {results.users.map((user: any) => (
                      <Link href={`/profile/${user.id}`} key={user.id}>
                        <Card className="glass-hover hover:scale-[1.05] transition-all">
                          <CardContent className="p-4 flex items-center gap-3">
                             <img src={user.avatar || '/placeholder-user.jpg'} className="w-10 h-10 rounded-full" />
                             <span className="font-medium truncate">{user.username}</span>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                 </div>
               ) : <p className="text-muted-foreground italic">No users found</p>}
            </section>

            {/* Threads */}
             <section>
               <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                 <MessageSquare className="h-5 w-5 text-green-500" /> 
                 Discussions ({results?.threads?.length || 0})
               </h2>
               {results?.threads?.length > 0 ? (
                 <div className="space-y-2">
                    {results.threads.map((thread: any) => (
                      <Link href={`/forum/thread/${thread.id}`} key={thread.id}>
                        <div className="p-4 glass rounded-lg hover:bg-white/5 flex justify-between items-center transition-colors">
                           <span className="font-medium">{thread.title}</span>
                           <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </Link>
                    ))}
                 </div>
               ) : <p className="text-muted-foreground italic">No threads found</p>}
            </section>
         </div>
       ) : (
         <div className="text-center py-20 opacity-50">
            <p>Enter a keyword to start searching</p>
         </div>
       )}
    </div>
  )
}
