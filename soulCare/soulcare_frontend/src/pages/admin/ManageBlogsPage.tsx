import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAdminBlogsAPI } from '@/api';
import { BlogPost } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminBlogTable from './AdminBlogTable';
import { FileText } from 'lucide-react';

const ManageBlogsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("pending");

  // Fetch blogs based on the active tab
  const { data: blogs = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ['adminBlogs', activeTab],
    queryFn: () => getAdminBlogsAPI(activeTab === 'all' ? 'all' : activeTab),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Manage Blogs</h1>
        <p className="text-muted-foreground">Review pending articles and manage published content.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Optional: Add mini-stats cards here like "Total Pending", "Published Today" if you want */}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Blog Posts</CardTitle>
          </div>
          <CardDescription>
            Review, approve, or reject blog submissions from doctors and counselors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="pending">Pending Review</TabsTrigger>
                <TabsTrigger value="published">Published</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="all">All Posts</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="pending" className="mt-0">
              <AdminBlogTable blogs={blogs} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="published" className="mt-0">
              <AdminBlogTable blogs={blogs} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="rejected" className="mt-0">
              <AdminBlogTable blogs={blogs} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="all" className="mt-0">
              <AdminBlogTable blogs={blogs} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageBlogsPage;