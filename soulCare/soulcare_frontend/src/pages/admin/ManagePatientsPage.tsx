import React from 'react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import AdminUserTable from '@/pages/admin/AdminUserTable';

const ManagePatientsPage: React.FC = () => {
  // Fetch users with the 'user' role
  const { data: patients = [], isLoading } = useAdminUsers('user');

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Manage Patients</h1>
      <p className="text-muted-foreground mb-6">View and Manage Patient accounts.</p>
      
      <AdminUserTable users={patients} role="counselor" isLoading={isLoading} />
    </div>
  );
};

export default ManagePatientsPage;