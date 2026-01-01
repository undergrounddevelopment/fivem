export default function ForumPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Community Forum</h1>
        <p className="text-muted-foreground mb-8">Connect with the FiveM community</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">General Discussion</h3>
            <p className="text-sm text-muted-foreground">General topics about FiveM</p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">Script Releases</h3>
            <p className="text-sm text-muted-foreground">Share your scripts</p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">Support & Help</h3>
            <p className="text-sm text-muted-foreground">Get help with your server</p>
          </div>
        </div>
      </div>
    </div>
  )
}
