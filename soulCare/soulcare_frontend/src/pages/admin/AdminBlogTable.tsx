import React, { useState } from 'react';
import { BlogPost } from '@/types';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAdminBlogs } from '@/hooks/useAdminBlogs';
import { format } from 'date-fns';
import { Eye, CheckCircle, XCircle, Trash2, User, Calendar } from 'lucide-react';

interface AdminBlogTableProps {
  blogs: BlogPost[];
  isLoading: boolean;
}

const AdminBlogTable: React.FC<AdminBlogTableProps> = ({ blogs, isLoading }) => {
  const { updateStatus, deleteBlog } = useAdminBlogs();
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

  const handleStatusChange = (id: string, newStatus: 'published' | 'rejected') => {
    updateStatus.mutate({ id, status: newStatus });
    // If changing status from the modal, close it
    if (selectedBlog?.id === id) {
        setSelectedBlog(null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      deleteBlog.mutate(id);
      if (selectedBlog?.id === id) {
        setSelectedBlog(null);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Published</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending Review</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="text-center py-4 text-muted-foreground">Loading blogs...</div>;
  }

  if (blogs.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No blog posts found in this category.</div>;
  }

  return (
    <>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Date Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogs.map((blog) => (
              <TableRow key={blog.id}>
                <TableCell className="font-medium">
                  <div className="line-clamp-1" title={blog.title}>
                    {blog.title}
                  </div>
                </TableCell>
                <TableCell>{blog.author_name || 'Unknown'}</TableCell>
                <TableCell className="capitalize text-muted-foreground">
                  {blog.author_role || 'N/A'}
                </TableCell>
                <TableCell>
                  {blog.createdAt ? format(new Date(blog.createdAt), 'MMM d, yyyy') : 'N/A'}
                </TableCell>
                <TableCell>{getStatusBadge(blog.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {/* --- View Button --- */}
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setSelectedBlog(blog)}
                        title="Read Blog"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    {blog.status === 'pending' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                          onClick={() => handleStatusChange(blog.id, 'published')}
                          disabled={updateStatus.isPending}
                          title="Approve"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          onClick={() => handleStatusChange(blog.id, 'rejected')}
                          disabled={updateStatus.isPending}
                          title="Reject"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(blog.id)}
                      disabled={deleteBlog.isPending}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* --- Blog Reading Dialog --- */}
      <Dialog open={!!selectedBlog} onOpenChange={(open) => !open && setSelectedBlog(null)}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
          <DialogHeader>
             <div className="flex items-center gap-2 mb-2">
                {selectedBlog && getStatusBadge(selectedBlog.status)}
             </div>
            <DialogTitle className="text-2xl leading-tight">
                {selectedBlog?.title}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1">
                    <User className="w-4 h-4" /> {selectedBlog?.author_name} ({selectedBlog?.author_role})
                </span>
                <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> {selectedBlog?.createdAt && format(new Date(selectedBlog.createdAt), 'PPP')}
                </span>
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4 mt-4 border rounded-md p-4 bg-muted/10">
            {/* Render tags */}
            {selectedBlog?.tags && selectedBlog.tags.length > 0 && (
                <div className="flex gap-2 mb-6">
                    {selectedBlog.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">#{tag}</Badge>
                    ))}
                </div>
            )}
            
            {/* Render Content - preserve whitespace for simple formatting */}
            <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                {selectedBlog?.content}
            </div>
          </ScrollArea>

          <DialogFooter className="gap-2 sm:gap-0">
             {selectedBlog?.status === 'pending' ? (
                <div className="flex gap-2 w-full justify-end">
                     <Button 
                        variant="outline" 
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleStatusChange(selectedBlog.id, 'rejected')}
                    >
                        <XCircle className="w-4 h-4 mr-2" /> Reject
                    </Button>
                    <Button 
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleStatusChange(selectedBlog.id, 'published')}
                    >
                        <CheckCircle className="w-4 h-4 mr-2" /> Approve & Publish
                    </Button>
                </div>
             ) : (
                 <Button variant="outline" onClick={() => setSelectedBlog(null)}>Close</Button>
             )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminBlogTable;