import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBlogStatusAPI, deleteBlogAPI } from "@/api";
import { useToast } from "@/hooks/use-toast";

export const useAdminBlogs = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'published' | 'rejected' }) =>
      updateBlogStatusAPI(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBlogs"] });
      toast({ title: "Success", description: "Blog status updated successfully." });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update blog status.",
      });
    },
  });

  const deleteBlogMutation = useMutation({
    mutationFn: deleteBlogAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBlogs"] });
      toast({ title: "Success", description: "Blog post deleted successfully." });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete blog post.",
      });
    },
  });

  return {
    updateStatus: updateStatusMutation,
    deleteBlog: deleteBlogMutation,
  };
};