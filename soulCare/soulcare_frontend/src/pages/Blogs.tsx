import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Plus, Edit, Trash2, Eye, Clock, CheckCircle, XCircle, AlertCircle, } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { BlogPost } from "@/types";
import { fetchBlogPosts, createBlogPost, deleteBlogPost, updateBlogPost } from "@/pages/api/blogApi";
import RichTextEditor from "@/components/common/RichTextEditor";


// --- UI Helper Functions (Ensure these are in your file) ---
const getStatusColor = (status: BlogPost["status"]) => {
  switch (status) {
    case "published": return "bg-green-500 text-white";
    case "pending": return "bg-orange-500 text-white";
    case "draft": return "bg-gray-500 text-white";
    case "rejected": return "bg-red-500 text-white";
    default: return "bg-gray-500 text-white";
  }
};

const getStatusIcon = (status: BlogPost["status"]) => {
  switch (status) {
    case "published": return <CheckCircle className="w-4 h-4" />;
    case "pending": return <Clock className="w-4 h-4" />;
    case "draft": return <Edit className="w-4 h-4" />;
    case "rejected": return <XCircle className="w-4 h-4" />;
    default: return <AlertCircle className="w-4 h-4" />;
  }
};
// ----------------------------------------------------------------------


// Initial State for a new/editing post
const initialPostState = {
    title: "",
    content: "",
    excerpt: "",
    tags: "",
    status: "draft" as BlogPost["status"],
};

export default function Blogs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Controls the visibility of the Create/Edit Dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // Tracks if the dialog is in Edit mode (true) or Create mode (false)
  const [isEditing, setIsEditing] = useState(false);

  const [activeTab, setActiveTab] = useState("all");
  const [currentPost, setCurrentPost] = useState(initialPostState);
  const [currentPostId, setCurrentPostId] = useState<string | null>(null);

  // *** REMOVED: Deleted the duplicate 'newPost' state ***
  // We use currentPost for both new and existing posts now.


  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch posts based on the active tab status
      const data = await fetchBlogPosts(activeTab);
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
  }, [activeTab, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  // --- CREATE / UPDATE Handlers ---

  const openCreateDialog = () => {
    setCurrentPost(initialPostState);
    setCurrentPostId(null);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (post: BlogPost) => {
    // Map the fetched BlogPost object to the form's state shape
    setCurrentPost({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || "", // Ensure excerpt is not undefined
        // The API returns an array, so convert it to a comma-separated string
        tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
        status: post.status,
    });
    setCurrentPostId(post.id);
    setIsEditing(true);
    setIsDialogOpen(true);
  };


  const handleSavePost = async () => {
    // 1. Basic validation
    if (!currentPost.title || !currentPost.content) {
        toast({ title: "Validation Error", description: "Title and Content are required.", variant: "destructive" });
        return;
    }

    // Role-based check on saving
    if (!user || (user.role !== 'doctor' && user.role !== 'counselor' && user.role !== 'user')) {
         toast({
            title: "Permission Denied",
            description: "Your role cannot create/edit blog posts.",
            variant: "destructive",
        });
        return;
    }

    try {
        if (isEditing && currentPostId) {
            // --- UPDATE LOGIC ---
            await updateBlogPost(currentPostId, currentPost);
            toast({ title: "Post Updated", description: "Your blog post has been successfully updated." });
        } else {
            // --- CREATE LOGIC ---
            await createBlogPost(currentPost);
            toast({ title: "Post Created", description: `Your blog post has been saved as ${currentPost.status}.` });
        }

        // Success cleanup
        await fetchData(); // Re-fetch the list
        setIsDialogOpen(false);
        setCurrentPost(initialPostState); // Reset form

    } catch (error) {
        console.error("Error saving blog post (Check Network for 4xx/5xx):", error);
        toast({
            title: "Error",
            description: "Failed to save blog post. Check console and ensure you have permission.",
            variant: "destructive",
        });
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
        await deleteBlogPost(id);
        setBlogPosts(blogPosts.filter((post) => post.id !== id));
        toast({ title: "Blog Post Deleted", description: "The blog post has been successfully deleted." });
    } catch (error) {
        console.error("Error deleting blog post:", error);
        toast({ title: "Error", description: "Failed to delete blog post. You might not have permission.", variant: "destructive" });
    }
  };


  return (
    <div className="min-h-screen bg-page-bg flex">
      <div className="flex-1 pr-16">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-dark mb-2">Blog Management</h1>
              <p className="text-text-muted">Create and manage your professional blog posts</p>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                {/* User role check for button visibility */}
                {(user?.role === 'doctor' || user?.role === 'counselor' || user?.role === 'user') && (
                    <Button onClick={openCreateDialog}>
                      <Plus className="w-4 h-4 mr-2" />
                      New Blog Post
                    </Button>
                )}
              </DialogTrigger>

              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{isEditing ? "Edit Blog Post" : "Create New Blog Post"}</DialogTitle>
                </DialogHeader>

                {/* FIX: Form and onSubmit handler to prevent network failure */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSavePost();
                  }}
                  className="space-y-6"
                >

                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={currentPost.title}
                      onChange={(e) =>
                        setCurrentPost({ ...currentPost, title: e.target.value })
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
                        setCurrentPost({ ...currentPost, excerpt: e.target.value })
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
                        onChange={(content) => setCurrentPost({ ...currentPost, content })}
                        placeholder="Start writing your blog post content..."
                        rows={12}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tags">Tags (comma separated)</Label>
                      <Input
                        id="tags"
                        value={currentPost.tags}
                        onChange={(e) =>
                          setCurrentPost({ ...currentPost, tags: e.target.value })
                        }
                        placeholder="anxiety, mindfulness, therapy..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={currentPost.status}
                        onValueChange={(value: BlogPost["status"]) =>
                          setCurrentPost({ ...currentPost, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="pending">
                            Submit for Review
                          </SelectItem>
                          <SelectItem value="published">Publish Now</SelectItem>
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

          {/* Tabs and Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Posts</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="pending">Pending Review</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <div className="grid gap-6">
                {isLoading ? (
                   <Card className="col-span-full"><CardContent className="text-center py-12">Loading posts...</CardContent></Card>
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
                    <Card key={post.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <CardTitle className="text-xl">{post.title}</CardTitle>
                              <Badge className={getStatusColor(post.status)}>
                                {getStatusIcon(post.status)}
                                <span className="ml-1 capitalize">{post.status}</span>
                              </Badge>
                            </div>
                            <p className="text-text-muted">{post.excerpt}</p>
                            <div className="flex items-center gap-4 mt-3 text-sm text-text-muted">
                                <span>Created: {new Date(post.createdAt).toLocaleDateString()}</span>
                                {post.publishedAt && (
                                <span>Published: {new Date(post.publishedAt).toLocaleDateString()}</span>
                                )}
                            </div>
                          </div>

                          {/* Action Buttons for EDIT/DELETE */}
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>

                            {/* Check if user is the author or Admin to show edit/delete */}
                            {(user?.id.toString() === post.authorId || user?.role === 'admin') && (
                                <>
                                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(post)}>
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
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {Array.isArray(post.tags) ? post.tags.map((tag, index) => (
                            <Badge key={index} variant="outline">
                              #{tag}
                            </Badge>
                          )) : null}
                        </div>
                        <p className="text-text-muted text-sm line-clamp-3">
                            {/* Display the rich content preview (e.g., stripping HTML if you used a real RTE) */}
                          {post.content.substring(0, 200)}...
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <RightSidebar />
    </div>
  );
}
