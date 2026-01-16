
"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { 
  Plus, 
  Trash2, 
  Save, 
  Loader2,
  Image as ImageIcon,
  History,
  Settings as SettingsIcon,
  Gift,
  Search
} from "lucide-react"

// --- Components ---
import { cn } from "@/lib/utils"

interface SpinPrize {
  id: string
  title: string
  type: 'item' | 'coin' | 'ticket' | 'empty'
  value: number
  image_url: string
  drop_rate: number
  color: string
  is_active: boolean
}

interface SpinHistory {
    id: string
    users: {
        username: string
        discord_id: string
        avatar: string
    }
    spin_prizes: {
        title: string
        type: string
        value: number
    }
    created_at: string
}

export default function AdminSpinPage() {
  const [activeTab, setActiveTab] = useState<'prizes' | 'settings' | 'history'>('prizes')

  return (
    <div className="p-6 space-y-6 bg-[#0f1115] min-h-screen text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Spin Wheel Management</h1>
          <p className="text-gray-400">Manage prizes, global settings, and view history.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
          <button 
             onClick={() => setActiveTab('prizes')}
             className={cn("px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2", activeTab === 'prizes' ? "border-blue-500 text-blue-400" : "border-transparent text-gray-400 hover:text-white")}
          >
              <Gift className="w-4 h-4"/> Prizes
          </button>
          <button 
             onClick={() => setActiveTab('settings')}
             className={cn("px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2", activeTab === 'settings' ? "border-blue-500 text-blue-400" : "border-transparent text-gray-400 hover:text-white")}
          >
              <SettingsIcon className="w-4 h-4"/> Settings
          </button>
          <button 
             onClick={() => setActiveTab('history')}
             className={cn("px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2", activeTab === 'history' ? "border-blue-500 text-blue-400" : "border-transparent text-gray-400 hover:text-white")}
          >
              <History className="w-4 h-4"/> History
          </button>
      </div>

      <div className="mt-6">
          {activeTab === 'prizes' && <PrizesTab />}
          {activeTab === 'settings' && <SettingsTab />}
          {activeTab === 'history' && <HistoryTab />}
      </div>
    </div>
  )
}

