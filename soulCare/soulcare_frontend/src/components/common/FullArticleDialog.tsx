import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, User, Tag, ThumbsUp, Heart, Lightbulb, Star, MessageSquare } from "lucide-react";

// --- Internal Star Rating Component ---
const DialogStarRating = ({ rating, onRatingChange, isInteractive = false }) => {
  const [hoverRating, setHoverRating] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 transition-colors ${isInteractive ? "cursor-pointer" : ""} ${
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

export default function FullArticleDialog({ 
  post, 
  isOpen, 
  onOpenChange, 
  showEngagement = false,
  // New Props for Interactivity
  onReact,     // Function to handle reactions
  onRate,      // Function to handle rating
  onComment    // Function to open comment dialog
}) {
  
  if (!post) return null;

  // Helper to safely handle tags
  const renderTags = () => {
    if (!post.tags) return null;
    let tagsArray = [];
    if (Array.isArray(post.tags)) {
      tagsArray = post.tags;
    } else if (typeof post.tags === 'string') {
      tagsArray = post.tags.split(',').map(t => t.trim());
    }

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {tagsArray.map((tag, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {tag}
          </Badge>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown Date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0 gap-0">
        
        {/* Header */}
        <div className="p-6 pb-4 border-b">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-bold leading-tight text-gray-900">
                  {post.title}
                </DialogTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                    </div>
                    {post.author_name && (
                        <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{post.author_name}</span>
                        </div>
                    )}
                </div>
              </div>
            </div>
          </DialogHeader>
          {renderTags()}
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-6">
          <div className="prose prose-stone max-w-none dark:prose-invert">
            <div 
                className="whitespace-pre-wrap leading-relaxed text-gray-700"
                dangerouslySetInnerHTML={{ __html: post.content }} 
            />
          </div>
          
          {/* --- INTERACTIVE ENGAGEMENT SECTION --- */}
          {showEngagement && (
              <div className="mt-10 pt-6 border-t bg-gray-50 p-4 rounded-lg">
                 <h4 className="font-semibold mb-4">Engagement</h4>
                 
                 <div className="flex flex-col gap-4">
                    {/* Row 1: Ratings and Reactions */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        
                        {/* Reactions */}
                        <div className="flex items-center gap-4">
                             <button 
                                className={`flex items-center gap-1 px-3 py-1 rounded hover:bg-blue-100 transition-colors ${post.userReaction === 'like' ? 'text-blue-600 font-bold bg-blue-50' : 'text-gray-500'}`}
                                onClick={() => onReact && onReact(post.id, 'like')}
                             >
                                <ThumbsUp className={`w-5 h-5 ${post.userReaction === 'like' ? 'fill-current' : ''}`} /> 
                                <span className="text-sm">{post.likeCount || 0}</span>
                             </button>

                             <button 
                                className={`flex items-center gap-1 px-3 py-1 rounded hover:bg-red-100 transition-colors ${post.userReaction === 'heart' ? 'text-red-600 font-bold bg-red-50' : 'text-gray-500'}`}
                                onClick={() => onReact && onReact(post.id, 'heart')}
                             >
                                <Heart className={`w-5 h-5 ${post.userReaction === 'heart' ? 'fill-current' : ''}`} /> 
                                <span className="text-sm">{post.heartCount || 0}</span>
                             </button>

                             <button 
                                className={`flex items-center gap-1 px-3 py-1 rounded hover:bg-yellow-100 transition-colors ${post.userReaction === 'insightful' ? 'text-yellow-600 font-bold bg-yellow-50' : 'text-gray-500'}`}
                                onClick={() => onReact && onReact(post.id, 'insightful')}
                             >
                                <Lightbulb className={`w-5 h-5 ${post.userReaction === 'insightful' ? 'fill-current' : ''}`} /> 
                                <span className="text-sm">{post.insightfulCount || 0}</span>
                             </button>
                        </div>

                        {/* Star Rating & Button */}
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end">
                                <DialogStarRating rating={post.averageRating || 0} onRatingChange={undefined} />
                                <span className="text-xs text-muted-foreground">
                                    {post.averageRating?.toFixed(1)} ({post.ratingCount} votes)
                                </span>
                            </div>
                            <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => onRate && onRate(post)}
                            >
                                Rate
                            </Button>
                        </div>
                    </div>

                    {/* Row 2: Comment Button */}
                    <Button 
                        className="w-full mt-2" 
                        variant="secondary"
                        onClick={() => onComment && onComment(post)}
                    >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {post.commentCount > 0 ? `View / Add Comments (${post.commentCount})` : "Start Discussion"}
                    </Button>
                 </div>
              </div>
          )}

          {/* Author Section */}
          <div className="mt-6 pt-6 border-t">
             <h4 className="font-semibold mb-2">About the Author</h4>
             <div className="flex items-center gap-3">
                <Avatar>
                    <AvatarImage src="" /> 
                    <AvatarFallback>{post.author_name ? post.author_name.charAt(0) : "A"}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-medium">{post.author_name || "Unknown Author"}</p>
                    <p className="text-xs text-muted-foreground capitalize">{post.author_role || "Contributor"}</p>
                </div>
             </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <DialogFooter className="p-4 border-t bg-gray-50">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close Article
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


