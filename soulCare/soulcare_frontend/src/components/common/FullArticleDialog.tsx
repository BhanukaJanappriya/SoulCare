import React, { Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Calendar, UserCircle, Star } from "lucide-react";
import type { BlogPost } from "@/types";
// Import the new engagement section component
import { BlogEngagementSection } from "@/components/blogs/BlogEngagementSection";
// NOTE: useQueryClient import is correctly REMOVED to fix the React Hooks violation

interface FullArticleDialogProps {
  post: BlogPost | null;
  isOpen: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  showEngagement?: boolean;
}

// Helper to sanitize/display rich text content (assumes you use dangerouslySetInnerHTML)
const sanitizeContent = (content: string) => {
  // NOTE: This is a placeholder. In a real app, use DOMPurify to sanitize HTML.
  return { __html: content };
};

const FullArticleDialog: React.FC<FullArticleDialogProps> = ({
  post,
  isOpen,
  onOpenChange,
  showEngagement = true,
}) => {
  if (!post) return null;

  // NOTE: useQueryClient call is correctly absent here

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {/* MODIFIED: Increased width/height */}
      <DialogContent className="max-w-4xl max-h-[95vh] p-0">
        <ScrollArea className="h-full">
          <div className="p-8">
            <DialogHeader className="mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <DialogTitle className="text-3xl font-bold text-gray-900 mb-2">
                    {post.title}
                  </DialogTitle>
                  <DialogDescription className="text-base text-muted-foreground">
                    {post.excerpt}
                  </DialogDescription>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-4 pt-2 border-t">
                <span className="flex items-center gap-1">
                  <UserCircle className="w-4 h-4" />
                  Author:{" "}
                  <span className="font-semibold">{post.author_name}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Published:{" "}
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString()
                    : "N/A"}
                </span>
                {/* Display aggregated rating for quick view */}
                {post.average_rating > 0 && (
                  <span className="flex items-center gap-1 font-semibold">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    {post.average_rating.toFixed(1)} / 5.0
                  </span>
                )}
              </div>
            </DialogHeader>

            {/* Article Content (MODIFIED for better readability) */}
            <div
              // Use a standard blog/prose class for better text flow
              className="text-gray-800 leading-relaxed space-y-4 text-lg"
              dangerouslySetInnerHTML={sanitizeContent(post.content)}
            />

            <div className="mt-8 flex flex-wrap gap-2 pt-4 border-t">
              {Array.isArray(post.tags)
                ? post.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))
                : null}
            </div>

            {/* --- NEW ENGAGEMENT SECTION INTEGRATION --- */}
            {showEngagement && <BlogEngagementSection post={post} />}
            {/* --- END NEW ENGAGEMENT SECTION --- */}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default FullArticleDialog;
