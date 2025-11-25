import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Edit, Trash2, Eye, Clock, CheckCircle, XCircle, AlertCircle, Star, ThumbsUp, Heart, MessageSquare, Send, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/api";
import RichTextEditor from "@/components/common/RichTextEditor";
import FullArticleDialog from "@/components/common/FullArticleDialog";

// --- START: STAR RATING COMPONENT ---
const StarRating = ({ rating, onRatingChange, isInteractive = false, size = "md" }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const starSize = size === "sm" ? "w-4 h-4" : "w-6 h-6";

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starSize} transition-colors ${isInteractive ? "cursor-pointer" : ""} ${ (hoverRating || rating) >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300" }`}
          onClick={() => isInteractive && onRatingChange?.(star)}
          onMouseEnter={() => isInteractive && setHoverRating(star)}
          onMouseLeave={() => isInteractive && setHoverRating(0)}
        />
      ))}
    </div>
  );
};
// --- END: STAR RATING COMPONENT ---

// --- UI Helper Functions ---
const getStatusColor = (status) => {
  switch (status) {
    case "published": return "bg-green-500 text-white";
    case "pending": return "bg-orange-500 text-white";
    case "draft": return "bg-back-500 text-white";
    case "rejected": return "bg-red-500 text-white";
    default: return "bg-gray-500 text-white";
  }
};
const getStatusIcon = (status) => {
  switch (status) {
    case "published": return <CheckCircle className="w-4 h-4" />;
    case "pending": return <Clock className="w-4 h-4" />;
    case "draft": return <Edit className="w-4 h-4" />;
    case "rejected": return <XCircle className="w-4 h-4" />;
    default: return <AlertCircle className="w-4 h-4" />;
  }
};

const initialPostState = { title: "", content: "", excerpt: "", tags: "", status: "draft" };

