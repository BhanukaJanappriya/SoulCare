import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Needed for comments
import { ScrollArea } from "@/components/ui/scroll-area"; // Needed for comment list
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Eye, Edit, Trash2, CheckCircle, Clock, XCircle, AlertCircle, 
  Star, ThumbsUp, Heart, Lightbulb, MessageSquare, Send 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/api";
import { useAuth } from "@/hooks/useAuth";
import FullArticleDialog from "@/components/common/FullArticleDialog";

// --- STAR RATING COMPONENT ---
const StarRating = ({ rating, onRatingChange, isInteractive = false, size = "md" }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const starSize = size === "sm" ? "w-4 h-4" : "w-6 h-6";
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starSize} transition-colors ${isInteractive ? "cursor-pointer" : ""} ${ 
            (hoverRating || rating) >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300" 
          }`}
          onClick={() => isInteractive && onRatingChange?.(star)}
          onMouseEnter={() => isInteractive && setHoverRating(star)}
          onMouseLeave={() => isInteractive && setHoverRating(0)}
        />
      ))}
    </div>
  );
};

// --- STATUS HELPERS ---
const getStatusColor = (status) => {
  switch (status) {
    case "published": return "bg-green-500 hover:bg-green-600 text-white";
    case "pending": return "bg-orange-500 hover:bg-orange-600 text-white";
    case "draft": return "bg-gray-500 hover:bg-gray-600 text-white";
    case "rejected": return "bg-red-500 hover:bg-red-600 text-white";
    default: return "bg-gray-500 text-white";
  }
};
const getStatusIcon = (status) => {
  switch (status) {
    case "published": return <CheckCircle className="w-3 h-3 mr-1" />;
    case "pending": return <Clock className="w-3 h-3 mr-1" />;
    case "draft": return <Edit className="w-3 h-3 mr-1" />;
    case "rejected": return <XCircle className="w-3 h-3 mr-1" />;
    default: return <AlertCircle className="w-3 h-3 mr-1" />;
  }
};

export default function PatientBlogs() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [blogPosts, setBlogPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");

  // --- DIALOG STATES ---
  const [isArticleDialogOpen, setIsArticleDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Rating State
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [postToRate, setPostToRate] = useState(null);
  const [currentRating, setCurrentRating] = useState(0);

  // Comment State
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [activePostForComments, setActivePostForComments] = useState(null);
  const [commentsList, setCommentsList] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);

  // --- FETCH DATA ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/blogs/?status=published&sort_by=${sortBy}`);
      setBlogPosts(response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- HANDLERS ---

  const handleReadMore = (post) => {
    setSelectedArticle(post);
    setIsArticleDialogOpen(true);
  };

  // 1. RATE HANDLER
  const openRatingDialog = (post) => {
    setPostToRate(post);
    setCurrentRating(post.userRating || 0);
    setIsRatingDialogOpen(true);
  };

  const handleRatePost = async () => {
    if (!postToRate || currentRating === 0) {
      toast({ title: "Invalid", description: "Please select at least 1 star.", variant: "destructive" });
      return;
    }
    try {
      // Call API
      const response = await api.post(`/blogs/${postToRate.id}/rate/`, { rating: currentRating });
      
      // Update Local State
      setBlogPosts(blogPosts.map(p => p.id === postToRate.id ? response.data : p));
      
      toast({ title: "Success", description: "Rating submitted!" });
      setIsRatingDialogOpen(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit rating.", variant: "destructive" });
    }
  };

  // 2. REACTION HANDLER
  const handleReaction = async (postId, type) => {
    if (!user) {
        toast({ title: "Login Required", description: "Please login to react." });
        return;
    }

    // Optimistic Update
    const updatedPosts = blogPosts.map(post => {
      if (post.id === postId) {
        const currentReaction = post.userReaction; 
        const isRemoving = currentReaction === type; 
        
        let newLikeCount = post.likeCount || 0;
        let newHeartCount = post.heartCount || 0;
        let newInsightfulCount = post.insightfulCount || 0;

        // Remove old reaction count
        if (currentReaction === 'like') newLikeCount--;
        if (currentReaction === 'heart') newHeartCount--;
        if (currentReaction === 'insightful') newInsightfulCount--;

        // Add new reaction count
        if (!isRemoving) {
            if (type === 'like') newLikeCount++;
            if (type === 'heart') newHeartCount++;
            if (type === 'insightful') newInsightfulCount++;
        }

        return {
            ...post,
            userReaction: isRemoving ? null : type,
            likeCount: Math.max(0, newLikeCount),
            heartCount: Math.max(0, newHeartCount),
            insightfulCount: Math.max(0, newInsightfulCount)
        };
      }
      return post;
    });

    setBlogPosts(updatedPosts);

    try {
        await api.post(`/blogs/${postId}/react/`, { type });
    } catch (error) {
        console.error("Reaction failed", error);
        fetchData(); // Revert on error
    }
  };

  // 3. COMMENT HANDLER
  const openCommentDialog = async (post) => {
    setActivePostForComments(post);
    setNewCommentText("");
    setIsCommentDialogOpen(true);
    setIsCommentsLoading(true);
    try {
        const response = await api.get(`/blogs/${post.id}/comments/`);
        setCommentsList(response.data);
    } catch (error) {
        setCommentsList([]);
    } finally {
        setIsCommentsLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!activePostForComments || !newCommentText.trim()) return;

    try {
        const response = await api.post(`/blogs/${activePostForComments.id}/comments/`, { 
            content: newCommentText 
        });
        
        // Update Comment List
        setCommentsList([response.data, ...commentsList]);
        setNewCommentText("");
        
        // Update Comment Count on Card
        setBlogPosts(blogPosts.map(p => 
            p.id === activePostForComments.id 
            ? { ...p, commentCount: (p.commentCount || 0) + 1 } 
            : p
        ));

        toast({ title: "Posted", description: "Comment added successfully." });
    } catch (error) {
        toast({ title: "Error", description: "Failed to post comment", variant: "destructive" });
    }
  };

  return (
    <>
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-dark mb-2">SoulCare Articles</h1>
          <p className="text-text-muted">Insights for better mental health.</p>
        </div>

        {/* Sorting Bar */}
        <div className="flex justify-end items-center mb-6">
          <div className="flex items-center space-x-2">
            <Label htmlFor="sort">Sort By:</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger id="sort" className="w-[180px]">
                <SelectValue placeholder="Select sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="top_rated">Top Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Blog List */}
        <div className="flex flex-col gap-6">
          {isLoading ? (
            <div className="text-center py-10">Loading articles...</div>
          ) : blogPosts.length === 0 ? (
            <Card><CardContent className="text-center py-10">No articles found.</CardContent></Card>
          ) : (
            blogPosts.map((post) => (
              <Card key={post.id} className="w-full hover:shadow-md transition-all duration-200 border border-gray-200">
                
                {/* 1. Header */}
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-xl font-bold text-gray-800">{post.title}</CardTitle>
                      <Badge className={`${getStatusColor(post.status)} flex items-center px-2 py-0.5 text-xs font-medium`}>
                        {getStatusIcon(post.status)}
                        <span className="capitalize">{post.status}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-600" onClick={() => handleReadMore(post)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      {(user?.id === post.authorId || user?.role === 'admin') && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {/* 2. Content */}
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {post.excerpt || (post.content ? post.content.substring(0, 200) + "..." : "No preview.")}
                  </p>

                  <div className="h-px bg-gray-200 my-4 w-full"></div>

                  {/* 3. Engagement Row */}
                  <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                        {/* Star Display */}
                        <div className="flex">
                             <StarRating rating={post.averageRating || 0} size="sm" onRatingChange={undefined} />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">
                            {post.averageRating?.toFixed(1) || '0.0'} ({post.ratingCount || 0})
                        </span>
                        <div className="h-4 w-px bg-gray-300 mx-2"></div> 
                        
                        {/* Reactions Buttons */}
                        <div className="flex items-center gap-3 text-gray-500">
                             <button 
                                className={`flex items-center gap-1 cursor-pointer hover:text-blue-600 ${post.userReaction === 'like' ? 'text-blue-600 font-bold' : ''}`}
                                onClick={() => handleReaction(post.id, 'like')}
                             >
                                <ThumbsUp className={`w-4 h-4 ${post.userReaction === 'like' ? 'fill-current' : ''}`} /> 
                                <span className="text-xs">{post.likeCount || 0}</span>
                             </button>

                             <button 
                                className={`flex items-center gap-1 cursor-pointer hover:text-red-600 ${post.userReaction === 'heart' ? 'text-red-600 font-bold' : ''}`}
                                onClick={() => handleReaction(post.id, 'heart')}
                             >
                                <Heart className={`w-4 h-4 ${post.userReaction === 'heart' ? 'fill-current' : ''}`} /> 
                                <span className="text-xs">{post.heartCount || 0}</span>
                             </button>

                             <button 
                                className={`flex items-center gap-1 cursor-pointer hover:text-yellow-600 ${post.userReaction === 'insightful' ? 'text-yellow-600 font-bold' : ''}`}
                                onClick={() => handleReaction(post.id, 'insightful')}
                             >
                                <Lightbulb className={`w-4 h-4 ${post.userReaction === 'insightful' ? 'fill-current' : ''}`} /> 
                                <span className="text-xs">{post.insightfulCount || 0}</span>
                             </button>
                        </div>
                    </div>

                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200 h-8"
                        onClick={() => openRatingDialog(post)}
                    >
                        <Star className="w-3 h-3 mr-1.5" /> Rate
                    </Button>
                  </div>

                  {/* 4. Comment Button */}
                  <Button 
                    variant="secondary" 
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 justify-center h-9"
                    onClick={() => openCommentDialog(post)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2 opacity-60" />
                    {post.commentCount > 0 ? `View ${post.commentCount} Comments` : 'Add Comment'}
                  </Button>

                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* --- DIALOGS --- */}

      {/* 1. Full Article Dialog */}
      <FullArticleDialog
        post={selectedArticle}
        isOpen={isArticleDialogOpen}
        onOpenChange={setIsArticleDialogOpen}
        showEngagement={true} onReact={undefined} onRate={undefined} onComment={undefined}      />

      {/* 2. Rating Dialog */}
      <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Rate this Article</DialogTitle>
            <DialogDescription>How helpful was "{postToRate?.title}"?</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-6">
            <StarRating rating={currentRating} onRatingChange={setCurrentRating} isInteractive={true} size="md" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRatingDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRatePost}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Comments Dialog */}
      <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
        <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col">
            <DialogHeader>
                <DialogTitle>Comments</DialogTitle>
                <DialogDescription className="line-clamp-1">Discussion for "{activePostForComments?.title}"</DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="flex-1 pr-4 -mr-4 my-4">
                {isCommentsLoading ? (
                    <div className="text-center py-10 text-muted-foreground">Loading comments...</div>
                ) : commentsList.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground flex flex-col items-center gap-2">
                        <MessageSquare className="w-8 h-8 opacity-20" />
                        <p>No comments yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {commentsList.map((comment) => (
                            <div key={comment.id} className="flex gap-3 text-sm">
                                <Avatar className="w-8 h-8">
                                    <AvatarImage src={comment.authorAvatar} />
                                    <AvatarFallback>{comment.author ? comment.author.charAt(0).toUpperCase() : '?'}</AvatarFallback>
                                </Avatar>
                                <div className="bg-muted/50 p-3 rounded-lg flex-1">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="font-semibold text-foreground">{comment.author}</span>
                                        <span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-text-dark">{comment.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>

            <div className="flex items-center gap-2 pt-2 border-t mt-auto">
                <Input 
                    placeholder="Write a comment..." 
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                    className="flex-1"
                />
                <Button size="icon" onClick={handlePostComment} disabled={!newCommentText.trim()}>
                    <Send className="w-4 h-4" />
                </Button>
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
}