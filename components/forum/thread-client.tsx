"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeReplies } from "@/hooks/use-realtime";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { BadgesDisplay } from "@/components/badges-display";
import { ForumBadge } from "@/components/forum-badge";
import {
    ArrowLeft,
    MessageSquare,
    Eye,
    Share2,
    Flag,
    Pin,
    Lock,
    ThumbsUp,
    ThumbsDown,
    Crown,
    Shield,
    Reply,
    MoreHorizontal,
    Bookmark,
    Clock,
    Send,
    ImageIcon,
    Link2,
    AtSign,
    Loader2,
    X,
    ChevronLeft,
    ChevronRight,
    Zap,
    Activity,
    RefreshCw,
    Bell,
    Hash,
    Heart,
    CheckCircle,
    AlertCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormattedText } from "@/components/formatted-text";
import { getThreadType, getCategoryColor } from "@/lib/thread-types";

interface Author {
    id: string;
    username: string;
    avatar: string | null;
    membership: string;
    reputation?: number;
    xp?: number;
    level?: number;
}

interface ReplyData {
    id: string;
    content: string;
    author: Author | null;
    likes: number;
    isEdited: boolean;
    createdAt: string;
}

interface ThreadData {
    id: string;
    title: string;
    content: string;
    category: string;
    categoryId: string;
    author: Author | null;
    replies: ReplyData[];
    repliesCount: number;
    likes: number;
    views: number;
    isPinned: boolean;
    isLocked: boolean;
    threadType?: string;
    images: string[];
    createdAt: string;
}

interface ThreadClientProps {
    initialThread: ThreadData | null
    threadId: string
}