export default function Blogs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [blogPosts, setBlogPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Blog CRUD State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPost, setCurrentPost] = useState(initialPostState);
  const [currentPostId, setCurrentPostId] = useState(null);
  
  // Viewing State
  const [isArticleDialogOpen, setIsArticleDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  
  // Rating State
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [postToRate, setPostToRate] = useState(null);
  const [currentRating, setCurrentRating] = useState(0);
  const [sortBy, setSortBy] = useState("most-recent"); 
  
  // --- COMMENTS & REACTIONS STATE ---
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [activePostForComments, setActivePostForComments] = useState(null);
  const [commentsList, setCommentsList] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);

  // --- DATA FETCHING ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/blogs/?status=${activeTab}`);
      setBlogPosts(response.data);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      toast({ title: "Error", description: "Failed to load blog posts.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- CRUD HANDLERS ---
  const openCreateDialog = () => {
    setCurrentPost(initialPostState);
    setCurrentPostId(null);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (post) => {
    setCurrentPost({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || "",
      // Check if tags is an array (from backend) and join it, else use as string
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || ''), 
      status: post.status,
    });
    setCurrentPostId(post.id);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleReadMore = (post) => {
    setSelectedArticle(post);
    setIsArticleDialogOpen(true);
  };

  const handleSavePost = async () => {
    if (!currentPost.title || !currentPost.content) {
      toast({ title: "Validation Error", description: "Title and Content are required.", variant: "destructive" });
      return;
    }
    
    // --- FIX APPLIED HERE ---
    // We send the tags as a simple string "Tag1, Tag2" because the backend CharField expects a string.
    // The backend serializer (to_representation) will handle converting it back to an array for display.
    const tagsString = currentPost.tags;

    const isPatientCreating = user?.role === 'user' && !isEditing;
    const finalPostData = { 
      ...currentPost, 
      tags: tagsString,
      status: isPatientCreating ? 'pending' : currentPost.status 
    };

    try {
      if (isEditing && currentPostId) {
        await api.patch(`/blogs/${currentPostId}/`, finalPostData);
        toast({ title: "Post Updated", description: "Your blog post has been successfully updated." });
      } else {
        await api.post('/blogs/', finalPostData);
        const toastStatus = isPatientCreating ? 'pending (Awaiting Admin Review)' : finalPostData.status;
        toast({ title: "Post Created", description: `Your blog post has been saved as ${toastStatus}.` });
      }
      await fetchData();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving blog post:", error);
      // Detailed error message handling
      const errorMessage = error.response?.data?.detail || error.response?.data ? JSON.stringify(error.response.data) : 'Please try again.';
      toast({ title: "Error", description: `Failed to save post. ${errorMessage}`, variant: "destructive" });
    }
  };

  const handleDeletePost = async (id) => {
    try {
      await api.delete(`/blogs/${id}/`);
      setBlogPosts(blogPosts.filter((post) => post.id !== id));
      toast({ title: "Blog Post Deleted", description: "The blog post has been successfully deleted." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete blog post.", variant: "destructive" });
    }
  };

  // --- RATING HANDLERS ---
  const openRatingDialog = (post) => {
    setPostToRate(post);
    setCurrentRating(post.userRating || 0);
    setIsRatingDialogOpen(true);
  };

  const handleRatePost = async () => {
    if (!postToRate || currentRating === 0) {
      toast({ title: "Invalid Rating", description: "Please select at least one star.", variant: "destructive" });
      return;
    }
    const ratedPostId = postToRate.id;
    try {
      const response = await api.post(`/blogs/${ratedPostId}/rate/`, { rating: currentRating });
      // Update local state to reflect new rating immediately
      setBlogPosts(blogPosts.map(p => p.id === ratedPostId ? response.data : p));
      toast({ title: "Rating Submitted!", description: `You rated "${postToRate.title}" ${currentRating} stars.` });
      setIsRatingDialogOpen(false);
    } catch (error) {
      console.error("Failed to submit rating:", error);
      toast({ title: "Error", description: `Failed to submit rating. ${error.response?.data?.detail || 'Please try again.'}`, variant: "destructive" });
    }
  };

  // --- REACTION HANDLER (No Refresh, No Flicker) ---
  const handleReaction = async (postId, type) => {
    if (!user) {
        toast({ title: "Login Required", description: "Please login to react to posts." });
        return;
    }

    // 1. Calculate the new state immediately (Optimistic UI)
    const updatedPosts = blogPosts.map(post => {
      if (post.id === postId) {
        const currentReaction = post.userReaction; 
        const isRemoving = currentReaction === type; 
        
        let newLikeCount = post.likeCount || 0;
        let newHeartCount = post.heartCount || 0;
        let newInsightfulCount = post.insightfulCount || 0;

        // Decrement old reaction count
        if (currentReaction === 'like') newLikeCount--;
        if (currentReaction === 'heart') newHeartCount--;
        if (currentReaction === 'insightful') newInsightfulCount--;

        // Increment new reaction count (if not just removing the same one)
        if (!isRemoving) {
            if (type === 'like') newLikeCount++;
            if (type === 'heart') newHeartCount++;
            if (type === 'insightful') newInsightfulCount++;
        }

        return {
            ...post,
            userReaction: isRemoving ? null : type,
            likeCount: newLikeCount,
            heartCount: newHeartCount,
            insightfulCount: newInsightfulCount
        };
      }
      return post;
    });

    // 2. Update the UI instantly
    setBlogPosts(updatedPosts);

    // 3. Send request to backend silently
    try {
        await api.post(`/blogs/${postId}/react/`, { type });
    } catch (error) {
        console.error("Reaction failed", error);
        toast({ title: "Error", description: "Failed to submit reaction", variant: "destructive" });
        fetchData(); // Only refresh if there was an error
    }
  };

  // --- COMMENT HANDLERS ---
  const openCommentDialog = async (post) => {
    setActivePostForComments(post);
    setNewCommentText("");
    setIsCommentDialogOpen(true);
    setIsCommentsLoading(true);
    
    try {
        const response = await api.get(`/blogs/${post.id}/comments/`);
        setCommentsList(response.data);
    } catch (error) {
        console.error("Failed to load comments", error);
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
        
        // Add new comment to list immediately
        const newCommentObj = response.data;
        setCommentsList([newCommentObj, ...commentsList]);
        setNewCommentText("");
        
        // Update comment count on the post card
        setBlogPosts(blogPosts.map(p => 
            p.id === activePostForComments.id 
            ? { ...p, commentCount: (p.commentCount || 0) + 1 } 
            : p
        ));

        toast({ title: "Success", description: "Comment posted!" });
    } catch (error) {
        toast({ title: "Error", description: "Failed to post comment", variant: "destructive" });
    }
  };

  // --- SORTING LOGIC ---
  const sortedBlogPosts = useMemo(() => {
    const sortablePosts = [...blogPosts];
    sortablePosts.sort((a, b) => {
      if (sortBy === 'top-rated') {
        const ratingA = parseFloat(a.averageRating) || 0;
        const ratingB = parseFloat(b.averageRating) || 0;
        return ratingB - ratingA;
      } else { 
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }
    });
    return sortablePosts;
  }, [blogPosts, sortBy]);

  return (
    <>
      <div className="min-h-screen bg-page-bg flex">
        <div className="flex-1 pr-16">
          <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-text-dark mb-2">Blog Management</h1>
                <p className="text-text-muted">Create and manage your professional blog posts</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  {user && (<Button onClick={openCreateDialog}><Plus className="w-4 h-4 mr-2" />New Blog Post</Button>)}
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>{isEditing ? "Edit Blog Post" : "Create New Blog Post"}</DialogTitle></DialogHeader>
                  <form onSubmit={(e) => { e.preventDefault(); handleSavePost(); }} className="space-y-6">
                    <div><Label htmlFor="title">Title</Label><Input id="title" value={currentPost.title} onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })} required /></div>
                    <div><Label htmlFor="excerpt">Excerpt</Label><Textarea id="excerpt" value={currentPost.excerpt} onChange={(e) => setCurrentPost({ ...currentPost, excerpt: e.target.value })} rows={2} /></div>
                    <div><Label>Content</Label><RichTextEditor value={currentPost.content} onChange={(content) => setCurrentPost({ ...currentPost, content })} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label htmlFor="tags">Tags (comma separated)</Label><Input id="tags" value={currentPost.tags} onChange={(e) => setCurrentPost({ ...currentPost, tags: e.target.value })} /></div>
                      <div><Label htmlFor="status">Status</Label>
                        <Select value={currentPost.status} onValueChange={(value) => setCurrentPost({ ...currentPost, status: value })} disabled={user?.role === 'user' && !isEditing}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="pending">Submit for Review</SelectItem>
                            <SelectItem value="published" disabled={user?.role === 'user'}>Publish Now</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                      <Button type="submit">{isEditing ? "Save Changes" : "Create Post"}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* --- FILTERING AND SORTING UI --- */}
            <div className="flex justify-between items-center mb-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">All Posts</TabsTrigger>
                  <TabsTrigger value="published">Published</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="draft">Drafts</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="w-[180px]">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="most-recent">Most Recent</SelectItem>
                    <SelectItem value="top-rated">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-6">
              {isLoading ? (<p>Loading...</p>) : sortedBlogPosts.length === 0 ? (
                <Card><CardContent className="text-center py-12"><p>No blog posts found in this status.</p></CardContent></Card>
              ) : (
                sortedBlogPosts.map((post) => (
                  <Card key={post.id} className="hover:shadow-md transition-shadow flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-xl">{post.title}</CardTitle>
                            <Badge className={getStatusColor(post.status)}>{getStatusIcon(post.status)}<span className="ml-1 capitalize">{post.status}</span></Badge>
                          </div>
                          <p className="text-text-muted text-sm line-clamp-3">{post.excerpt || (post.content && post.content.length > 200 ? post.content.substring(0, 200) + '...' : post.content)}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleReadMore(post)}><Eye className="w-4 h-4" /></Button>
                          {(user?.id?.toString() === post.authorId?.toString() || user?.role === 'admin') && (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => openEditDialog(post)}><Edit className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeletePost(post.id)}><Trash2 className="w-4 h-4" /></Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-between">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {Array.isArray(post.tags) && post.tags.map((tag, index) => (<Badge key={index} variant="outline">#{tag}</Badge>))}
                      </div>
                      
                      {/* --- UPDATED FOOTER WITH REACTIONS AND COMMENTS --- */}
                      <div className="flex flex-col gap-3 border-t pt-4 mt-auto">
                          {/* Row 1: Ratings and Reactions */}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                {/* Star Rating Display */}
                                <div className="flex items-center gap-2">
                                    <StarRating rating={post.averageRating || 0} size="sm" onRatingChange={undefined} />
                                    <span className="text-xs text-muted-foreground">
                                    {post.averageRating?.toFixed(1) || '0.0'} ({post.ratingCount || 0})
                                    </span>
                                </div>
                                
                                {/* Vertical Separator */}
                                <div className="h-4 w-px bg-gray-300"></div>

                                {/* Reactions (Like, Heart, Insightful) */}
                                <div className="flex items-center gap-1">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className={`h-8 px-2 gap-1 hover:text-blue-600 ${post.userReaction === 'like' ? 'text-blue-600 bg-blue-50' : 'text-gray-500'}`}
                                        onClick={() => handleReaction(post.id, 'like')}
                                    >
                                        <ThumbsUp className={`w-4 h-4 ${post.userReaction === 'like' ? 'fill-current' : ''}`} />
                                        <span className="text-xs">{post.likeCount || 0}</span>
                                    </Button>
                                    
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className={`h-8 px-2 gap-1 hover:text-red-600 ${post.userReaction === 'heart' ? 'text-red-600 bg-red-50' : 'text-gray-500'}`}
                                        onClick={() => handleReaction(post.id, 'heart')}
                                    >
                                        <Heart className={`w-4 h-4 ${post.userReaction === 'heart' ? 'fill-current' : ''}`} />
                                        <span className="text-xs">{post.heartCount || 0}</span>
                                    </Button>

                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className={`h-8 px-2 gap-1 hover:text-yellow-600 ${post.userReaction === 'insightful' ? 'text-yellow-600 bg-yellow-50' : 'text-gray-500'}`}
                                        onClick={() => handleReaction(post.id, 'insightful')}
                                    >
                                        <Lightbulb className={`w-4 h-4 ${post.userReaction === 'insightful' ? 'fill-current' : ''}`} />
                                        <span className="text-xs">{post.insightfulCount || 0}</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Rate Button */}
                            {user && (
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8"
                                    onClick={() => openRatingDialog(post)}
                                >
                                    <Star className={`w-3 h-3 mr-2 ${post.userRating > 0 ? "fill-yellow-400 text-yellow-400" : ""}`} />
                                    Rate
                                </Button>
                            )}
                          </div>

                          {/* Row 2: Comments Button */}
                          <div className="w-full">
                             <Button 
                                variant="secondary" 
                                size="sm" 
                                className="w-full h-9 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
                                onClick={() => openCommentDialog(post)}
                             >
                                <MessageSquare className="w-4 h-4" />
                                { post.commentCount ? `View ${ post.commentCount } Comments` : 'Add Comment' }
                             </Button>
                          </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
        <RightSidebar />
      </div>

      {/* Dialogs */}
      <FullArticleDialog post={selectedArticle} isOpen={isArticleDialogOpen} onOpenChange={setIsArticleDialogOpen} onReact={undefined} onRate={undefined} onComment={undefined} />
      
      <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rate this post</DialogTitle>
            <DialogDescription>How would you rate "{postToRate?.title}"?</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-6">
            <StarRating rating={currentRating} onRatingChange={setCurrentRating} isInteractive={true} size="md" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRatingDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRatePost}>Submit Rating</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- COMMENTS DIALOG --- */}
      <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
        <DialogContent className="sm:max-w-[500px] flex flex-col h-[600px]">
            <DialogHeader>
                <DialogTitle>Comments</DialogTitle>
                <DialogDescription>
                    Discussion for "{activePostForComments?.title}"
                </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="flex-1 pr-4 -mr-4 my-4">
                {isCommentsLoading ? (
                    <div className="text-center py-10 text-muted-foreground">Loading comments...</div>
                ) : commentsList.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground flex flex-col items-center gap-2">
                        <MessageSquare className="w-8 h-8 opacity-20" />
                        <p>No comments yet. Be the first to share your thoughts!</p>
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