// soulcare_frontend/src/pages/admin/ManageContentPage.tsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllContentItemsAPI, deleteContentItemAPI } from '@/api';
import { ContentItem } from '@/types';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { FileText, Video, Music, Image as ImageIcon, Search, Trash2, Eye, User } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

const ManageContentPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [itemToDelete, setItemToDelete] = useState<ContentItem | null>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: contentItems = [], isLoading } = useQuery<ContentItem[]>({
        queryKey: ['adminContent'],
        queryFn: getAllContentItemsAPI,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteContentItemAPI,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminContent'] });
            toast({ title: "Success", description: "Content item deleted." });
            setItemToDelete(null);
        },
        onError: (error: any) => {
            toast({ 
                variant: "destructive", 
                title: "Error", 
                description: error.message || "Failed to delete content." 
            });
        }
    });

    const filteredContent = contentItems.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.owner?.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getIcon = (type: string) => {
        switch (type) {
            case 'video': return <Video className="w-4 h-4 text-blue-500" />;
            case 'audio': return <Music className="w-4 h-4 text-green-500" />;
            case 'image': return <ImageIcon className="w-4 h-4 text-purple-500" />;
            default: return <FileText className="w-4 h-4 text-orange-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Content Moderation</h1>
                <p className="text-muted-foreground">Review and manage files uploaded by providers.</p>
            </div>

            {/* Search Bar */}
            <div className="flex items-center space-x-2 max-w-md">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input 
                    placeholder="Search by title or owner..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Uploaded By</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">Loading content...</TableCell>
                            </TableRow>
                        ) : filteredContent.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">No content found.</TableCell>
                            </TableRow>
                        ) : (
                            filteredContent.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{getIcon(item.type)}</TableCell>
                                    <TableCell className="font-medium">{item.title}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <User className="w-3 h-3 text-muted-foreground" />
                                            <span>{item.owner?.username || "Unknown"}</span>
                                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">
                                                {item.owner?.role}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>{format(new Date(item.created_at), 'MMM d, yyyy')}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="sm" asChild>
                                            <a href={item.file} target="_blank" rel="noopener noreferrer">
                                                <Eye className="w-4 h-4" />
                                            </a>
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => setItemToDelete(item)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Content?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{itemToDelete?.title}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setItemToDelete(null)}>Cancel</Button>
                        <Button 
                            variant="destructive" 
                            onClick={() => itemToDelete && deleteMutation.mutate(itemToDelete.id)}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ManageContentPage;