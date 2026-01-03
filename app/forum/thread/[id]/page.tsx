"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeReplies } from "@/hooks/use-realtime";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
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
import { useParams, useRouter } from "next/navigation";

interface Author {
  id: string;
  username: string;
  avatar: string | null;
  membership: string;
  reputation?: number;
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
  images: string[];
  createdAt: string;
}

export default function ThreadPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const threadId = params?.id as string;

  // Realtime replies hook
  const { replies: realtimeReplies, loading: repliesLoading, refetch: refetchReplies } = useRealtimeReplies(threadId);

  const [thread, setThread] = useState<ThreadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch thread data
  useEffect(() => {
    const fetchThread = async () => {
      try {
        const res = await fetch(`/api/forum/threads/${params?.id}`);
        if (!res.ok) {
          router.push("/forum");
          return;
        }
        const data = await res.json();
        setThread(data);
      } catch (error) {
        console.error("Error fetching thread:", error);
        router.push("/forum");
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      fetchThread();
    }
  }, [params?.id, router]);

  // Realtime subscription for replies
  useEffect(() => {
    if (!threadId) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    
    const channel = supabase
      .channel(`thread-replies:${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "forum_replies",
          filter: `thread_id=eq.${threadId}`,
        },
        () => {
          setLastUpdate(new Date());
          refetchReplies();
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [threadId, refetchReplies]);

  // Sync realtime replies with thread state
  useEffect(() => {
    if (realtimeReplies && realtimeReplies.length > 0 && thread) {
      setThread((prev) =>
        prev
          ? {
              ...prev,
              replies: realtimeReplies,
              repliesCount: realtimeReplies.length,
            }
          : null
      );
    }
  }, [realtimeReplies]);

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
      const res = await fetch(`/api/forum/threads/${params?.id}/replies`, {
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

  const prevImage = () => {
    if (thread?.images) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + thread.images.length) % thread.images.length,
      );
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-14 w-14 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto" />
            <MessageSquare className="h-5 w-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-muted-foreground">Loading thread...</p>
        </div>
      </div>
    );
  }

  if (!thread) {
    return null;
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

      {/* Thread Header Card */}
      <div className="glass rounded-2xl overflow-hidden mb-6 border border-white/5">
        {/* Thread Meta Bar */}
        <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/5 bg-gradient-to-r from-primary/5 to-purple-500/5">
          <div className="flex items-center gap-2 flex-wrap">
            {thread.isPinned && (
              <Badge className="bg-gradient-to-r from-primary/20 to-pink-500/20 text-primary border-primary/30 gap-1.5">
                <Pin className="h-3 w-3" />
                Pinned
              </Badge>
            )}
            {thread.isLocked && (
              <Badge className="bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-400 border-red-500/30 gap-1.5">
                <Lock className="h-3 w-3" />
                Locked
              </Badge>
            )}
            <Badge className="bg-white/5 text-foreground border-white/10">
              {thread.category}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5 text-muted-foreground hover:text-primary hover:bg-white/5 rounded-xl"
            >
              <Bookmark className="h-4 w-4" />
              <span className="hidden sm:inline">Save</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5 text-muted-foreground hover:text-primary hover:bg-white/5 rounded-xl"
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
                {thread.author?.membership === "vip" && (
                  <Badge className="bg-primary/20 text-primary text-[10px] px-1.5 py-0">
                    <Crown className="h-3 w-3 mr-0.5" />
                    VIP
                  </Badge>
                )}
                {thread.author?.membership === "admin" && (
                  <Badge className="bg-destructive/20 text-destructive text-[10px] px-1.5 py-0">
                    <Shield className="h-3 w-3 mr-0.5" />
                    Admin
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(thread.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                {thread.author?.reputation && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                    <span>
                      {thread.author.reputation.toLocaleString()} reputation
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mt-6 pl-[72px]">
            <div className="prose prose-invert max-w-none">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap text-[15px]">
                {thread.content}
              </p>
            </div>

            {thread.images && thread.images.length > 0 && (
              <div className="mt-6">
                <div
                  className={`grid gap-3 ${
                    thread.images.length === 1
                      ? "grid-cols-1"
                      : thread.images.length === 2
                        ? "grid-cols-2"
                        : thread.images.length === 3
                          ? "grid-cols-3"
                          : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                  }`}
                >
                  {thread.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => openLightbox(index)}
                      className="relative aspect-video rounded-xl overflow-hidden bg-secondary/50 group cursor-pointer"
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors" />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {thread.images.length} image
                  {thread.images.length > 1 ? "s" : ""} - Click to view
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-1.5 rounded-full bg-secondary/50 hover:bg-secondary"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span className="font-medium">{thread.likes}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-1.5 rounded-full hover:bg-secondary"
                >
                  <ThumbsDown className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4" />
                  {thread.repliesCount} replies
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  {thread.views.toLocaleString()} views
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Realtime Status Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mb-6 p-3 rounded-xl border flex items-center justify-between ${
          isConnected 
            ? "bg-green-500/5 border-green-500/20" 
            : "bg-yellow-500/5 border-yellow-500/20"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-yellow-500 animate-pulse"}`} />
          <span className="text-sm font-medium">
            {isConnected ? "Real-time replies active" : "Connecting..."}
          </span>
          <span className="text-xs text-muted-foreground">
            Last update: {formatDistanceToNow(lastUpdate, { addSuffix: true })}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => refetchReplies()}
          className="gap-2 text-xs"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </Button>
      </motion.div>

      {/* Replies */}
      <Card className="mb-6 overflow-hidden border-border/50">
        <div className="p-4 border-b border-border/50 bg-gradient-to-r from-cyan-500/10 to-blue-500/5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-cyan-400" />
              Replies ({thread.replies.length})
            </h2>
            <div className="flex items-center gap-2">
              {repliesLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              <Badge variant="outline" className="text-xs gap-1">
                <Activity className="h-3 w-3" />
                Real-time
              </Badge>
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-4">
            <AnimatePresence>
              {thread.replies.length > 0 ? (
                thread.replies.map((reply: ReplyData, index: number) => (
                  <motion.div 
                    key={reply.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-2xl p-5 bg-muted/20 border border-transparent hover:border-primary/20 transition-all"
                  >
                    <div className="flex gap-4">
                      <div className="shrink-0">
                        <div className="h-11 w-11 rounded-xl overflow-hidden bg-gradient-to-br from-primary/50 to-purple-500/50">
                          {reply.author?.avatar ? (
                            <Image
                              src={reply.author.avatar}
                              alt={reply.author?.username || "User"}
                              width={44}
                              height={44}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-white font-bold">
                              {reply.author?.username?.[0]?.toUpperCase() || "U"}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-foreground">
                              {reply.author?.username || "Unknown"}
                            </span>
                            {reply.author?.membership === "vip" && (
                              <Badge className="bg-primary/20 text-primary text-[10px] px-1.5 py-0 gap-0.5">
                                <Crown className="h-3 w-3" />
                                VIP
                              </Badge>
                            )}
                            {reply.author?.membership === "admin" && (
                              <Badge className="bg-destructive/20 text-destructive text-[10px] px-1.5 py-0 gap-0.5">
                                <Shield className="h-3 w-3" />
                                Admin
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                            </span>
                            {reply.isEdited && (
                              <span className="text-[10px] text-muted-foreground italic">
                                (edited)
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
                            >
                              <Flag className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-foreground text-[15px] leading-relaxed mb-4 whitespace-pre-wrap">
                          {reply.content}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          >
                            <Heart className="h-3.5 w-3.5" />
                            {reply.likes || 0}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
                          >
                            <Reply className="h-3.5 w-3.5" />
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-2xl p-12 text-center bg-muted/10"
                >
                  <MessageSquare className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No replies yet</h3>
                  <p className="text-muted-foreground">
                    Be the first to share your thoughts!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Reply Form */}
      {!thread.isLocked ? (
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Write a Reply
          </h3>
          {session ? (
            <div className="space-y-4">
              <textarea
                className="w-full h-32 rounded-xl border border-border bg-secondary/30 p-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none resize-none transition-all"
                placeholder="Share your thoughts..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                disabled={submitting}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground"
                  >
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground"
                  >
                    <Link2 className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground"
                  >
                    <AtSign className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    className="rounded-xl bg-transparent"
                    onClick={() => setReplyContent("")}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary/90 rounded-xl gap-2 glow-sm"
                    onClick={handleSubmitReply}
                    disabled={submitting || !replyContent.trim()}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Post Reply
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">
                Please login to post a reply
              </p>
              <Link href="/login">
                <Button className="bg-primary hover:bg-primary/90">
                  Login to Reply
                </Button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="glass rounded-2xl p-8 text-center">
          <Lock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-1">Thread Locked</h3>
          <p className="text-muted-foreground">
            This thread has been locked and cannot receive new replies.
          </p>
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && thread && thread.images && thread.images.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>
          {thread.images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-colors z-10"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-colors z-10"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          <div
            className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={thread.images[currentImageIndex] || "/placeholder.svg"}
              alt={`Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
          </div>
          {thread.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-secondary/80 px-4 py-2 rounded-full text-sm">
              {currentImageIndex + 1} / {thread.images.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
