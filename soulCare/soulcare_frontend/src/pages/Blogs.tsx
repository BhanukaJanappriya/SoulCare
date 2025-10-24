import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
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
import FullArticleDialog from "@/components/common/FullArticleDialog"; // <--- NEW IMPORT


// --- UI Helper Functions (Status Colors/Icons) ---
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
  const [isEditing, setIsEditing] = useState(false);

  const [activeTab, setActiveTab] = useState("all");
  const [currentPost, setCurrentPost] = useState(initialPostState);
  const [currentPostId, setCurrentPostId] = useState<string | null>(null);

  // --- NEW STATE for Read More Dialog ---
  const [isArticleDialogOpen, setIsArticleDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<BlogPost | null>(null);
  // ------------------------------------


  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchBlogPosts(activeTab);
      setBlogPosts(data);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      toast({ title: "Error", description: "Failed to load blog posts from the server.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, toast]);

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
        tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
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
        toast({ title: "Validation Error", description: "Title and Content are required.", variant: "destructive" });
        return;
    }

    // Role-based check on creation/editing permission
    const isPermittedUser = (user?.role === 'doctor' || user?.role === 'counselor' || user?.role === 'user' || user?.role === 'admin');
    if (!user || !isPermittedUser) {
         toast({ title: "Permission Denied", description: "You do not have permission to perform this action.", variant: "destructive" });
         return;
    }

    // Logic to override status for Patients on creation
    const isPatientCreating = user?.role === 'user' && !isEditing;
    const finalPostData = {
        ...currentPost,
        // If patient creates, force status to 'pending'. Backend will also enforce this.
        status: isPatientCreating ? 'pending' : currentPost.status,
    };


    try {
        if (isEditing && currentPostId) {
            // --- UPDATE LOGIC ---
            await updateBlogPost(currentPostId, finalPostData);
            toast({ title: "Post Updated", description: "Your blog post has been successfully updated." });
        } else {
            // --- CREATE LOGIC ---
            await createBlogPost(finalPostData);

            // Custom toast message for patient creation flow
            const toastStatus = isPatientCreating ? 'pending (Awaiting Admin Review)' : finalPostData.status;
            toast({ title: "Post Created", description: `Your blog post has been saved as ${toastStatus}.` });
        }

        // Success cleanup
        await fetchData();
        setIsDialogOpen(false);
        setCurrentPost(initialPostState);

    } catch (error) {
        console.error("Error saving blog post (Check Network for 4xx/5xx):", error);
        toast({
            title: "Error",
            description: `Failed to save blog post. ${error.message || 'Check console for details.'}`,
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
        toast({ title: "Error", description: "Failed to delete blog post. Permission Denied.", variant: "destructive" });
    }
  };


  return (
    <>
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
                  <DialogTitle>{isEditing ? "Edit Blog Post" : "Create New Blog Post"}</DialogTitle>
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

                  <div><Label htmlFor="title">Title</Label>
                    <Input id="title" value={currentPost.title} onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })} placeholder="Enter blog post title..." required />
                  </div>
                  <div><Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea id="excerpt" value={currentPost.excerpt} onChange={(e) => setCurrentPost({ ...currentPost, excerpt: e.target.value })} placeholder="Brief description of your blog post..." rows={2} />
                  </div>

                  {/* Rich Text Editor Component */}
                  <div>
                    <Label>Content</Label>
                    <RichTextEditor
                        value={currentPost.content}
                        onChange={(content) => setCurrentPost({ ...currentPost, content })}
                        placeholder="Start writing your blog post content..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tags">Tags (comma separated)</Label>
                      <Input id="tags" value={currentPost.tags} onChange={(e) => setCurrentPost({ ...currentPost, tags: e.target.value })} placeholder="anxiety, mindfulness, therapy..." />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={currentPost.status}
                        onValueChange={(value: BlogPost["status"]) =>
                          setCurrentPost({ ...currentPost, status: value })
                        }
                        // FIX: Disable the status selection for Patient users when creating
                        disabled={user?.role === 'user' && !isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          {/* If a patient is submitting, the backend auto-sets to pending, but we show this for clarity */}
                          <SelectItem value="pending" disabled={user?.role === 'user' && !isEditing}>
                            {user?.role === 'user' ? 'Awaiting Review' : 'Submit for Review'}
                          </SelectItem>
                          {/* Only Doctors/Counselors/Admins can publish directly */}
                          <SelectItem value="published" disabled={user?.role === 'user' && !isEditing}>Publish Now</SelectItem>
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
                      <p className="text-text-muted">No blog posts found in this category.</p>
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
                            {/* FIX: Use ReadMore handler */}
                            <Button variant="ghost" size="sm" onClick={() => handleReadMore(post)}><Eye className="w-4 h-4" /></Button>

                            {/* Check if user is the author (convert ID to string) or Admin */}
                            {(user?.id?.toString() === post.authorId || user?.role === 'admin') && (
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

    {/* NEW: Full Article Dialog Component */}
    <FullArticleDialog
        post={selectedArticle}
        isOpen={isArticleDialogOpen}
        onOpenChange={setIsArticleDialogOpen}
    />
    </>
  );
}
