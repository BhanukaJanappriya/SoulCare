import React, { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  ThumbsUp,
  Heart,
  Lightbulb,
  MessageSquare,
  Star,
  UserCircle,
  Send,
  Loader2,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BlogPost, BlogComment, BlogReactionType } from "@/types";
import {
  getBlogCommentsAPI,
  createBlogCommentAPI,
  rateBlogPostAPI,
  reactToBlogPostAPI,
  unreactToBlogPostAPI,
  unrateBlogPostAPI,
} from "@/api";

// --- GUEST DATA TYPE (Must match the state in this file) ---
type GuestInfo = {
  guestName: string;
  guestEmail: string;
  sessionId: string; // Used for Rating/Reaction identification
};

// Helper to generate a unique session ID if one doesn't exist (for anonymous rating/reaction tracking)
const getSessionId = (): string => {
  let sessionId = localStorage.getItem("blogSessionId");
  if (!sessionId) {
    // Simple unique ID generation (should be sufficient for local dev/demo)
    sessionId =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    localStorage.setItem("blogSessionId", sessionId);
  }
  return sessionId;
};

// --- GUEST FORM COMPONENT ---
const GuestInfoForm: React.FC<{
  guestInfo: GuestInfo;
  setGuestInfo: React.Dispatch<React.SetStateAction<GuestInfo>>;
}> = ({ guestInfo, setGuestInfo }) => {
  // Only render the form if the user is not authenticated AND hasn't provided a name yet.
  if (guestInfo.guestName) return null;

  return (
    <Card className="mb-4 p-4 border-l-4 border-yellow-500 bg-yellow-50/50">
      <CardTitle className="text-lg mb-3 flex items-center gap-2 text-yellow-800">
        <User className="w-5 h-5" />
        Guest Submission
      </CardTitle>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="guestName" className="text-xs">
            Your Name (Required for comments)
          </Label>
          <Input
            id="guestName"
            value={guestInfo.guestName}
            onChange={(e) =>
              setGuestInfo((p) => ({ ...p, guestName: e.target.value }))
            }
            placeholder="Anonymous"
          />
        </div>
        <div>
          <Label htmlFor="guestEmail" className="text-xs">
            Your Email (Optional)
          </Label>
          <Input
            id="guestEmail"
            value={guestInfo.guestEmail}
            onChange={(e) =>
              setGuestInfo((p) => ({ ...p, guestEmail: e.target.value }))
            }
            type="email"
            placeholder="name@example.com"
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Your name is used to identify your activity on this post.
      </p>
    </Card>
  );
};

