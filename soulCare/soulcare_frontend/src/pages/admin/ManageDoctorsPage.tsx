import React from 'react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import AdminUserTable from '@/pages/admin/AdminUserTable';

const ManageDoctorsPage: React.FC = () => {
  // Fetch users with the 'doctor' role
  const { data: doctors = [], isLoading } = useAdminUsers('doctor');

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Manage Doctors</h1>
      <p className="text-muted-foreground mb-6">View and approve doctor accounts.</p>
      
      <AdminUserTable users={doctors} role="doctor" isLoading={isLoading} />
    </div>
  );
};

export default ManageDoctorsPage;