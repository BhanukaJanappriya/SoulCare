import React from 'react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import AdminUserTable from '@/pages/admin/AdminUserTable';

const ManageCounselorsPage: React.FC = () => {
  // Fetch users with the 'counselor' role
  const { data: counselors = [], isLoading } = useAdminUsers('counselor');

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Manage Counselors</h1>
      <p className="text-muted-foreground mb-6">View and approve counselor accounts.</p>
      
      <AdminUserTable users={counselors} role="counselor" isLoading={isLoading} />
    </div>
  );
};

export default ManageCounselorsPage;