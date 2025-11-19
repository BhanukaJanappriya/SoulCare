import React from 'react';
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
import { useAdminBlogs } from '@/hooks/useAdminBlogs';
import { format } from 'date-fns';
import { Eye, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom'; // Assuming you have a blog detail page to link to

interface AdminBlogTableProps {
  blogs: BlogPost[];
  isLoading: boolean;
}

const AdminBlogTable: React.FC<AdminBlogTableProps> = ({ blogs, isLoading }) => {
  const { updateStatus, deleteBlog } = useAdminBlogs();

  const handleStatusChange = (id: string, newStatus: 'published' | 'rejected') => {
    updateStatus.mutate({ id, status: newStatus });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      deleteBlog.mutate(id);
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
                  {/* View Button (Optional - if you have a detail page) */}
                  {/* <Button variant="ghost" size="icon" asChild>
                    <Link to={`/blogs/${blog.id}`} target="_blank">
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button> */}

                  {blog.status === 'pending' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                        onClick={() => handleStatusChange(blog.id, 'published')}
                        disabled={updateStatus.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        onClick={() => handleStatusChange(blog.id, 'rejected')}
                        disabled={updateStatus.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(blog.id)}
                    disabled={deleteBlog.isPending}
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
  );
};

export default AdminBlogTable;