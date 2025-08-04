import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Camera,
  Settings,
  Share,
  MessageSquare,
  Users,
  Calendar,
  Clock,
  Monitor
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoSession {
  id: string;
  patientName: string;
  patientId: string;
  scheduledTime: Date;
  duration: number;
  status: 'scheduled' | 'active' | 'completed' | 'missed';
  roomId: string;
}

const mockSessions: VideoSession[] = [
  {
    id: '1',
    patientName: 'Sarah Johnson',
    patientId: '1',
    scheduledTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
    duration: 60,
    status: 'scheduled',
    roomId: 'room-sarah-123',
  },
  {
    id: '2',
    patientName: 'Michael Chen',
    patientId: '2',
    scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    duration: 45,
    status: 'scheduled',
    roomId: 'room-michael-456',
  },
];

export default function VideoCall() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<VideoSession[]>(mockSessions);
  const [activeCall, setActiveCall] = useState<VideoSession | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const handleJoinCall = (session: VideoSession) => {
    setActiveCall(session);
    toast({
      title: "Joining Video Call",
      description: `Connecting to session with ${session.patientName}...`,
    });
  };

  const handleEndCall = () => {
    if (activeCall) {
      setSessions(sessions.map(s => 
        s.id === activeCall.id 
          ? { ...s, status: 'completed' as const }
          : s
      ));
      setActiveCall(null);
      toast({
        title: "Call Ended",
        description: "The video session has been ended successfully.",
      });
    }
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    toast({
      title: isVideoEnabled ? "Camera Off" : "Camera On",
      description: `Your camera has been turned ${isVideoEnabled ? 'off' : 'on'}.`,
    });
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    toast({
      title: isAudioEnabled ? "Microphone Muted" : "Microphone Unmuted",
      description: `Your microphone has been ${isAudioEnabled ? 'muted' : 'unmuted'}.`,
    });
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    toast({
      title: isScreenSharing ? "Screen Share Stopped" : "Screen Share Started",
      description: `Screen sharing has been ${isScreenSharing ? 'stopped' : 'started'}.`,
    });
  };

  const getStatusColor = (status: VideoSession['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'missed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getTimeUntilSession = (scheduledTime: Date) => {
    const now = new Date();
    const diff = scheduledTime.getTime() - now.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 0) return 'Overdue';
    if (minutes < 60) return `${minutes}m`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="min-h-screen bg-page-bg flex">
      <div className="flex-1 pr-16">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-dark mb-2">Video Calls</h1>
              <p className="text-text-muted">Conduct secure video sessions with your patients</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Video Settings
              </Button>
              <Button>
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Session
              </Button>
            </div>
          </div>

          {/* Active Call Interface */}
          {activeCall && (
            <Card className="mb-8 border-primary">
              <CardHeader className="bg-primary text-white">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    Active Session: {activeCall.patientName}
                  </CardTitle>
                  <Badge variant="secondary">
                    Duration: {activeCall.duration} minutes
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Video Area */}
                  <div className="lg:col-span-2">
                    <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        <div className="text-center">
                          <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg">Video Stream with {activeCall.patientName}</p>
                          <p className="text-sm opacity-75">Room ID: {activeCall.roomId}</p>
                        </div>
                      </div>
                      
                      {/* Self Video (Picture-in-Picture) */}
                      <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg border-2 border-white">
                        <div className="flex items-center justify-center h-full text-white text-xs">
                          {isVideoEnabled ? (
                            <Camera className="w-6 h-6" />
                          ) : (
                            <div>Camera Off</div>
                          )}
                        </div>
                      </div>

                      {/* Controls Overlay */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                        <div className="flex items-center gap-3 bg-black/50 rounded-full px-4 py-3">
                          <Button
                            variant={isAudioEnabled ? "default" : "destructive"}
                            size="sm"
                            onClick={toggleAudio}
                            className="rounded-full w-10 h-10 p-0"
                          >
                            {isAudioEnabled ? (
                              <Mic className="w-4 h-4" />
                            ) : (
                              <MicOff className="w-4 h-4" />
                            )}
                          </Button>
                          
                          <Button
                            variant={isVideoEnabled ? "default" : "destructive"}
                            size="sm"
                            onClick={toggleVideo}
                            className="rounded-full w-10 h-10 p-0"
                          >
                            {isVideoEnabled ? (
                              <Video className="w-4 h-4" />
                            ) : (
                              <VideoOff className="w-4 h-4" />
                            )}
                          </Button>
                          
                          <Button
                            variant={isScreenSharing ? "default" : "outline"}
                            size="sm"
                            onClick={toggleScreenShare}
                            className="rounded-full w-10 h-10 p-0"
                          >
                            <Monitor className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full w-10 h-10 p-0"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleEndCall}
                            className="rounded-full w-10 h-10 p-0"
                          >
                            <PhoneOff className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Session Info & Chat */}
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Session Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-text-muted">Patient:</span>
                          <span className="font-medium">{activeCall.patientName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">Duration:</span>
                          <span className="font-medium">{activeCall.duration} min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">Started:</span>
                          <span className="font-medium">{formatTime(new Date())}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">Room ID:</span>
                          <span className="font-mono text-sm">{activeCall.roomId}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">
                          <Share className="w-4 h-4 mr-2" />
                          Share Files
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Open Chat
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Users className="w-4 h-4 mr-2" />
                          Invite Supervisor
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Video Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.filter(s => s.status === 'scheduled').length === 0 ? (
                <div className="text-center py-8">
                  <Video className="w-12 h-12 text-text-muted mx-auto mb-4" />
                  <p className="text-text-muted">No upcoming video sessions scheduled.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions
                    .filter(s => s.status === 'scheduled')
                    .map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                            {session.patientName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-medium">{session.patientName}</div>
                            <div className="flex items-center gap-4 text-sm text-text-muted">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatTime(session.scheduledTime)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Video className="w-4 h-4" />
                                <span>{session.duration} min</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(session.status)}>
                            In {getTimeUntilSession(session.scheduledTime)}
                          </Badge>
                          <Button
                            onClick={() => handleJoinCall(session)}
                            disabled={activeCall !== null}
                          >
                            <Video className="w-4 h-4 mr-2" />
                            Join
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sessions
                  .filter(s => s.status === 'completed')
                  .map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                          {session.patientName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium">{session.patientName}</div>
                          <div className="text-sm text-text-muted">
                            {session.scheduledTime.toLocaleDateString()} - {session.duration} minutes
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(session.status)}>
                        Completed
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <RightSidebar />
    </div>
  );
}