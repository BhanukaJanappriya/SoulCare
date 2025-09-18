import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {axiosInstance} from "@/api"; 
import { UserRole, AdminUserListItem } from "@/types"; 


export const useAdminUsers = (role: UserRole) => {
  return useQuery<AdminUserListItem[], Error>({
    queryKey: ['adminUsers', role], 
    queryFn: async () => {
      const response = await axiosInstance.get<AdminUserListItem[]>(`admin/manage-users/?role=${role}`);
      
      return response.data;
    },
    enabled: !!role, 
  });
};


export const useVerifyUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, is_verified }: { userId: number; is_verified: boolean }) => {
      
      const response = await axiosInstance.patch(`admin/manage-users/${userId}/`, {
        is_verified: is_verified,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });
};