// --- STAR RATING COMPONENT (LOCAL) ---
const StarRating: React.FC<{
  postId: string | number;
  currentRating: number;
  isAuth: boolean;
  guestInfo: GuestInfo;
}> = ({ postId, currentRating, isAuth, guestInfo }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isRateDialogOpen, setIsRateDialogOpen] = useState(false);
  const [tempRating, setTempRating] = useState(0);

  // NOTE: For now, we assume the API automatically handles the guest fields (sessionId) if the user is not authenticated.
  // The FE sends the same payload to simplify the logic.

  const rateMutation = useMutation({
    mutationFn: () => rateBlogPostAPI(postId, tempRating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogComments", postId] });
      queryClient.invalidateQueries({ queryKey: ["blogList"] });
      queryClient.invalidateQueries({ queryKey: ["publicBlogs"] });
      toast({
        title: "Rating Saved",
        description: "Your rating has been saved.",
      });
      setIsRateDialogOpen(false);
    },
    onError: (error: AxiosError) =>
      toast({
        title: "Error",
        description: `Failed to submit rating: ${error.message}`,
        variant: "destructive",
      }),
  });

  const unrateMutation = useMutation({
    mutationFn: () => unrateBlogPostAPI(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogComments", postId] });
      queryClient.invalidateQueries({ queryKey: ["blogList"] });
      queryClient.invalidateQueries({ queryKey: ["publicBlogs"] });
      toast({
        title: "Rating Removed",
        description: "Your rating has been removed.",
      });
    },
    onError: (error: AxiosError) =>
      toast({
        title: "Error",
        description: `Failed to remove rating: ${error.message}`,
        variant: "destructive",
      }),
  });

  const handleStarClick = (rating: number) => {
    // Only require name/session for anonymous users (session ID is generated automatically)
    if (!isAuth && !guestInfo.sessionId) {
      toast({
        title: "Session Error",
        description: "Could not establish an anonymous session.",
        variant: "destructive",
      });
      return;
    }

    if (currentRating === rating) {
      unrateMutation.mutate();
    } else {
      setTempRating(rating);
      setIsRateDialogOpen(true);
    }
  };

  const handleConfirmRating = () => {
    if (tempRating > 0) {
      rateMutation.mutate();
    }
  };

  return (
    <>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 cursor-pointer transition-colors ${
              star <= currentRating
                ? "text-yellow-500 fill-yellow-500"
                : "text-gray-300"
            } hover:text-yellow-400 hover:fill-yellow-400`}
            onClick={() => handleStarClick(star)}
          />
        ))}
      </div>

      <Dialog open={isRateDialogOpen} onOpenChange={setIsRateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Confirm Your Rating</DialogTitle>
            <DialogDescription>
              You are setting a {tempRating}-star rating for this article.
            </DialogDescription>
          </DialogHeader>

          <Card className="my-4 border-yellow-500 border-l-4">
            <CardContent className="p-6 flex flex-col items-center">
              <p className="text-5xl font-extrabold text-yellow-500 mb-2">
                {tempRating}
              </p>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 ${
                      star <= tempRating
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRating}
              disabled={rateMutation.isPending}
            >
              {rateMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                "Submit Rating"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// --- REACTIONS COMPONENT (LOCAL) ---
const ReactionButton: React.FC<{
  postId: string | number;
  type: BlogReactionType;
  icon: React.ElementType;
  count: number;
  isActive: boolean;
  isAuth: boolean;
  guestInfo: GuestInfo; // NEW PROP
}> = ({ postId, type, icon: Icon, count, isActive, isAuth, guestInfo }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Determine reaction data based on auth status
  const reactionPayload = isAuth
    ? { type }
    : { type, sessionId: guestInfo.sessionId };

  const reactMutation = useMutation({
    mutationFn: () => reactToBlogPostAPI(postId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogList"] });
      queryClient.invalidateQueries({ queryKey: ["publicBlogs"] });
      toast({
        title: "Reaction Saved",
        description: `You reacted with ${type}.`,
      });
    },
    onError: () =>
      toast({
        title: "Error",
        description: "Failed to save reaction.",
        variant: "destructive",
      }),
  });

  const unreactMutation = useMutation({
    mutationFn: () => unreactToBlogPostAPI(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogList"] });
      queryClient.invalidateQueries({ queryKey: ["publicBlogs"] });
      toast({
        title: "Reaction Removed",
        description: "Your reaction has been removed.",
      });
    },
    onError: () =>
      toast({
        title: "Error",
        description: "Failed to remove reaction.",
        variant: "destructive",
      }),
  });

  const handleClick = () => {
    if (!isAuth && !guestInfo.sessionId) {
      toast({
        title: "Session Error",
        description: "Could not establish an anonymous session.",
        variant: "destructive",
      });
      return;
    }
    if (isActive) {
      unreactMutation.mutate();
    } else {
      reactMutation.mutate();
    }
  };

  return (
    <Button
      variant={isActive ? "default" : "outline"}
      size="sm"
      onClick={handleClick}
      className={`flex items-center gap-1 ${
        isActive ? "bg-primary hover:bg-primary/90" : "hover:bg-muted"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="font-semibold">{count}</span>
      <span className="hidden sm:inline capitalize">{type}</span>
    </Button>
  );
};

// --- MAIN ENGAGEMENT SECTION ---
interface BlogEngagementProps {
  post: BlogPost;
}

