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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // NEW IMPORT
import { Label } from "@/components/ui/label"; // NEW IMPORT
import { Eye, Calendar, BookOpen, Star, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { BlogPost, BlogSortBy } from "@/types";
import { getBlogPostsAPI } from "@/api"; // <-- UPDATED API IMPORT
import FullArticleDialog from "@/components/common/FullArticleDialog";
// NEW IMPORT: The engagement component we just created
import { BlogEngagementSection } from "@/components/blogs/BlogEngagementSection";
import { useAuth } from "@/hooks/useAuth"; // To check if user is logged in for commenting

export default function PatientBlogs() {
  const { toast } = useToast();
  const { user } = useAuth(); // Get user for conditional UI
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- NEW STATE for Sorting ---
  const [sortBy, setSortBy] = useState<BlogSortBy>("newest");
  // -----------------------------

  // --- NEW STATE FOR DIALOG ---
  const [isArticleDialogOpen, setIsArticleDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<BlogPost | null>(null);
  // ----------------------------

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetches ONLY published posts for the patient view, with sorting
      // The status is explicitly 'published' for public view
      const data = await getBlogPostsAPI("published", sortBy);
      setBlogPosts(data);
    } catch (error) {
      console.error("Error fetching published blog posts:", error);
      toast({
        title: "Error",
        description: "Failed to load mental health articles.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [sortBy, toast]); // <-- DEPENDENCY ON sortBy

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- UPDATED HANDLER TO OPEN DIALOG ---
  const handleReadMore = (post: BlogPost) => {
    setSelectedArticle(post);
    setIsArticleDialogOpen(true);
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "Unknown Date";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Card className="shadow-sm bg-card">
            <CardHeader>
              <div className="flex items-center gap-4">
                <BookOpen className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-2xl font-bold">
                    SoulCare Insights & Articles
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Read curated articles and resources for better mental
                    health.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* NEW: Sorting and Filter Bar */}
        <div className="flex justify-end items-center mb-6">
          <div className="flex items-center space-x-2">
            <Label htmlFor="sort">Sort By:</Label>
            <Select
              value={sortBy}
              onValueChange={(value: BlogSortBy) => setSortBy(value)}
            >
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

        {/* Blog List Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center text-text-muted">
                Loading articles...
              </CardContent>
            </Card>
          ) : blogPosts.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="text-center py-12">
                <p className="text-text-muted">
                  No published articles available at this time.
                </p>
              </CardContent>
            </Card>
          ) : (
            blogPosts.map((post) => (
              <Card
                key={post.id}
                className="hover:shadow-lg transition-shadow flex flex-col"
              >
                <CardHeader className="flex-grow">
                  <CardTitle className="text-xl line-clamp-2 mb-2">
                    {post.title}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-text-muted">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(post.publishedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {Array.isArray(post.tags) && post.tags.length > 0
                        ? post.tags[0]
                        : "General"}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-text-muted text-sm line-clamp-3 mb-4">
                    {post.excerpt || post.content.substring(0, 150) + "..."}
                  </p>

                  <div className="flex justify-between items-center mb-4">
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(post.tags) &&
                        post.tags.slice(0, 3).map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            #{tag}
                          </Badge>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                      <Star className="w-4 h-4 text-yellow-500 inline-block" />
                      {post.average_rating.toFixed(1)}
                    </div>
                  </div>

                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => handleReadMore(post)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Read More
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* --- Full Article Dialog Component (MODIFIED) --- */}
      <FullArticleDialog
        post={selectedArticle}
        isOpen={isArticleDialogOpen}
        onOpenChange={setIsArticleDialogOpen}
        showEngagement={true}
      />
    </>
  );
}
