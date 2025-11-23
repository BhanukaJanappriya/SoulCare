import React from 'react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import AdminPatientTable from '@/pages/admin/AdminPatientTable';

const ManagePatientsPage: React.FC = () => {
  // Fetch users with the 'user' role
  const { data: patients = [], isLoading } = useAdminUsers('user');

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Manage Patients</h1>
      <p className="text-muted-foreground mb-6">View and Manage Patient accounts.</p>
      
      <AdminPatientTable users={patients} role="user" isLoading={isLoading} />
    </div>
  );
};

export default ManagePatientsPage;