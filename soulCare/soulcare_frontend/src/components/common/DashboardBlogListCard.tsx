import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen, Clock, ArrowRight } from "lucide-react";
import { getBlogPostsAPI } from "@/api";
import type { BlogPost } from "@/types";
import { useNavigate } from "react-router-dom";

const DashboardBlogListCard: React.FC = () => {
  const navigate = useNavigate();

  // Fetch the 5 newest published blogs
  const { data: blogs, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["dashboardBlogList"],
    queryFn: () => getBlogPostsAPI("published", "newest"),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const handleReadMore = (post: BlogPost) => {
    // Navigate to the full blogs page for a clean view (or a dedicated public route)
    navigate("/blogs", { state: { postId: post.id } });
    // NOTE: Since the full article dialog is not a route, we redirect to /blogs
  };

  return (
    <Card className="shadow-lg mt-8 border-t-4 border-t-primary">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Latest Insights & Articles
        </CardTitle>
        <Button variant="link" size="sm" onClick={() => navigate("/blogs")}>
          View All <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="flex items-center justify-center h-16 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading blogs...
          </p>
        ) : blogs && blogs.length > 0 ? (
          <div className="space-y-4">
            {blogs.slice(0, 5).map((post) => (
              <div
                key={post.id}
                className="p-3 bg-muted/20 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-sm line-clamp-1">
                    {post.title}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {new Date(
                      post.publishedAt || post.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReadMore(post)}
                >
                  Read
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            No published blogs yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardBlogListCard;
