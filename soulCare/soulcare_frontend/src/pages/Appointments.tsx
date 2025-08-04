import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  Filter,
  Video,
  User,
  Phone,
  MoreHorizontal
} from 'lucide-react';

const Appointments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedView, setSelectedView] = useState<'all' | 'today' | 'upcoming' | 'past'>('all');

  const mockAppointments = [
    {
      id: '1',
      patient: 'Sarah Johnson',
      date: '2024-01-16',
      time: '10:00 AM',
      duration: 60,
      type: 'consultation',
      status: 'scheduled',
      mode: 'video',
      notes: 'Follow-up on anxiety management techniques'
    },
    {
      id: '2',
      patient: 'Mike Chen',
      date: '2024-01-16',
      time: '11:30 AM',
      duration: 45,
      type: 'therapy',
      status: 'scheduled',
      mode: 'in-person',
      notes: 'Depression counseling session'
    },
    {
      id: '3',
      patient: 'Emma Wilson',
      date: '2024-01-16',
      time: '2:00 PM',
      duration: 60,
      type: 'follow-up',
      status: 'scheduled',
      mode: 'video',
      notes: 'PTSD therapy progress review'
    },
    {
      id: '4',
      patient: 'James Rodriguez',
      date: '2024-01-15',
      time: '3:30 PM',
      duration: 45,
      type: 'consultation',
      status: 'completed',
      mode: 'in-person',
      notes: 'Initial bipolar disorder assessment'
    },
    {
      id: '5',
      patient: 'Lisa Park',
      date: '2024-01-17',
      time: '9:00 AM',
      duration: 60,
      type: 'therapy',
      status: 'scheduled',
      mode: 'video',
      notes: 'Stress management techniques'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-primary/20 text-primary';
      case 'completed': return 'bg-success/20 text-success';
      case 'cancelled': return 'bg-destructive/20 text-destructive';
      case 'no-show': return 'bg-warning/20 text-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation': return Clock;
      case 'therapy': return User;
      case 'follow-up': return Calendar;
      default: return Calendar;
    }
  };

  const filteredAppointments = mockAppointments.filter(appointment => {
    const matchesSearch = appointment.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.notes.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedView === 'today') {
      return matchesSearch && appointment.date === '2024-01-16';
    } else if (selectedView === 'upcoming') {
      return matchesSearch && new Date(appointment.date) >= new Date('2024-01-16');
    } else if (selectedView === 'past') {
      return matchesSearch && new Date(appointment.date) < new Date('2024-01-16');
    }
    
    return matchesSearch;
  });

  return (
    <div className="min-h-screen healthcare-gradient pr-16">
      <RightSidebar />
      
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Appointments
            </h1>
            <p className="text-muted-foreground">
              Manage your appointment schedule and patient meetings
            </p>
          </div>
          <Button className="healthcare-button-primary">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Appointment
          </Button>
        </div>

        {/* Filters and Search */}
        <Card className="healthcare-card mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* View Toggle */}
              <div className="flex rounded-lg bg-muted p-1">
                {(['all', 'today', 'upcoming', 'past'] as const).map((view) => (
                  <button
                    key={view}
                    onClick={() => setSelectedView(view)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedView === view
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search appointments by patient or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => {
            const TypeIcon = getTypeIcon(appointment.type);
            return (
              <Card key={appointment.id} className="healthcare-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <TypeIcon className="w-6 h-6 text-primary" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            {appointment.patient}
                          </h3>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(appointment.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {appointment.time} ({appointment.duration} min)
                          </div>
                          <div className="flex items-center">
                            {appointment.mode === 'video' ? (
                              <Video className="w-4 h-4 mr-1" />
                            ) : (
                              <User className="w-4 h-4 mr-1" />
                            )}
                            {appointment.mode === 'video' ? 'Video Call' : 'In-Person'}
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-2">
                          {appointment.notes}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {appointment.status === 'scheduled' && (
                        <>
                          {appointment.mode === 'video' && (
                            <Button size="sm" className="healthcare-button-primary">
                              <Video className="w-4 h-4 mr-1" />
                              Join Call
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="healthcare-button-success">
                            Complete
                          </Button>
                          <Button size="sm" variant="outline" className="healthcare-button-danger">
                            Cancel
                          </Button>
                        </>
                      )}
                      
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredAppointments.length === 0 && (
          <Card className="healthcare-card">
            <CardContent className="text-center py-12">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No appointments found
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Try adjusting your search criteria or schedule a new appointment.'
                  : 'Start by scheduling your first appointment.'
                }
              </p>
              <Button className="healthcare-button-primary">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Appointment
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Appointments;