export function ThreadClient({ initialThread, threadId }: ThreadClientProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const { toast } = useToast();

    // Realtime replies hook
    const {
        replies: realtimeReplies,
        loading: repliesLoading,
        refetch: refetchReplies,
        isConnected,
        lastUpdate,
    } = useRealtimeReplies(threadId);

    const [thread, setThread] = useState<ThreadData | null>(initialThread);
    const [loading, setLoading] = useState(!initialThread);
    const [replyContent, setReplyContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [likingThread, setLikingThread] = useState(false);
    const [dislikingThread, setDislikingThread] = useState(false);
    const [likingReplyIds, setLikingReplyIds] = useState<Record<string, boolean>>({});
    const [dislikingReplyIds, setDislikingReplyIds] = useState<Record<string, boolean>>({});
    const [reportOpen, setReportOpen] = useState(false);
    const [reportTarget, setReportTarget] = useState<{ type: "thread" | "reply"; id: string } | null>(null);
    const [reportReason, setReportReason] = useState<string>("spam");
    const [reportDescription, setReportDescription] = useState<string>("");
    const [reportSubmitting, setReportSubmitting] = useState(false);

    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showLinkInsert, setShowLinkInsert] = useState(false);
    const [showMentionSearch, setShowMentionSearch] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [linkText, setLinkText] = useState("");
    const [mentionSearch, setMentionSearch] = useState("");
    const [mentionResults, setMentionResults] = useState<any[]>([]);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [replyToDelete, setReplyToDelete] = useState<string | null>(null);

    // Fetch thread data if not provided (fallback)
    useEffect(() => {
        if (!initialThread && threadId) {
            const fetchThread = async () => {
                try {
                    const res = await fetch(`/api/forum/threads/${threadId}`);
                    if (!res.ok) {
                        console.error("Thread not found/failed");
                        // router.push("/forum"); // DISABLED: Let user see error UI
                        return;
                    }
                    const data = await res.json();
                    setThread(data);
                } catch (error) {
                    console.error("Error fetching thread:", error);
                    // router.push("/forum"); // DISABLED: Let user see error UI
                } finally {
                    setLoading(false);
                }
            };
            fetchThread();
        }
    }, [threadId, router, initialThread]);

    // Saved state
    useEffect(() => {
        if (!threadId) return;
        if (typeof window === "undefined") return;

        try {
            const key = `saved_threads:${session?.user?.id || "anon"}`;
            const raw = window.localStorage.getItem(key);
            const savedIds = raw ? (JSON.parse(raw) as string[]) : [];
            setIsSaved(Array.isArray(savedIds) ? savedIds.includes(threadId) : false);
        } catch {
            setIsSaved(false);
        }
    }, [threadId, session?.user?.id]);

    // Sync realtime replies with thread state
    useEffect(() => {
        if (repliesLoading) return;

        // Only update if we have replies data
        if (realtimeReplies.length === 0 && repliesLoading) return;

        setThread((prev) => {
            if (!prev) return null;
            // Only update if replies actually changed
            if (prev.replies === realtimeReplies) return prev;
            return {
                ...prev,
                replies: realtimeReplies,
                repliesCount: realtimeReplies.length,
            };
        });
    }, [realtimeReplies, repliesLoading]);

    const handleShare = async () => {
        try {
            const url = typeof window !== "undefined" ? window.location.href : "";
            if (!url) return;
            await navigator.clipboard.writeText(url);
            toast({ title: "Copied", description: "Thread link copied to clipboard" });
        } catch {
            toast({
                title: "Copy failed",
                description: "Unable to copy link automatically",
                variant: "destructive",
            });
        }
    };

    const toggleDislike = async (targetType: "thread" | "reply", targetId: string) => {
        if (!session?.user) {
            toast({ title: "Login Required", description: "Please login to dislike content", variant: "destructive" });
            return;
        }

        if (targetType === "thread") {
            if (dislikingThread) return;
            setDislikingThread(true);
        } else {
            if (dislikingReplyIds[targetId]) return;
            setDislikingReplyIds((prev) => ({ ...prev, [targetId]: true }));
        }

        try {
            const res = await fetch("/api/dislikes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetId, targetType }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Failed to update dislike");

            toast({ title: data.disliked ? "Disliked" : "Dislike removed" });
        } catch (error) {
            toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to update dislike", variant: "destructive" });
        } finally {
            if (targetType === "thread") {
                setDislikingThread(false);
            } else {
                setDislikingReplyIds((prev) => ({ ...prev, [targetId]: false }));
            }
        }
    };

    const toggleLike = async (targetType: "thread" | "reply", targetId: string) => {
        if (!session?.user) {
            toast({
                title: "Login Required",
                description: "Please login to like content",
                variant: "destructive",
            });
            return;
        }

        if (targetType === "thread") {
            if (likingThread) return;
            setLikingThread(true);
        } else {
            if (likingReplyIds[targetId]) return;
            setLikingReplyIds((prev) => ({ ...prev, [targetId]: true }));
        }

        try {
            const res = await fetch("/api/likes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetId, targetType }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || "Failed to update like");
            }

            const liked = Boolean(data?.liked);

            if (targetType === "thread") {
                setThread((prev) =>
                    prev
                        ? {
                            ...prev,
                            likes: Math.max(0, (prev.likes || 0) + (liked ? 1 : -1)),
                        }
                        : prev,
                );
            } else {
                setThread((prev) =>
                    prev
                        ? {
                            ...prev,
                            replies: prev.replies.map((r) =>
                                r.id === targetId
                                    ? { ...r, likes: Math.max(0, (r.likes || 0) + (liked ? 1 : -1)) }
                                    : r,
                            ),
                        }
                        : prev,
                );
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update like",
                variant: "destructive",
            });
        } finally {
            if (targetType === "thread") {
                setLikingThread(false);
            } else {
                setLikingReplyIds((prev) => ({ ...prev, [targetId]: false }));
            }
        }
    };

    const openReport = (type: "thread" | "reply", id: string) => {
        if (!session?.user) {
            toast({
                title: "Login Required",
                description: "Please login to report content",
                variant: "destructive",
            });
            return;
        }

        setReportTarget({ type, id });
        setReportReason("spam");
        setReportDescription("");
        setReportOpen(true);
    };

    const toggleSave = () => {
        if (!threadId) return;
        if (typeof window === "undefined") return;

        try {
            const key = `saved_threads:${session?.user?.id || "anon"}`;
            const raw = window.localStorage.getItem(key);
            const savedIds = raw ? (JSON.parse(raw) as string[]) : [];

            const next = Array.isArray(savedIds) ? [...savedIds] : [];

            const idx = next.indexOf(threadId);
            const willSave = idx === -1;
            if (willSave) next.push(threadId);
            else next.splice(idx, 1);

            window.localStorage.setItem(key, JSON.stringify(next));
            setIsSaved(willSave);
            toast({
                title: willSave ? "Saved" : "Removed",
                description: willSave ? "Thread saved locally." : "Thread removed from saved list.",
            });
        } catch {
            toast({
                title: "Save failed",
                description: "Unable to save this thread in your browser.",
                variant: "destructive",
            });
        }
    };

    const submitReport = async () => {
        if (!reportTarget) return;
        if (reportSubmitting) return;

        setReportSubmitting(true);
        try {
            const res = await fetch("/api/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: reportTarget.type,
                    targetId: reportTarget.id,
                    reason: reportReason,
                    description: reportDescription || undefined,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || "Failed to submit report");
            }

            setReportOpen(false);
            setReportTarget(null);
            toast({ title: "Report submitted", description: "Thanks for helping keep the forum clean." });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to submit report",
                variant: "destructive",
            });
        } finally {
            setReportSubmitting(false);
        }
    };

    const handleSubmitReply = async () => {
        if (!session) {
            toast({
                title: "Login Required",
                description: "Please login to post a reply",
                variant: "destructive",
            });
            return;
        }

        const trimmedContent = replyContent.trim();
        if (!trimmedContent) {
            toast({
                title: "Error",
                description: "Please enter a reply",
                variant: "destructive",
            });
            return;
        }

        if (trimmedContent.length > 10000) {
            toast({
                title: "Error",
                description: "Reply is too long (max 10000 characters)",
                variant: "destructive",
            });
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`/api/forum/threads/${threadId}/replies`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: trimmedContent }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to post reply");
            }

            const newReply = await res.json();

            setThread((prev) =>
                prev
                    ? {
                        ...prev,
                        replies: [...prev.replies, newReply],
                        repliesCount: prev.repliesCount + 1,
                    }
                    : null,
            );

            refetchReplies();

            setReplyContent("");
            toast({
                title: "Success",
                description: "Reply posted successfully!",
            });
        } catch (error) {
            console.error("Reply error:", error);
            toast({
                title: "Error",
                description:
                    error instanceof Error ? error.message : "Failed to post reply",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const openLightbox = (index: number) => {
        setCurrentImageIndex(index);
        setLightboxOpen(true);
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
    };

    const nextImage = () => {
        if (thread?.images) {
            setCurrentImageIndex((prev) => (prev + 1) % thread.images.length);
        }
    };

    const insertLink = () => {
        if (!linkUrl.trim()) return;
        const text = linkText.trim() || linkUrl;
        const markdown = `[${text}](${linkUrl})`;
        setReplyContent(prev => prev + markdown);
        setLinkUrl("");
        setLinkText("");
        setShowLinkInsert(false);
        toast({ title: "Link inserted" });
    };

    const searchMentions = async (query: string) => {
        if (query.length < 2) {
            setMentionResults([]);
            return;
        }
        try {
            const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}&limit=5`);
            const data = await res.json();
            setMentionResults(data.users || []);
        } catch (error) {
            console.error("Mention search error:", error);
        }
    };

    const insertMention = (username: string) => {
        setReplyContent(prev => prev + `@${username} `);
        setShowMentionSearch(false);
        setMentionSearch("");
        setMentionResults([]);
    };

    const deleteReply = async (replyId: string) => {
        if (!session?.user) return;
        setReplyToDelete(replyId);
        setDeleteDialogOpen(true);
    };

    const confirmDeleteReply = async () => {
        if (!replyToDelete) return;
        const replyId = replyToDelete;

        try {
            const res = await fetch(`/api/forum/replies/${replyId}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete");

            setThread(prev => prev ? {
                ...prev,
                replies: prev.replies.filter(r => r.id !== replyId),
                repliesCount: prev.repliesCount - 1
            } : null);

            toast({ title: "Reply deleted" });
            refetchReplies();
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete reply", variant: "destructive" });
        } finally {
            setDeleteDialogOpen(false);
            setReplyToDelete(null);
        }
    };

    const prevImage = () => {
        if (thread?.images) {
            setCurrentImageIndex(
                (prev) => (prev - 1 + thread.images.length) % thread.images.length,
            );
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!session?.user) {
            toast({ title: "Login Required", description: "Please login to upload images", variant: "destructive" });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast({ title: "File too large", description: "Max file size is 5MB", variant: "destructive" });
            return;
        }

        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload/image", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Upload failed");
            }

            const { url } = await res.json();
            setReplyContent(prev => prev + `\n![image](${url})\n`);
            toast({ title: "Image uploaded", description: "Image added to your reply" });
        } catch (error) {
            toast({
                title: "Upload failed",
                description: error instanceof Error ? error.message : "Failed to upload image",
                variant: "destructive"
            });
        } finally {
            setUploadingImage(false);
            e.target.value = "";
        }
    };

    if (loading) {
        return (
            <div className="p-4 md:p-6 lg:p-8 max-w-5xl space-y-6">
                {/* Breadcrumb Skeleton */}
                <div className="flex gap-2 mb-6">
                    <Skeleton className="h-6 w-20 bg-white/5" />
                    <Skeleton className="h-6 w-32 bg-white/5" />
                    <Skeleton className="h-6 w-48 bg-white/5" />
                </div>

                {/* Header Skeleton */}
                <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                    <div className="h-16 border-b border-white/5 bg-white/5 p-4 flex items-center justify-between">
                        <Skeleton className="h-8 w-64 bg-white/5" />
                        <div className="flex gap-2">
                            <Skeleton className="h-8 w-20 bg-white/5" />
                            <Skeleton className="h-8 w-20 bg-white/5" />
                        </div>
                    </div>
                    <div className="p-6 space-y-6">
                        <Skeleton className="h-10 w-3/4 bg-white/5" />
                        <div className="flex gap-4">
                            <Skeleton className="h-14 w-14 rounded-xl bg-white/5" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32 bg-white/5" />
                                <Skeleton className="h-3 w-24 bg-white/5" />
                            </div>
                        </div>
                        <div className="space-y-3 pt-6">
                            <Skeleton className="h-4 w-full bg-white/5" />
                            <Skeleton className="h-4 w-full bg-white/5" />
                            <Skeleton className="h-4 w-2/3 bg-white/5" />
                        </div>
                    </div>
                </div>

                {/* Replies Skeleton */}
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-48 w-full rounded-xl bg-white/5" />
                    ))}
                </div>
            </div>
        );
    }

    if (!thread) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[50vh]">
                <Card className="glass border-dashed border-2 border-white/10 max-w-md w-full text-center p-8">
                    <div className="h-16 w-16 rounded-full bg-secondary/30 flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Thread Not Found</h3>
                    <p className="text-muted-foreground mb-6">
                        The thread you are looking for does not exist or has been removed.
                    </p>
                    <Link href="/forum">
                        <Button variant="default">Back to Forum</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-5xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <Link
                    href="/forum"
                    className="hover:text-primary transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Forum
                </Link>
                <span className="text-white/20">/</span>
                <Link
                    href={`/forum/category/${thread.categoryId}`}
                    className="hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                >
                    {thread.category}
                </Link>
                <span className="text-white/20">/</span>
                <span className="text-foreground truncate max-w-[200px] px-3 py-1.5 bg-white/5 rounded-lg">
                    {thread.title}
                </span>
            </div>

            {/* Thread Content & Rest of the UI is inferred to be here, copying from original file strictly */}
            {/* Thread Header Card */}
            <div className="glass rounded-2xl overflow-hidden mb-6 border border-white/5">
                {/* Thread Meta Bar */}
                <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/5 bg-gradient-to-r from-primary/10 via-purple-500/5 to-transparent">
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Thread Type Badge */}
                        {(() => {
                            const tt = getThreadType(thread.threadType);
                            return (
                                <Badge 
                                    className="gap-1.5 h-6 px-2.5 text-[10px] font-black uppercase tracking-wider"
                                    style={{ backgroundColor: tt.bgColor, color: tt.color, border: `1px solid ${tt.color}40` }}
                                >
                                    <span className="text-xs">{tt.icon}</span>
                                    {tt.name}
                                </Badge>
                            );
                        })()}

                        {thread.isPinned && (
                            <Badge className="bg-primary/20 text-primary border-primary/30 gap-1.5 h-6 px-2.5 text-[10px] font-black uppercase">
                                <Pin className="h-3 w-3" />
                                Pinned
                            </Badge>
                        )}
                        {thread.isLocked && (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 gap-1.5 h-6 px-2.5 text-[10px] font-black uppercase">
                                <Lock className="h-3 w-3" />
                                Locked
                            </Badge>
                        )}
                        <Badge 
                            variant="outline" 
                            className="bg-white/5 text-foreground border-white/10 h-6 px-2.5 text-[10px] font-black uppercase"
                        >
                            {thread.category}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 gap-1.5 text-muted-foreground hover:text-primary hover:bg-white/5 rounded-xl"
                            onClick={toggleSave}
                        >
                            <Bookmark className={`h-4 w-4 ${isSaved ? "text-primary" : ""}`} />
                            <span className="hidden sm:inline">{isSaved ? "Saved" : "Save"}</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 gap-1.5 text-muted-foreground hover:text-red-400 hover:bg-white/5 rounded-xl"
                            onClick={() => openReport("thread", thread.id)}
                        >
                            <Flag className="h-4 w-4" />
                            <span className="hidden sm:inline">Report</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 gap-1.5 text-muted-foreground hover:text-primary hover:bg-white/5 rounded-xl"
                            onClick={handleShare}
                        >
                            <Share2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Share</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-white/5 rounded-xl"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Thread Content */}
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-foreground mb-6">
                        {thread.title}
                    </h1>

                    {/* Author Card */}
                    <div className="flex gap-4">
                        <div className="shrink-0">
                            <div className="relative">
                                <img
                                    src={
                                        thread.author?.avatar ||
                                        "/placeholder.svg?height=56&width=56&query=user avatar"
                                    }
                                    alt={thread.author?.username || "User"}
                                    className="h-14 w-14 rounded-xl object-cover ring-2 ring-border"
                                />
                                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full status-online border-2 border-card" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-foreground">
                                    {thread.author?.username || "Unknown User"}
                                </span>
                                <ForumBadge membership={thread.author?.membership || "free"} />
                                {thread.author?.level && (
                                    <Badge variant="outline" className="text-xs h-5 px-1.5">
                                        Lv. {thread.author.level}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDistanceToNow(new Date(thread.createdAt), {
                                        addSuffix: true,
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 prose prose-invert max-w-none">
                        <FormattedText content={thread.content} />
                    </div>

                    {/* Images Grid */}
                    {thread.images && thread.images.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {thread.images.map((img, idx) => (
                                <div key={idx} className="relative group rounded-lg overflow-hidden cursor-pointer w-32 h-32 md:w-48 md:h-48 border border-white/10" onClick={() => openLightbox(idx)}>
                                    <img src={img} alt={`Thread image ${idx + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Eye className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className={`gap-1.5 rounded-xl border-white/10 ${(thread.likes || 0) > 0 ? "text-primary border-primary/20 bg-primary/5" : ""
                                }`}
                            onClick={() => toggleLike("thread", thread.id)}
                            disabled={likingThread}
                        >
                            <ThumbsUp className={`h-4 w-4 ${likingThread ? "animate-pulse" : ""}`} />
                            <span>{thread.likes || 0}</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 rounded-xl border-white/10"
                            onClick={() => toggleDislike("thread", thread.id)}
                            disabled={dislikingThread}
                        >
                            <ThumbsDown className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <Eye className="h-4 w-4" />
                            {thread.views?.toLocaleString() || 0}
                        </span>
                        <span className="mx-2">•</span>
                        <span className="flex items-center gap-1.5">
                            <MessageSquare className="h-4 w-4" />
                            {thread.repliesCount || 0}
                        </span>
                    </div>
                </div>
            </div>

            {/* Reply Input */}
            {!thread.isLocked ? (
                <Card className="glass mb-8 overflow-hidden border border-white/10">
                    <CardContent className="p-4">
                        <div className="flex gap-4">
                            <div className="hidden md:block">
                                <img
                                    src={session?.user?.image || "/placeholder.svg?height=40&width=40"}
                                    alt="My Avatar"
                                    className="h-10 w-10 rounded-xl object-cover ring-2 ring-border"
                                />
                            </div>
                            <div className="flex-1 space-y-4">
                                <div className="relative">
                                    <Textarea
                                        placeholder="Write a reply..."
                                        value={replyContent}
                                        onChange={(e) => {
                                            setReplyContent(e.target.value);
                                            // Simple mention check logic could go here
                                        }}
                                        className="min-h-[120px] bg-white/5 border-white/10 focus:border-primary/50 resize-y rounded-xl pr-12"
                                    />
                                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                        <input
                                            type="file"
                                            id="image-upload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={uploadingImage}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-primary"
                                            onClick={() => document.getElementById("image-upload")?.click()}
                                            disabled={uploadingImage}
                                        >
                                            {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="text-xs text-muted-foreground">
                                        Markdown supported
                                    </div>
                                    <Button
                                        onClick={handleSubmitReply}
                                        disabled={submitting || !replyContent.trim()}
                                        className="rounded-xl px-6"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Posting...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-4 w-4" />
                                                Post Reply
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-8 flex items-center gap-3 text-yellow-500">
                    <Lock className="h-5 w-5" />
                    <span className="font-medium">This thread is locked. You cannot post new replies.</span>
                </div>
            )}

            {/* Replies List */}
            <div className="space-y-4">
                {thread.replies.map((reply) => (
                    <motion.div
                        key={reply.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        id={`reply-${reply.id}`}
                    >
                        <Card className="glass border border-white/5 overflow-hidden group">
                            <CardContent className="p-6">
                                <div className="flex gap-4">
                                    <div className="shrink-0 hidden md:block group/avatar relative">
                                        <img
                                            src={reply.author?.avatar || "/placeholder.svg?height=40&width=40"}
                                            alt={reply.author?.username || "User"}
                                            className="h-10 w-10 rounded-lg object-cover ring-2 ring-white/10"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-sm">{reply.author?.username || "Unknown"}</span>
                                                {reply.author?.membership === 'vip' && <Badge variant="secondary" className="text-[10px] h-5">VIP</Badge>}
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                                </span>
                                                {reply.isEdited && <span className="text-xs text-muted-foreground italic">(edited)</span>}
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/5" onClick={() => openReport("reply", reply.id)}>
                                                    <Flag className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                                {session?.user?.id === reply.author?.id && (
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-red-500/10 hover:text-red-400" onClick={() => deleteReply(reply.id)}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="prose prose-invert prose-sm max-w-none mb-4 text-gray-300">
                                            <FormattedText content={reply.content} />
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleLike("reply", reply.id)}
                                                disabled={likingReplyIds[reply.id]}
                                                className={`h-8 gap-1.5 rounded-lg text-xs ${reply.likes > 0 ? "text-primary bg-primary/5" : "text-muted-foreground hover:bg-white/5"}`}
                                            >
                                                <ThumbsUp className="h-3 w-3" />
                                                {reply.likes > 0 && <span>{reply.likes}</span>}
                                                Like
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 gap-1.5 rounded-lg text-xs text-muted-foreground hover:bg-white/5"
                                                onClick={() => setReplyContent((prev) => prev + `> @${reply.author?.username} said:\n> ${reply.content.substring(0, 50)}...\n\n`)}
                                            >
                                                <Reply className="h-3 w-3" />
                                                Reply
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
                {thread.replies.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p>No replies yet. Be the first to share your thoughts!</p>
                    </div>
                )}
            </div>

            {/* Deletion Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Reply?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your reply.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteReply} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Report Dialog */}
            <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Report Content</DialogTitle>
                        <DialogDescription>
                            Help us understand what's wrong with this content.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Reason</Label>
                            <Select value={reportReason} onValueChange={setReportReason}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="spam">Spam or Advertising</SelectItem>
                                    <SelectItem value="harassment">Harassment or Hate Speech</SelectItem>
                                    <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Description (Optional)</Label>
                            <Textarea
                                value={reportDescription}
                                onChange={(e) => setReportDescription(e.target.value)}
                                placeholder="Provide more details..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReportOpen(false)}>Cancel</Button>
                        <Button onClick={submitReport} disabled={reportSubmitting}>
                            {reportSubmitting ? "Submitting..." : "Submit Report"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Lightbox */}
            {lightboxOpen && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center">
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    <button
                        onClick={prevImage}
                        className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <ChevronLeft className="h-8 w-8" />
                    </button>

                    <img
                        src={thread.images[currentImageIndex]}
                        alt="Full screen view"
                        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
                    />

                    <button
                        onClick={nextImage}
                        className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <ChevronRight className="h-8 w-8" />
                    </button>
                </div>
            )}
        </div>
    );
}
