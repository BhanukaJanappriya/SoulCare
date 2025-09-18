import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {axiosInstance} from '@/api';
import StatCard from '@/components/admin/StatCard';
import { AdminUserListItem } from '@/types';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, Clock } from 'lucide-react';

// Define the shape of our stats data from the new backend endpoint
interface DashboardStats {
  total_doctors: number;
  total_counselors: number;
  total_patients: number;
  pending_verifications: number;
  recent_users: AdminUserListItem[];
}

// Data fetching function for react-query
const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await axiosInstance.get<DashboardStats>('/admin/dashboard-stats/');
  return response.data;
};

const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery<DashboardStats, Error>({
    queryKey: ['adminDashboardStats'],
    queryFn: fetchDashboardStats,
  });

  if (isLoading) return <p>Loading dashboard...</p>;
  if (error) return <p>Error loading dashboard: {error.message}</p>;
  if (!stats) return <p>No dashboard data available.</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">An overview of your platform's activity.</p>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Pending Verifications" 
          value={stats.pending_verifications} 
          icon={UserCheck}
          description="Doctors & Counselors to approve"
          className="border-yellow-500"
        />
        <StatCard 
          title="Total Doctors" 
          value={stats.total_doctors} 
          icon={Users}
        />
        <StatCard 
          title="Total Counselors" 
          value={stats.total_counselors} 
          icon={Users}
        />
        <StatCard 
          title="Total Patients" 
          value={stats.total_patients} 
          icon={Users}
        />
      </div>

      {/* Recent Registrations Table */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Registrations</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Date Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recent_users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.date_joined).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;