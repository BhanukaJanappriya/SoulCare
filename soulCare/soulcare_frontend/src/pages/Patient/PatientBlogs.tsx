import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BlogPost } from "@/types";
import { fetchBlogPosts } from "@/pages/api/blogApi";
import FullArticleDialog from "@/components/common/FullArticleDialog"; // <-- NEW IMPORT

export default function PatientBlogs() {
  const { toast } = useToast();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- NEW STATE FOR DIALOG ---
  const [isArticleDialogOpen, setIsArticleDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<BlogPost | null>(null);
  // ----------------------------


  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetches ONLY published posts for the patient view
      const data = await fetchBlogPosts('published');
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
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- UPDATED HANDLER TO OPEN DIALOG ---
  const handleReadMore = (post: BlogPost) => {
    setSelectedArticle(post);
    setIsArticleDialogOpen(true);
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Unknown Date';
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
  };

  return (
    <>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-dark mb-2">
            SoulCare Insights & Articles
          </h1>
          <p className="text-text-muted">
            Read curated articles and resources for better mental health.
          </p>
        </div>

        {/* Blog List Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <Card className="col-span-full"><CardContent className="py-12 text-center text-text-muted">Loading articles...</CardContent></Card>
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
                      {Array.isArray(post.tags) && post.tags.length > 0 ? post.tags[0] : 'General'}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-text-muted text-sm line-clamp-3 mb-4">
                    {post.excerpt || post.content.substring(0, 150) + '...'}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {Array.isArray(post.tags) && post.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
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

      {/* --- NEW: Full Article Dialog Component --- */}
      <FullArticleDialog
          post={selectedArticle}
          isOpen={isArticleDialogOpen}
          onOpenChange={setIsArticleDialogOpen}
      />
    </>
  );
}
