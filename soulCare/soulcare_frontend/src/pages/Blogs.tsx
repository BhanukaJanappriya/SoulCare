import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  Image,
  Link,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BlogPost } from "@/types";

const mockBlogPosts: BlogPost[] = [
  {
    id: "1",
    authorId: "1",
    title: "Understanding Anxiety: A Comprehensive Guide",
    content:
      "Anxiety is a natural response to stress, but when it becomes overwhelming...",
    excerpt:
      "Learn about the different types of anxiety disorders and effective coping strategies.",
    tags: ["anxiety", "mental-health", "coping-strategies"],
    status: "published",
    publishedAt: new Date("2024-01-15"),
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    authorId: "1",
    title: "Mindfulness Techniques for Daily Practice",
    content:
      "Mindfulness is the practice of being fully present in the moment...",
    excerpt:
      "Discover simple mindfulness exercises you can do anywhere, anytime.",
    tags: ["mindfulness", "meditation", "daily-practice"],
    status: "pending",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
  },
];

export default function Blogs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(mockBlogPosts);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    excerpt: "",
    tags: "",
    status: "draft" as BlogPost["status"],
  });

  const handleCreatePost = () => {
    const post: BlogPost = {
      id: Date.now().toString(),
      authorId: user?.id || "1",
      title: newPost.title,
      content: newPost.content,
      excerpt: newPost.excerpt,
      tags: newPost.tags.split(",").map((tag) => tag.trim()),
      status: newPost.status,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...(newPost.status === "published" && { publishedAt: new Date() }),
    };

    setBlogPosts([post, ...blogPosts]);
    setNewPost({
      title: "",
      content: "",
      excerpt: "",
      tags: "",
      status: "draft",
    });
    setIsCreating(false);

    toast({
      title: "Blog Post Created",
      description: `Your blog post has been saved as ${newPost.status}.`,
    });
  };

  const handleDeletePost = (id: string) => {
    setBlogPosts(blogPosts.filter((post) => post.id !== id));
    toast({
      title: "Blog Post Deleted",
      description: "The blog post has been successfully deleted.",
    });
  };

  const getStatusColor = (status: BlogPost["status"]) => {
    switch (status) {
      case "published":
        return "bg-success text-white";
      case "pending":
        return "bg-warning text-white";
      case "draft":
        return "bg-gray-500 text-white";
      case "rejected":
        return "bg-error text-white";
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

  const filteredPosts = blogPosts.filter(
    (post) => activeTab === "all" || post.status === activeTab
  );

  return (
    <div className="min-h-screen bg-page-bg flex">
      <div className="flex-1 pr-16">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-dark mb-2">
                Blog Management
              </h1>
              <p className="text-text-muted">
                Create and manage your professional blog posts
              </p>
            </div>
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Blog Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Blog Post</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newPost.title}
                      onChange={(e) =>
                        setNewPost({ ...newPost, title: e.target.value })
                      }
                      placeholder="Enter blog post title..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      value={newPost.excerpt}
                      onChange={(e) =>
                        setNewPost({ ...newPost, excerpt: e.target.value })
                      }
                      placeholder="Brief description of your blog post..."
                      rows={2}
                    />
                  </div>

                  {/* Rich Text Editor Toolbar */}
                  <div>
                    <Label>Content</Label>
                    <div className="border rounded-lg">
                      <div className="flex items-center gap-2 p-3 border-b bg-gray-50">
                        <Button variant="ghost" size="sm">
                          <Bold className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Italic className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Underline className="w-4 h-4" />
                        </Button>
                        <div className="w-px h-6 bg-gray-300 mx-2" />
                        <Button variant="ghost" size="sm">
                          <AlignLeft className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <AlignCenter className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <AlignRight className="w-4 h-4" />
                        </Button>
                        <div className="w-px h-6 bg-gray-300 mx-2" />
                        <Button variant="ghost" size="sm">
                          <List className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Image className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Link className="w-4 h-4" />
                        </Button>
                      </div>
                      <Textarea
                        value={newPost.content}
                        onChange={(e) =>
                          setNewPost({ ...newPost, content: e.target.value })
                        }
                        placeholder="Start writing your blog post content..."
                        rows={12}
                        className="border-0 resize-none focus:ring-0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tags">Tags (comma separated)</Label>
                      <Input
                        id="tags"
                        value={newPost.tags}
                        onChange={(e) =>
                          setNewPost({ ...newPost, tags: e.target.value })
                        }
                        placeholder="anxiety, mindfulness, therapy..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={newPost.status}
                        onValueChange={(value: BlogPost["status"]) =>
                          setNewPost({ ...newPost, status: value })
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
                      variant="outline"
                      onClick={() => setIsCreating(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreatePost}>Create Post</Button>
                  </div>
                </div>
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
                {filteredPosts.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <p className="text-text-muted">
                        No blog posts found in this category.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredPosts.map((post) => (
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
                                Created: {post.createdAt.toLocaleDateString()}
                              </span>
                              {post.publishedAt && (
                                <span>
                                  Published:{" "}
                                  {post.publishedAt.toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePost(post.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.map((tag, index) => (
                            <Badge key={index} variant="outline">
                              #{tag}
                            </Badge>
                          ))}
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
  );
}
