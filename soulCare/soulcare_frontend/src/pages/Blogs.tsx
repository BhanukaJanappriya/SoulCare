import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { RightSidebar } from "@/components/layout/RightSidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// CORRECTED: Removed final comma from the import list
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Star,
  ThumbsUp,
  Heart,
  Lightbulb,
  TrendingUp,
  BookOpen,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import type { BlogPost, BlogInputData, BlogSortBy } from "@/types";
import {
  getBlogPostsAPI,
  createBlogPostAPI,
  deleteBlogAPI,
  updateBlogPostAPI,
} from "@/api";
import RichTextEditor from "@/components/common/RichTextEditor";
import FullArticleDialog from "@/components/common/FullArticleDialog";

// --- UI Helper Functions (Status Colors/Icons) ---
const getStatusColor = (status: BlogPost["status"]) => {
  switch (status) {
    case "published":
      return "bg-green-500 text-white";
    case "pending":
      return "bg-orange-500 text-white";
    case "draft":
      return "bg-gray-500 text-white";
    case "rejected":
      return "bg-red-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

const getStatusIcon = (status: BlogPost["status"]) => {
  switch (status) {
    case "published":
      return <CheckCircle className="w-4 h-4" />;
    case "pending":
      return <Clock className="w-4 h-4" />;
    case "draft":
      return <Edit className="w-4 h-4" />;
    case "rejected":
      return <XCircle className="w-4 h-4" />;
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
};
// ----------------------------------------------------------------------

// Initial State for a new/editing post
const initialPostState: BlogInputData = {
  title: "",
  content: "",
  excerpt: "",
  tags_input: "", // Use tags_input now
  status: "draft",
};

export default function Blogs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Controls the visibility of the Create/Edit Dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [activeTab, setActiveTab] = useState("all");
  const [currentPost, setCurrentPost] = useState(initialPostState);
  const [currentPostId, setCurrentPostId] = useState<string | null>(null);

  // --- NEW STATE for Sorting ---
  const [sortBy, setSortBy] = useState<BlogSortBy>("newest");
  // -----------------------------

  // --- NEW STATE for Read More Dialog ---
  const [isArticleDialogOpen, setIsArticleDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<BlogPost | null>(null);
  // ------------------------------------

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Pass the active tab and the new sorting parameter
      const data = await getBlogPostsAPI(activeTab, sortBy);
      setBlogPosts(data);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      toast({
        title: "Error",
        description: "Failed to load blog posts from the server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, sortBy, toast]); // <-- DEPENDENCY ON sortBy

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Dialog Handlers ---

  const openCreateDialog = () => {
    setCurrentPost(initialPostState);
    setCurrentPostId(null);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (post: BlogPost) => {
    setCurrentPost({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || "",
      tags_input: Array.isArray(post.tags) ? post.tags.join(", ") : "", // Use tags_input
      status: post.status,
    });
    setCurrentPostId(post.id);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleReadMore = (post: BlogPost) => {
    setSelectedArticle(post);
    setIsArticleDialogOpen(true);
  };

  const handleSavePost = async () => {
    if (!currentPost.title || !currentPost.content) {
      toast({
        title: "Validation Error",
        description: "Title and Content are required.",
        variant: "destructive",
      });
      return;
    }

    const isPermittedUser =
      user?.role === "doctor" ||
      user?.role === "counselor" ||
      user?.role === "user" ||
      user?.role === "admin";
    if (!user || !isPermittedUser) {
      toast({
        title: "Permission Denied",
        description: "You do not have permission to perform this action.",
        variant: "destructive",
      });
      return;
    }

    // Logic to override status for Patients on creation
    const isPatientCreating = user?.role === "user" && !isEditing;
    const finalPostData: BlogInputData = {
      ...currentPost,
      // If patient creates, force status to 'pending'. Backend will also enforce this.
      status: isPatientCreating ? "pending" : currentPost.status,
    };

    try {
      if (isEditing && currentPostId) {
        // --- UPDATE LOGIC ---
        // Use Partial<BlogInputData> to only send fields that are present/changed
        const updatePayload: Partial<BlogInputData> = finalPostData;
        await updateBlogPostAPI(currentPostId, updatePayload);
        toast({
          title: "Post Updated",
          description: "Your blog post has been successfully updated.",
        });
      } else {
        // --- CREATE LOGIC ---
        await createBlogPostAPI(finalPostData);

        const toastStatus = isPatientCreating
          ? "pending (Awaiting Admin Review)"
          : finalPostData.status;
        toast({
          title: "Post Created",
          description: `Your blog post has been saved as ${toastStatus}.`,
        });
      }

      // Success cleanup
      await fetchData();
      setIsDialogOpen(false);
      setCurrentPost(initialPostState);
    } catch (error) {
      // Removed : any
      console.error(
        "Error saving blog post (Check Network for 4xx/5xx):",
        error
      );
      toast({
        title: "Error",
        description: `Failed to save blog post. ${
          (error as Error).message || "Check console for details."
        }`, // Added (error as Error)
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      await deleteBlogAPI(id);
      setBlogPosts(blogPosts.filter((post) => post.id !== id));
      toast({
        title: "Blog Post Deleted",
        description: "The blog post has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      toast({
        title: "Error",
        description: "Failed to delete blog post. Permission Denied.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="min-h-screen bg-page-bg flex">
        <div className="flex-1">
          <div className="container mx-auto px-6 py-8 mr-16 md:mr-24">
            {/* Header */}
            <Card className="mb-8 shadow-sm bg-card">
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Icon Box */}
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BookOpen className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold">
                        Blog Management
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Create and manage your professional blog posts.
                      </CardDescription>
                    </div>
                  </div>

                  {/* Create/Edit Dialog Trigger */}
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      {/* Allow all authenticated roles to see the button */}
                      {user && (
                        <Button onClick={openCreateDialog}>
                          <Plus className="w-4 h-4 mr-2" />
                          New Blog Post
                        </Button>
                      )}
                    </DialogTrigger>

                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {isEditing
                            ? "Edit Blog Post"
                            : "Create New Blog Post"}
                        </DialogTitle>
                      </DialogHeader>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSavePost();
                        }}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          {/* ... (Title/Tags Inputs) ... */}
                        </div>

                        <div>
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            value={currentPost.title}
                            onChange={(e) =>
                              setCurrentPost({
                                ...currentPost,
                                title: e.target.value,
                              })
                            }
                            placeholder="Enter blog post title..."
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="excerpt">Excerpt</Label>
                          <Textarea
                            id="excerpt"
                            value={currentPost.excerpt}
                            onChange={(e) =>
                              setCurrentPost({
                                ...currentPost,
                                excerpt: e.target.value,
                              })
                            }
                            placeholder="Brief description of your blog post..."
                            rows={2}
                          />
                        </div>

                        {/* Rich Text Editor Component */}
                        <div>
                          <Label>Content</Label>
                          <RichTextEditor
                            value={currentPost.content}
                            onChange={(content) =>
                              setCurrentPost({ ...currentPost, content })
                            }
                            placeholder="Start writing your blog post content..."
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="tags">Tags (comma separated)</Label>
                            <Input
                              id="tags"
                              value={currentPost.tags_input}
                              onChange={(e) =>
                                setCurrentPost({
                                  ...currentPost,
                                  tags_input: e.target.value,
                                })
                              }
                              placeholder="anxiety, mindfulness, therapy..."
                            />
                          </div>
                          <div>
                            <Label htmlFor="status">Status</Label>
                            <Select
                              value={currentPost.status}
                              onValueChange={(value: BlogPost["status"]) =>
                                setCurrentPost({
                                  ...currentPost,
                                  status: value,
                                })
                              }
                              // FIX: Disable the status selection for Patient users when creating
                              disabled={user?.role === "user" && !isEditing}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                {/* If a patient is submitting, the backend auto-sets to pending, but we show this for clarity */}
                                <SelectItem
                                  value="pending"
                                  disabled={user?.role === "user" && !isEditing}
                                >
                                  {user?.role === "user"
                                    ? "Awaiting Review"
                                    : "Submit for Review"}
                                </SelectItem>
                                {/* Only Doctors/Counselors/Admins can publish directly */}
                                <SelectItem
                                  value="published"
                                  disabled={user?.role === "user" && !isEditing}
                                >
                                  Publish Now
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex justify-end gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">
                            {isEditing ? "Save Changes" : "Create Post"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
            </Card>
            {/* Tabs, Sorting, and Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {" "}
              {/* <-- Corrected Tabs wrapper */}
              <div className="flex justify-between items-center mb-6">
                <TabsList>
                  <TabsTrigger value="all">All Posts</TabsTrigger>
                  <TabsTrigger value="published">Published</TabsTrigger>
                  <TabsTrigger value="pending">Pending Review</TabsTrigger>
                  <TabsTrigger value="draft">Drafts</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>

                {/* NEW: Sorting Dropdown */}
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
              <TabsContent value={activeTab}>
                <div className="grid gap-6">
                  {isLoading ? (
                    <Card className="col-span-full">
                      <CardContent className="text-center py-12">
                        Loading posts...
                      </CardContent>
                    </Card>
                  ) : blogPosts.length === 0 ? (
                    <Card className="col-span-full">
                      <CardContent className="text-center py-12">
                        <p className="text-text-muted">
                          No blog posts found in this category.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    blogPosts.map((post) => (
                      <Card
                        key={post.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <CardTitle className="text-xl">
                                  {post.title}
                                </CardTitle>
                                <Badge className={getStatusColor(post.status)}>
                                  {getStatusIcon(post.status)}
                                  <span className="ml-1 capitalize">
                                    {post.status}
                                  </span>
                                </Badge>
                              </div>
                              <p className="text-text-muted">{post.excerpt}</p>
                              <div className="flex items-center gap-4 mt-3 text-sm text-text-muted">
                                <span>
                                  Author:{" "}
                                  <span className="font-semibold">
                                    {post.author_name}
                                  </span>
                                </span>
                                <span>
                                  Created:{" "}
                                  {new Date(
                                    post.createdAt
                                  ).toLocaleDateString()}
                                </span>
                                {post.publishedAt && (
                                  <span>
                                    Published:{" "}
                                    {new Date(
                                      post.publishedAt
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons for EDIT/DELETE/VIEW */}
                            <div className="flex flex-col items-end gap-2">
                              {/* Engagement Metrics (NEW) */}
                              <div className="flex items-center gap-4 text-sm font-medium text-gray-600">
                                <span>
                                  <Star className="w-4 h-4 text-yellow-500 inline-block mr-1" />
                                  {post.average_rating.toFixed(1)}{" "}
                                  <span className="text-xs text-muted-foreground">
                                    ({post.rating_count})
                                  </span>
                                </span>
                                <span>
                                  <MessageSquare className="w-4 h-4 text-blue-500 inline-block mr-1" />
                                  {post.comment_count}
                                </span>
                                <span>
                                  <ThumbsUp className="w-4 h-4 text-primary inline-block mr-1" />
                                  {post.reaction_counts.like}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReadMore(post)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>

                                {/* Check if user is the author or Admin */}
                                {(user?.id?.toString() === post.authorId ||
                                  user?.role === "admin") && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openEditDialog(post)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeletePost(post.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {Array.isArray(post.tags)
                              ? post.tags.map((tag, index) => (
                                  <Badge key={index} variant="outline">
                                    #{tag}
                                  </Badge>
                                ))
                              : null}
                          </div>
                          <p className="text-text-muted text-sm line-clamp-3">
                            {post.content.substring(0, 200)}...
                          </p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>{" "}
            {/* <-- Corrected Tabs closure */}
          </div>
        </div>
        <RightSidebar />
      </div>

      {/* NEW: Full Article Dialog Component */}
      <FullArticleDialog
        post={selectedArticle}
        isOpen={isArticleDialogOpen}
        onOpenChange={setIsArticleDialogOpen}
        showEngagement={false} // <-- Added for clarity
      />
    </>
  );
}
