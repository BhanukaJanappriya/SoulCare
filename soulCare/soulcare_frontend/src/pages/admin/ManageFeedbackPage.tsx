import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminFeedbackAPI, approveFeedbackAPI, rejectFeedbackAPI } from "@/api";
import { Feedback } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, MessageSquare, Star, Loader2, Filter, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";

const ManageFeedbackPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending">("all");

  // --- NEW: State for Viewing Feedback ---
  const [viewFeedback, setViewFeedback] = useState<Feedback | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Fetch all feedback
  const { data: feedbacks = [], isLoading } = useQuery<Feedback[]>({
    queryKey: ["adminFeedback"],
    queryFn: getAdminFeedbackAPI,
  });

  // Mutations
  const approveMutation = useMutation({
    mutationFn: approveFeedbackAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminFeedback"] });
      toast({ title: "Approved", description: "Feedback is now public." });
      // Optional: Close view dialog if open and approving from there
      if (isViewOpen) setIsViewOpen(false); 
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectFeedbackAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminFeedback"] });
      toast({ title: "Rejected", description: "Feedback has been hidden." });
       if (isViewOpen) setIsViewOpen(false);
    },
  });

  const handleView = (feedback: Feedback) => {
      setViewFeedback(feedback);
      setIsViewOpen(true);
  };

  // Filter logic
  const filteredFeedbacks = feedbacks.filter((item) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "approved") return item.is_approved;
    if (statusFilter === "pending") return !item.is_approved;
    return true;
  });

  const getStatusBadge = (isApproved: boolean) => {
    return isApproved ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Published</Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-primary" />
            Manage Feedback
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and moderate user testimonials.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select
                value={statusFilter}
                onValueChange={(val: any) => setStatusFilter(val)}
            >
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Feedback</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="approved">Published</SelectItem>
            </SelectContent>
            </Select>
        </div>
      </div>

      <div className="rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">User</TableHead>
              <TableHead className="w-[100px]">Rating</TableHead>
              <TableHead>Content</TableHead>
              <TableHead className="w-[150px]">Date</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : filteredFeedbacks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No feedback found matching your filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredFeedbacks.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.user.full_name || item.user.username}</div>
                    <div className="text-xs text-muted-foreground capitalize">{item.user.role}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                        <span className="font-bold">{item.rating}</span>
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="line-clamp-2 text-sm" title={item.content}>{item.content}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(parseISO(item.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>{getStatusBadge(item.is_approved)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {/* --- NEW: View Button --- */}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => handleView(item)}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </Button>

                      {!item.is_approved && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 h-8 px-2"
                          onClick={() => approveMutation.mutate(item.id)}
                          disabled={approveMutation.isPending}
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      {item.is_approved && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-orange-600 border-orange-200 hover:bg-orange-50 h-8 px-2"
                          onClick={() => rejectMutation.mutate(item.id)}
                          disabled={rejectMutation.isPending}
                          title="Hide/Reject"
                        >
                           <XCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- NEW: View Feedback Dialog --- */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>Feedback Details</DialogTitle>
                <DialogDescription>
                    Full content of the user review.
                </DialogDescription>
            </DialogHeader>
            
            {viewFeedback && (
                <div className="grid gap-4 py-4">
                    <div className="flex items-center justify-between border-b pb-4">
                        <div className="flex flex-col">
                            <span className="font-semibold text-lg">{viewFeedback.user.full_name || viewFeedback.user.username}</span>
                            <Badge variant="outline" className="w-fit mt-1 capitalize">{viewFeedback.user.role}</Badge>
                        </div>
                        <div className="flex flex-col items-end">
                             <div className="flex items-center gap-1">
                                <span className="text-xl font-bold">{viewFeedback.rating}</span>
                                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                             </div>
                             <span className="text-xs text-muted-foreground mt-1">
                                {format(parseISO(viewFeedback.created_at), "PPP p")}
                             </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Review Content</p>
                        <div className="p-4 bg-muted/30 rounded-md text-sm leading-relaxed whitespace-pre-wrap border">
                            {viewFeedback.content}
                        </div>
                    </div>
                </div>
            )}

            <DialogFooter className="flex sm:justify-between gap-2">
                {/* Allow Approve/Reject from inside the modal too */}
                {viewFeedback && !viewFeedback.is_approved && (
                     <Button 
                        className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                        onClick={() => approveMutation.mutate(viewFeedback.id)}
                        disabled={approveMutation.isPending}
                     >
                         <CheckCircle className="w-4 h-4 mr-2" /> Approve & Publish
                     </Button>
                )}
                 {viewFeedback && viewFeedback.is_approved && (
                     <Button 
                        variant="outline"
                        className="text-orange-600 border-orange-200 hover:bg-orange-50 w-full sm:w-auto"
                        onClick={() => rejectMutation.mutate(viewFeedback.id)}
                        disabled={rejectMutation.isPending}
                     >
                         <XCircle className="w-4 h-4 mr-2" /> Reject / Hide
                     </Button>
                )}
                
                <Button variant="secondary" onClick={() => setIsViewOpen(false)}>Close</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default ManageFeedbackPage;