export const BlogEngagementSection: React.FC<BlogEngagementProps> = ({
  post,
}) => {
  const { user } = useAuth();
  const isAuth = !!user;
  const { toast } = useToast();
  const [commentContent, setCommentContent] = useState("");
  const queryClient = useQueryClient();

  // NEW: Guest Info State
  const [guestInfo, setGuestInfo] = useState<GuestInfo>(() => ({
    guestName: localStorage.getItem("guestName") || "",
    guestEmail: "",
    sessionId: getSessionId(), // Initialize session ID once
  }));

  // Persist guest name on change
  React.useEffect(() => {
    if (guestInfo.guestName) {
      localStorage.setItem("guestName", guestInfo.guestName);
    } else {
      localStorage.removeItem("guestName");
    }
  }, [guestInfo.guestName]);

  // --- 1. Fetch Comments ---
  const { data: comments, isLoading: isLoadingComments } = useQuery<
    BlogComment[]
  >({
    queryKey: ["blogComments", post.id],
    queryFn: () => getBlogCommentsAPI(post.id),
    enabled: true,
  });

  // --- 2. Post Comment Mutation ---
  const commentMutation = useMutation({
    mutationFn: (content: string) => {
      const payload = isAuth
        ? { content }
        : {
            content,
            guest_name: guestInfo.guestName,
            guest_email: guestInfo.guestEmail,
            session_key: guestInfo.sessionId,
          };

      // NOTE: The API function definition in api.ts must be updated to accept guest fields!
      // Currently, it only accepts 'content' due to old type definitions.
      return createBlogCommentAPI(post.id, content);
    },
    onSuccess: () => {
      setCommentContent("");
      queryClient.invalidateQueries({ queryKey: ["blogComments", post.id] });
      queryClient.invalidateQueries({ queryKey: ["blogList"] });
      queryClient.invalidateQueries({ queryKey: ["publicBlogs"] });
      toast({
        title: "Comment Added",
        description: "Your comment has been posted.",
      });
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to post comment. Check name field.",
        variant: "destructive",
      });
    },
  });

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    if (!isAuth && !guestInfo.guestName) {
      toast({
        title: "Name Required",
        description: "Please enter your name above to submit a comment.",
        variant: "destructive",
      });
      return;
    }

    commentMutation.mutate(commentContent);
  };

  // --- 3. Determine Current User's Rating/Reaction (Mock/Placeholder) ---
  // NOTE: This logic is for visual representation only and does not reflect a real anonymous state.
  const currentUserRating = useMemo(() => {
    return Math.round(post.average_rating);
  }, [post.average_rating]);

  const currentUserReaction = useMemo((): BlogReactionType | null => {
    return null;
  }, []);

  // Helper for Reaction Components
  const commonProps = useMemo(
    () => ({
      postId: post.id,
      isAuth: isAuth,
      guestInfo: guestInfo,
    }),
    [post.id, isAuth, guestInfo]
  );

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Star className="w-5 h-5 text-yellow-500" />
          Engagement & Discussion
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* NEW: Guest Info Form (Only visible if not authenticated) */}
        {!isAuth && (
          <GuestInfoForm guestInfo={guestInfo} setGuestInfo={setGuestInfo} />
        )}

        {/* --- A. Ratings & Reactions Section --- */}
        <div className="flex justify-between items-center pb-4 border-b">
          <div className="space-y-2">
            <CardDescription className="text-lg font-semibold text-gray-700">
              Rate This Post:
            </CardDescription>
            <StarRating
              postId={post.id}
              currentRating={currentUserRating}
              isAuth={isAuth}
              guestInfo={guestInfo}
            />
            <p className="text-sm text-muted-foreground">
              {post.average_rating.toFixed(2)} average from {post.rating_count}{" "}
              ratings
            </p>
          </div>

          <div className="flex space-x-2">
            <ReactionButton
              {...commonProps}
              type="like"
              icon={ThumbsUp}
              count={post.reaction_counts.like}
              isActive={currentUserReaction === "like"}
            />
            <ReactionButton
              {...commonProps}
              type="love"
              icon={Heart}
              count={post.reaction_counts.love}
              isActive={currentUserReaction === "love"}
            />
            <ReactionButton
              {...commonProps}
              type="insightful"
              icon={Lightbulb}
              count={post.reaction_counts.insightful}
              isActive={currentUserReaction === "insightful"}
            />
          </div>
        </div>

        {/* --- B. Comment Submission --- */}
        <div className="mt-6">
          <CardTitle className="flex items-center gap-2 mb-4 text-lg">
            <MessageSquare className="w-5 h-5 text-primary" />
            Join the Discussion
          </CardTitle>
          <form onSubmit={handleCommentSubmit} className="space-y-3">
            <Textarea
              placeholder={
                isAuth
                  ? "Write your comment here..."
                  : "Write your comment here (Name required above)."
              }
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              disabled={commentMutation.isPending}
              rows={3}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={
                  commentMutation.isPending ||
                  !commentContent.trim() ||
                  (!isAuth && !guestInfo.guestName)
                }
              >
                {commentMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Post Comment
              </Button>
            </div>
          </form>
        </div>

        <Separator className="my-6" />

        {/* --- C. Comments List --- */}
        <CardTitle className="mb-4 flex items-center gap-2 text-lg">
          <MessageSquare className="w-5 h-5 text-primary" />
          {comments?.length || 0} Comments
        </CardTitle>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {isLoadingComments ? (
            <p className="text-center text-muted-foreground">
              Loading comments...
            </p>
          ) : comments && comments.length > 0 ? (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 bg-muted/30 rounded-lg shadow-sm"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <UserCircle className="w-8 h-8 text-primary" />
                  <div className="flex flex-col">
                    <p className="font-semibold text-sm">
                      {/* Safely check for full_name, then guestName, then fallback to 'Guest' */}
                      {comment.author?.full_name ||
                        comment.author?.guestName ||
                        "Guest"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground">
              No comments yet. Be the first to start the discussion!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