function PrizesTab() {
  const [prizes, setPrizes] = useState<SpinPrize[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPrizes = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/spin-prizes')
      if (res.ok) {
        const data = await res.json()
        setPrizes(data)
      }
    } catch (error) {
      toast.error("Failed to load prizes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrizes()
  }, [])

  const handleCreate = async () => {
      const newPrize = {
          title: "New Prize",
          type: "item",
          value: 0,
          image_url: "https://assets.codepen.io/3685267/wheel-of-fortune-lmvdrrhl.png",
          drop_rate: 10,
          color: "#343a46c2",
          is_active: true
      }
      
      try {
          const res = await fetch('/api/admin/spin-prizes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newPrize)
          })
          if (res.ok) {
              await fetchPrizes()
              toast.success("Prize created")
          }
      } catch (e) {
          toast.error("Error creating prize")
      }
  }

  const handleUpdate = async (id: string, updates: Partial<SpinPrize>) => {
      setPrizes(p => p.map(item => item.id === id ? { ...item, ...updates } : item))
      try {
          await fetch('/api/admin/spin-prizes', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id, ...updates })
          })
      } catch (e) {
          toast.error("Failed to save change")
      }
  }
  
  const handleDelete = async (id: string) => {
      if(!confirm("Delete this prize?")) return;
      try {
          const res = await fetch(`/api/admin/spin-prizes?id=${id}`, { method: 'DELETE' })
          if (res.ok) {
              setPrizes(p => p.filter(item => item.id !== id))
              toast.success("Prize deleted")
          }
      } catch (e) {
          toast.error("Failed to delete")
      }
  }

  return (
      <>
        <div className="flex justify-end mb-4">
             <button 
                onClick={handleCreate}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" /> Add Prize
              </button>
        </div>
        <div className="bg-[#16181d] rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-gray-400 font-medium">
              <tr>
                <th className="p-4">Image</th>
                <th className="p-4">Title</th>
                <th className="p-4">Type</th>
                <th className="p-4">Value</th>
                <th className="p-4">Drop %</th>
                <th className="p-4">Active</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Loading...</td></tr>
              ) : prizes.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">No prizes found.</td></tr>
              ) : (
                prizes.map((prize) => (
                  <tr key={prize.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4 align-top w-20">
                       <div className="relative w-12 h-12 bg-black/20 rounded-md border border-white/10 flex items-center justify-center overflow-hidden mb-2">
                           <img src={prize.image_url} alt="" className="w-10 h-10 object-contain" />
                       </div>
                       <input 
                          type="text" 
                          value={prize.image_url}
                          onChange={(e) => handleUpdate(prize.id, { image_url: e.target.value })}
                          className="w-full bg-transparent text-[10px] text-gray-500 border border-white/10 rounded px-1 py-0.5"
                          placeholder="URL"
                       />
                    </td>
                    <td className="p-4 align-top">
                      <input 
                        type="text" 
                        value={prize.title} 
                        onChange={(e) => handleUpdate(prize.id, { title: e.target.value })}
                        className="bg-transparent border border-transparent hover:border-white/10 focus:border-blue-500 rounded px-2 py-1 w-full outline-none font-medium text-white"
                      />
                    </td>
                    <td className="p-4 align-top">
                         <select 
                            value={prize.type}
                            onChange={(e) => handleUpdate(prize.id, { type: e.target.value as any })}
                            className="bg-[#0f1115] border border-white/10 rounded px-2 py-1 outline-none text-xs text-gray-300"
                         >
                             <option value="item">Item</option>
                             <option value="coin">Coins</option>
                             <option value="ticket">Tickets</option>
                             <option value="empty">Empty</option>
                         </select>
                    </td>
                    <td className="p-4 align-top">
                      <input 
                        type="number" 
                        value={prize.value} 
                        onChange={(e) => handleUpdate(prize.id, { value: parseInt(e.target.value) || 0 })}
                        className="bg-transparent border border-transparent hover:border-white/10 focus:border-blue-500 rounded px-2 py-1 w-20 outline-none"
                      />
                    </td>
                    <td className="p-4 align-top">
                        <div className="flex items-center">
                            <input 
                                type="number" 
                                value={prize.drop_rate} 
                                onChange={(e) => handleUpdate(prize.id, { drop_rate: parseFloat(e.target.value) || 0 })}
                                className="bg-transparent border border-transparent hover:border-white/10 focus:border-blue-500 rounded px-2 py-1 w-16 outline-none text-right"
                            />
                            <span className="text-gray-500 ml-1">%</span>
                        </div>
                    </td>
                    <td className="p-4 align-top">
                        <button 
                            onClick={() => handleUpdate(prize.id, { is_active: !prize.is_active })}
                            className={`w-10 h-5 rounded-full relative transition-colors ${prize.is_active ? 'bg-green-500/20' : 'bg-red-500/20'}`}
                        >
                            <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${prize.is_active ? 'right-1 bg-green-500' : 'left-1 bg-red-500'}`} />
                        </button>
                    </td>
                    <td className="p-4 text-right align-top">
                       <button 
                          onClick={() => handleDelete(prize.id)}
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                       >
                           <Trash2 className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-white/5 border-t border-white/10 flex justify-between items-center text-sm text-gray-400">
           <span>Total Drop Weight: {prizes.reduce((a, b) => a + (b.drop_rate || 0), 0).toFixed(2)}%</span>
        </div>
      </div>
      </>
  )
}

function SettingsTab() {
    const [settings, setSettings] = useState<any>({ ticket_cost: 1, is_enabled: true })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetch('/api/admin/spin-settings')
            .then(res => res.json())
            .then(data => {
                if(data && Object.keys(data).length > 0) setSettings(data)
            })
            .catch(console.error)
    }, [])

    const handleSave = async () => {
        setLoading(true)
        try {
            await fetch('/api/admin/spin-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            })
            toast.success("Settings saved")
        } catch {
            toast.error("Failed to save")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl space-y-6">
            <div className="bg-[#16181d] border border-white/10 rounded-xl p-6 space-y-6">
                <div>
                   <label className="block text-sm font-medium text-gray-300 mb-2">Ticket Cost Per Spin</label>
                   <input 
                      type="number" 
                      value={settings.ticket_cost}
                      onChange={e => setSettings({...settings, ticket_cost: parseInt(e.target.value) || 0})}
                      className="w-full bg-[#0f1115] border border-white/10 rounded-md px-4 py-2 text-white focus:border-blue-500 outline-none"
                   />
                   <p className="text-xs text-gray-500 mt-2">How many tickets does it cost to spin the wheel once.</p>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Enable Spin Event</label>
                        <p className="text-xs text-gray-500">Enable or disable the spin wheel page globally.</p>
                    </div>
                    <button 
                        onClick={() => setSettings({...settings, is_enabled: !settings.is_enabled})}
                        className={`w-12 h-6 rounded-full relative transition-colors ${settings.is_enabled ? 'bg-green-500' : 'bg-gray-600'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.is_enabled ? 'right-1' : 'left-1'}`} />
                    </button>
                </div>
            </div>

            <div className="flex justify-end">
                <button 
                   onClick={handleSave}
                   disabled={loading}
                   className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium flex items-center gap-2 disabled:opacity-50"
                >
                    {loading && <Loader2 className="animate-spin w-4 h-4"/>}
                    Save Changes
                </button>
            </div>
        </div>
    )
}

function HistoryTab() {
    const [history, setHistory] = useState<SpinHistory[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/admin/spin-history?limit=50')
            .then(res => res.json())
            .then(data => {
                if(Array.isArray(data)) setHistory(data)
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="bg-[#16181d] rounded-xl border border-white/5 overflow-hidden">
             <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-gray-400 font-medium">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Prize Won</th>
                    <th className="p-4">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                   {loading ? (
                     <tr><td colSpan={3} className="p-8 text-center text-gray-500">Loading history...</td></tr>
                   ) : history.length === 0 ? (
                     <tr><td colSpan={3} className="p-8 text-center text-gray-500">No spin history records found.</td></tr>
                   ) : (
                     history.map(item => (
                         <tr key={item.id} className="hover:bg-white/5">
                             <td className="p-4">
                                 <div className="flex items-center gap-3">
                                     <img src={item.users?.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"} className="w-8 h-8 rounded-full bg-gray-700"/>
                                     <div>
                                         <div className="font-medium text-white">{item.users?.username || "Unknown"}</div>
                                         <div className="text-xs text-gray-500 font-mono">{item.users?.discord_id}</div>
                                     </div>
                                 </div>
                             </td>
                             <td className="p-4">
                                 <div className="flex items-center gap-2">
                                     <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                                         item.spin_prizes?.type === 'item' ? 'border-purple-500 text-purple-400 bg-purple-500/10' :
                                         item.spin_prizes?.type === 'coin' ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10' :
                                         'border-gray-500 text-gray-400'
                                     }`}>
                                         {item.spin_prizes?.type}
                                     </span>
                                     <span>{item.spin_prizes?.title}</span>
                                     {item.spin_prizes?.value > 0 && <span className="text-gray-500 text-xs">x{item.spin_prizes.value}</span>}
                                 </div>
                             </td>
                             <td className="p-4 text-gray-400">
                                 {new Date(item.created_at).toLocaleString()}
                             </td>
                         </tr>
                     ))
                   )}
                </tbody>
             </table>
        </div>
    )
}
