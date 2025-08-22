import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  MessageSquare, 
  Megaphone, 
  MessageCircle,
  Send,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Complaint {
  id: string;
  studentId: string;
  studentName: string;
  type: string;
  message: string;
  status: 'pending' | 'resolved';
  createdAt: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [chatStatus, setChatStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  
  const [newComplaint, setNewComplaint] = useState({
    type: '',
    message: ''
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    const complaintsData = JSON.parse(localStorage.getItem('hafedpoly_complaints') || '[]');
    const announcementsData = JSON.parse(localStorage.getItem('hafedpoly_announcements') || '[]');
    
    // Filter complaints for current user
    const myComplaints = complaintsData.filter((c: Complaint) => c.studentId === user?.id);
    setComplaints(myComplaints);
    setAnnouncements(announcementsData);
  };

  const submitComplaint = () => {
    if (!newComplaint.type || !newComplaint.message.trim()) {
      toast({
        title: "Error",
        description: "Please select a complaint type and provide a message",
        variant: "destructive"
      });
      return;
    }

    const complaint: Complaint = {
      id: `comp_${Date.now()}`,
      studentId: user!.id,
      studentName: user!.name,
      type: newComplaint.type,
      message: newComplaint.message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const existingComplaints = JSON.parse(localStorage.getItem('hafedpoly_complaints') || '[]');
    const updatedComplaints = [complaint, ...existingComplaints];
    localStorage.setItem('hafedpoly_complaints', JSON.stringify(updatedComplaints));
    
    setComplaints([complaint, ...complaints]);
    setNewComplaint({ type: '', message: '' });
    
    toast({
      title: "Complaint Submitted",
      description: "Your complaint has been submitted successfully"
    });
  };

  const sendChatMessage = () => {
    if (!chatMessage.trim()) return;
    
    setChatStatus('sending');
    
    // Simulate sending delay
    setTimeout(() => {
      setChatStatus('sent');
      setChatMessage('');
      
      setTimeout(() => {
        setChatStatus('idle');
      }, 2000);
    }, 1000);
  };

  const complaintTypes = [
    'Academic Issues',
    'Facility Problems',
    'Administrative Issues',
    'Health & Safety',
    'Technology Issues',
    'Other'
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-primary shadow-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">Student Portal</h1>
              <p className="text-primary-foreground/80">Welcome back, {user?.name}</p>
            </div>
            <Button onClick={logout} variant="secondary">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="complaints" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Complaints
            </TabsTrigger>
            <TabsTrigger value="announcements" className="flex items-center gap-2">
              <Megaphone className="w-4 h-4" />
              Announcements
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Student Profile
                </CardTitle>
                <CardDescription>
                  Your personal information and academic details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                      <p className="text-lg font-semibold">{user?.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
                      <p className="text-lg">{user?.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Student ID</Label>
                      <p className="text-lg font-mono">{user?.id}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Registration Number</Label>
                      <p className="text-lg font-semibold">{(user as any)?.regNo}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                      <p className="text-lg">{(user as any)?.department}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Level</Label>
                      <p className="text-lg">{(user as any)?.level}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="complaints">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Submit New Complaint
                  </CardTitle>
                  <CardDescription>
                    Report any issues or concerns you may have
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="complaint-type">Complaint Type</Label>
                    <Select
                      value={newComplaint.type}
                      onValueChange={(value) => setNewComplaint(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select complaint type" />
                      </SelectTrigger>
                      <SelectContent>
                        {complaintTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="complaint-message">Message</Label>
                    <Textarea
                      id="complaint-message"
                      placeholder="Describe your complaint in detail..."
                      rows={4}
                      value={newComplaint.message}
                      onChange={(e) => setNewComplaint(prev => ({ ...prev, message: e.target.value }))}
                    />
                  </div>
                  <Button onClick={submitComplaint}>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Complaint
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    My Complaints ({complaints.length})
                  </CardTitle>
                  <CardDescription>
                    Track the status of your submitted complaints
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {complaints.map((complaint) => (
                      <div key={complaint.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{complaint.type}</h3>
                            <p className="text-sm text-muted-foreground">
                              Submitted on {new Date(complaint.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={complaint.status === 'pending' ? 'destructive' : 'default'}>
                            {complaint.status === 'pending' ? (
                              <Clock className="w-3 h-3 mr-1" />
                            ) : (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            )}
                            {complaint.status}
                          </Badge>
                        </div>
                        <p className="text-sm">{complaint.message}</p>
                      </div>
                    ))}
                    {complaints.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No complaints submitted yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="announcements">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5" />
                  Recent Announcements ({announcements.length})
                </CardTitle>
                <CardDescription>
                  Stay updated with the latest news and information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{announcement.title}</h3>
                        <span className="text-sm text-muted-foreground">
                          {new Date(announcement.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{announcement.content}</p>
                    </div>
                  ))}
                  {announcements.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No announcements available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Student Chat
                </CardTitle>
                <CardDescription>
                  Chat feature coming soon - currently in development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4 min-h-[200px] flex items-center justify-center text-muted-foreground">
                    Chat messages will appear here...
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                      disabled={chatStatus === 'sending'}
                    />
                    <Button 
                      onClick={sendChatMessage}
                      disabled={chatStatus === 'sending' || !chatMessage.trim()}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {chatStatus === 'sending' ? 'Sending...' : chatStatus === 'sent' ? 'Sent!' : 'Send'}
                    </Button>
                  </div>
                  
                  {chatStatus === 'sent' && (
                    <div className="text-sm text-success">
                      ✓ Message sent successfully
                    </div>
                  )}
                  
                  <div className="text-sm text-muted-foreground">
                    Note: This is a placeholder chat interface. Full chat functionality will be available in a future update.
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};