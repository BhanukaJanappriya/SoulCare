import React from 'react';
import { AdminUserListItem, UserRole } from '@/types'; 
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
import { useVerifyUser } from '@/hooks/useAdminUsers';

interface AdminUserTableProps {
  users: AdminUserListItem[]; // CORRECTED: The table accepts an array of the new type
  role: UserRole;
  isLoading: boolean;
}

const AdminUserTable: React.FC<AdminUserTableProps> = ({ users, role, isLoading }) => {
  const { mutate: verifyUser, isPending } = useVerifyUser();

  const handleVerify = (userId: number, currentStatus: boolean) => {
    verifyUser({ userId, is_verified: !currentStatus });
  };

  if (isLoading) {
    return <div className="text-center">Loading users...</div>;
  }

  if (users.length === 0) {
    return <div className="text-center">No {role}s found.</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Verification Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              {/* CORRECTED: Access full_name directly from the user object */}
              <TableCell className="font-medium">{user.full_name}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge 
                  variant={user.is_verified ? "default" : "destructive"}
                  className={user.is_verified ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"}
                >
                  {user.is_verified ? "Verified" : "Pending"}
                </Badge>
              </TableCell>
              <TableCell>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleVerify(user.id, user.is_verified)}
                  disabled={isPending}
                >
                  {user.is_verified ? "Unverify" : "Verify"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminUserTable;