"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
    CreditCard, 
    Gift, 
    CheckCircle2, 
    MessageSquare, 
    User, 
    Hash,
    Loader2,
    Check,
    AlertCircle
} from "lucide-react"

interface RewarblePaymentModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    planName?: string
    planPrice?: string
}

export function RewarblePaymentModal({ 
    isOpen, 
    onOpenChange, 
    planName = "Lifetime VIP", 
    planPrice = "$50" 
}: RewarblePaymentModalProps) {
    const [step, setStep] = useState<1 | 2>(1)
    const [formData, setFormData] = useState({
        discordId: "",
        name: "",
        discordUsername: "",
        paymentMethod: "Giftcard Rewarble",
        giftCardCode: ""
    })
    const [transactionId, setTransactionId] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (isOpen) {
            // Generate random Transaction ID
            const id = "TRX-" + Math.floor(10000000 + Math.random() * 90000000).toString()
            setTransactionId(id)
        }
    }, [isOpen])
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState("")

    const WEBHOOK_URL = "https://discord.com/api/webhooks/1460724471752298743/IS7qqfGGt4qAdkWZInirpoF-b9xuT6pe1n-IUUJ4tMJd7fbBDqfHqQK2BRYAyDNGwtWh"

    const handleSubmit = async () => {
        if (!formData.discordId || !formData.name || !formData.discordUsername || !formData.giftCardCode) {
            setError("Semua field harus diisi!")
            return
        }

        setIsSubmitting(true)
        setError("")

        try {
            const embed = {
                title: "🆕 NEW PREMIUM PURCHASE REQUEST",
                color: 0xD4AF37, // Gold
                fields: [
                    { name: "Transaction ID", value: `\`${transactionId}\``, inline: false },
                    { name: "Plan", value: planName, inline: true },
                    { name: "Price", value: planPrice, inline: true },
                    { name: "Name", value: formData.name, inline: false },
                    { name: "Discord ID", value: formData.discordId, inline: true },
                    { name: "Discord Username", value: formData.discordUsername, inline: true },
                    { name: "Payment Method", value: formData.paymentMethod, inline: false },
                    { name: "Payment Code", value: `\`${formData.giftCardCode}\``, inline: false },
                ],
                timestamp: new Date().toISOString(),
                footer: { text: `FiveM Tools - Transaction: ${transactionId}` }
            }

            const response = await fetch(WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    embeds: [embed]
                })
            })

            if (response.ok) {
                setIsSuccess(true)
            } else {
                throw new Error("Gagal mengirim data ke server.")
            }
        } catch (err) {
            setError("Terjadi kesalahan saat mengirim data. Silakan coba lagi.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetForm = () => {
        setStep(1)
        setFormData({
            discordId: "",
            name: "",
            discordUsername: "",
            paymentMethod: "Giftcard Rewarble",
            giftCardCode: ""
        })
        setIsSuccess(false)
        setError("")
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) resetForm()
            onOpenChange(open)
        }}>
            <DialogContent className="max-w-md p-0 overflow-hidden bg-[#09090b] border-white/10 shadow-2xl">
                {/* Simplified shine effect for performance */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/50" />
                
                <div className="p-8 relative z-10">
                    {!isSuccess ? (
                        <>
                            <DialogHeader className="px-8 pt-8">
                                <div className="flex items-center gap-5">
                                    <div className="h-16 w-16 shrink-0 rounded-2xl bg-white flex items-center justify-center border-2 border-white/10 overflow-hidden p-2">
                                        <img 
                                            src="https://gamecardsdirect.com/content/picture/119926/rewarble-60.png" 
                                            alt="Rewarble"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <DialogTitle className="text-2xl font-black text-white uppercase tracking-tight">VIP Premium</DialogTitle>
                                            <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                                                <span className="text-[10px] font-mono text-neutral-400">ID: {transactionId || "..."}</span>
                                            </div>
                                        </div>
                                        <DialogDescription className="text-sm text-neutral-400 uppercase tracking-widest font-bold">
                                            {planName} • <span className="text-primary">{planPrice}</span>
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="space-y-6">
                                {step === 1 ? (
                                    <div className="space-y-5">
                                        {/* Inputs made CLEAR & SOLID for visibility */}
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-black uppercase tracking-widest text-neutral-400 ml-1">Nama Lengkap</Label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 group-hover:text-primary transition-colors" />
                                                <Input 
                                                    placeholder="Contoh: John Doe" 
                                                    className="pl-12 h-12 rounded-xl bg-neutral-900 border-white/10 focus:border-primary/50 focus:bg-neutral-800 focus:ring-primary/20 transition-all text-white placeholder:text-neutral-600"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-black uppercase tracking-widest text-neutral-400 ml-1">Discord ID</Label>
                                            <div className="relative group">
                                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 group-hover:text-primary transition-colors" />
                                                <Input 
                                                    placeholder="Contoh: 123456789012345678" 
                                                    className="pl-12 h-12 rounded-xl bg-neutral-900 border-white/10 focus:border-primary/50 focus:bg-neutral-800 focus:ring-primary/20 transition-all text-white placeholder:text-neutral-600"
                                                    value={formData.discordId}
                                                    onChange={(e) => setFormData({...formData, discordId: e.target.value})}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-black uppercase tracking-widest text-neutral-400 ml-1">Discord Username</Label>
                                            <div className="relative group">
                                                <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 group-hover:text-primary transition-colors" />
                                                <Input 
                                                    placeholder="Contoh: user#1234" 
                                                    className="pl-12 h-12 rounded-xl bg-neutral-900 border-white/10 focus:border-primary/50 focus:bg-neutral-800 focus:ring-primary/20 transition-all text-white placeholder:text-neutral-600"
                                                    value={formData.discordUsername}
                                                    onChange={(e) => setFormData({...formData, discordUsername: e.target.value})}
                                                />
                                            </div>
                                        </div>

                                        <Button 
                                            className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest hover:scale-[1.01] transition-all text-sm mt-2"
                                            onClick={() => setStep(2)}
                                            disabled={!formData.name || !formData.discordId || !formData.discordUsername}
                                        >
                                            Next Step
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <Label className="text-[11px] font-black uppercase tracking-widest text-neutral-400 ml-1">Pilih Metode Pembayaran</Label>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                {/* Rewarble Selection */}
                                                <div 
                                                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] group ${
                                                        formData.paymentMethod === 'Giftcard Rewarble' 
                                                        ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(255,215,0,0.1)]' 
                                                        : 'bg-neutral-900 border-white/5 hover:border-primary/50'
                                                    }`}
                                                    onClick={() => setFormData({...formData, paymentMethod: 'Giftcard Rewarble'})}
                                                >
                                                    <div className="flex flex-col items-center gap-3 text-center">
                                                        <div className="h-12 w-12 rounded-lg bg-white p-1.5 shadow-sm shrink-0">
                                                            <img 
                                                                src="https://gamecardsdirect.com/content/picture/119926/rewarble-60.png" 
                                                                alt="Rewarble" 
                                                                className="w-full h-full object-contain" 
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className={`text-xs font-black uppercase tracking-wider block ${
                                                                formData.paymentMethod === 'Giftcard Rewarble' ? 'text-white' : 'text-neutral-400 group-hover:text-white'
                                                            }`}>
                                                                Rewarble Card
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {formData.paymentMethod === 'Giftcard Rewarble' && (
                                                        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center shadow-lg">
                                                            <Check className="h-3 w-3 text-black stroke-[3px]" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* PayPal Selection */}
                                                <div 
                                                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] group ${
                                                        formData.paymentMethod === 'PayPal' 
                                                        ? 'bg-[#003087]/20 border-[#009cde] shadow-[0_0_20px_rgba(0,156,222,0.1)]' 
                                                        : 'bg-neutral-900 border-white/5 hover:border-[#009cde]/50'
                                                    }`}
                                                    onClick={() => setFormData({...formData, paymentMethod: 'PayPal'})}
                                                >
                                                    <div className="flex flex-col items-center gap-3 text-center">
                                                        <div className="h-12 w-12 rounded-lg bg-white p-1.5 shadow-sm shrink-0">
                                                            <img 
                                                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/2560px-PayPal.svg.png" 
                                                                alt="PayPal" 
                                                                className="w-full h-full object-contain" 
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className={`text-xs font-black uppercase tracking-wider block ${
                                                                formData.paymentMethod === 'PayPal' ? 'text-white' : 'text-neutral-400 group-hover:text-white'
                                                            }`}>
                                                                PayPal
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {formData.paymentMethod === 'PayPal' && (
                                                        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-[#009cde] flex items-center justify-center shadow-lg">
                                                            <Check className="h-3 w-3 text-white stroke-[3px]" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-[11px] font-black uppercase tracking-widest text-neutral-400 ml-1">Redeem Code</Label>
                                            <div className="relative group">
                                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 group-hover:text-primary transition-colors" />
                                                <Input 
                                                    placeholder="Paste Code Here" 
                                                    className="pl-12 h-14 rounded-xl bg-neutral-900 border-white/10 focus:border-primary/50 focus:bg-neutral-800 focus:ring-primary/20 transition-all font-mono text-lg text-white placeholder:text-neutral-600 tracking-widest"
                                                    value={formData.giftCardCode}
                                                    onChange={(e) => setFormData({...formData, giftCardCode: e.target.value})}
                                                />
                                            </div>
                                            
                                            <div className="flex flex-col gap-4 mt-6">
                                                <div className="flex items-center justify-between px-1">
                                                     <p className="text-[11px] text-neutral-400 font-bold italic leading-tight">
                                                        {formData.paymentMethod === 'PayPal' 
                                                            ? '*Beli Code via PayPal (Instant Delivery):' 
                                                            : '*Beli Code Rewarble Official:'}
                                                    </p>
                                                </div>
                                               
                                                <Button 
                                                    className={`relative h-16 rounded-2xl border transition-all group overflow-hidden shadow-lg ${
                                                        formData.paymentMethod === 'PayPal'
                                                        ? 'border-[#003087]/50 bg-[#003087]/20 hover:bg-[#003087]/30'
                                                        : 'border-primary/30 bg-primary/10 hover:bg-primary/20'
                                                    }`}
                                                    onClick={() => window.open(
                                                        formData.paymentMethod === 'PayPal'
                                                            ? "https://www.g2a.com/paypal-gift-card-50-eur-by-rewarble-global-i10000339995013"
                                                            : "https://rewarble.com/buy", 
                                                        "_blank"
                                                    )}
                                                >
                                                    <div className="absolute inset-0 flex items-center justify-between px-5 z-10">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 shrink-0 rounded-full bg-white flex items-center justify-center p-0.5 shadow-md">
                                                                {formData.paymentMethod === 'PayPal' ? (
                                                                    <img 
                                                                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/2560px-PayPal.svg.png" 
                                                                        alt="PayPal" 
                                                                        className="h-full w-full object-contain scale-75"
                                                                    />
                                                                ) : (
                                                                    <img 
                                                                        src="https://gamecardsdirect.com/content/picture/119926/rewarble-60.png" 
                                                                        alt="Rewarble" 
                                                                        className="h-full w-full object-contain scale-90"
                                                                    />
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col items-start gap-0.5">
                                                                <span className={`text-xs font-black uppercase tracking-widest drop-shadow-sm ${
                                                                    formData.paymentMethod === 'PayPal' ? 'text-[#009cde]' : 'text-primary'
                                                                }`}>
                                                                    Buy {formData.paymentMethod}
                                                                </span>
                                                                <span className="text-[10px] text-white/90 font-bold tracking-wide">
                                                                    {formData.paymentMethod === 'PayPal' ? 'via G2A (Instant)' : 'Official Store'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className={`text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider group-hover:scale-105 transition-transform shadow-lg border border-white/10 ${
                                                            formData.paymentMethod === 'PayPal' ? 'bg-[#003087]' : 'bg-primary text-black'
                                                        }`}>
                                                            Buy Now
                                                        </div>
                                                    </div>
                                                </Button>
                                            </div>
                                        </div>

                                        {error && (
                                            <div className="flex items-center gap-3 text-red-200 bg-red-950/50 p-4 rounded-xl border border-red-500/20">
                                                <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
                                                <span className="text-xs font-bold uppercase tracking-wide">{error}</span>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4 mt-2">
                                            <Button 
                                                variant="outline"
                                                className="h-12 rounded-xl border-white/10 bg-transparent hover:bg-white/5 font-black uppercase tracking-widest text-[10px] text-white"
                                                onClick={() => setStep(1)}
                                                disabled={isSubmitting}
                                            >
                                                Back
                                            </Button>
                                            <Button 
                                                className="h-12 rounded-xl bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest hover:scale-[1.01] transition-all"
                                                onClick={handleSubmit}
                                                disabled={isSubmitting || !formData.giftCardCode}
                                            >
                                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Kirim Pembayaran"}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>

                    ) : (
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center space-y-6 py-4"
                        >
                            <div className="h-20 w-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
                                <CheckCircle2 className="h-10 w-10 text-green-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Berhasil Terkirim!</h3>
                                <p className="text-sm text-muted-foreground font-medium">
                                    Data pembayaran Anda sedang diverifikasi. Proses verifikasi memakan waktu sekitar <span className="text-white font-bold">1 - 5 menit</span>.
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                Silakan tunggu konfirmasi di Discord atau hubungi support jika ada kendala.
                            </div>
                            <Button 
                                className="w-full h-12 rounded-xl bg-white text-black font-black uppercase tracking-widest"
                                onClick={() => onOpenChange(false)}
                            >
                                Selesai
                            </Button>
                        </motion.div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
