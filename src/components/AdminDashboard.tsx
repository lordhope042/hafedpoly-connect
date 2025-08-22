import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAuth, Student } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  MessageSquare, 
  Megaphone, 
  Search, 
  Eye, 
  EyeOff, 
  Trash2, 
  Edit,
  LogIn,
  Plus,
  CheckCircle,
  Clock
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

export const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<(Student & { password: string })[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [searchId, setSearchId] = useState('');
  const [foundStudent, setFoundStudent] = useState<Student | null>(null);
  const [complaintFilter, setComplaintFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    const studentsData = JSON.parse(localStorage.getItem('hafedpoly_students') || '[]');
    const complaintsData = JSON.parse(localStorage.getItem('hafedpoly_complaints') || '[]');
    const announcementsData = JSON.parse(localStorage.getItem('hafedpoly_announcements') || '[]');
    
    setStudents(studentsData);
    setComplaints(complaintsData);
    setAnnouncements(announcementsData);
  };

  const togglePasswordVisibility = (studentId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const deleteStudent = (studentId: string) => {
    const updatedStudents = students.filter(s => s.id !== studentId);
    setStudents(updatedStudents);
    localStorage.setItem('hafedpoly_students', JSON.stringify(updatedStudents));
    
    toast({
      title: "Student Deleted",
      description: "Student has been successfully removed"
    });
  };

  const impersonateStudent = (student: Student) => {
    const userWithoutPassword = { ...student };
    delete (userWithoutPassword as any).password;
    
    localStorage.setItem('hafedpoly_user', JSON.stringify(userWithoutPassword));
    window.location.reload();
  };

  const toggleComplaintStatus = (complaintId: string) => {
    const updatedComplaints = complaints.map(c => 
      c.id === complaintId 
        ? { ...c, status: c.status === 'pending' ? 'resolved' as const : 'pending' as const }
        : c
    );
    setComplaints(updatedComplaints);
    localStorage.setItem('hafedpoly_complaints', JSON.stringify(updatedComplaints));
    
    toast({
      title: "Complaint Updated",
      description: "Complaint status has been changed"
    });
  };

  const deleteComplaint = (complaintId: string) => {
    const updatedComplaints = complaints.filter(c => c.id !== complaintId);
    setComplaints(updatedComplaints);
    localStorage.setItem('hafedpoly_complaints', JSON.stringify(updatedComplaints));
    
    toast({
      title: "Complaint Deleted",
      description: "Complaint has been removed"
    });
  };

  const searchStudent = () => {
    const student = students.find(s => s.id === searchId || s.regNo === searchId);
    setFoundStudent(student || null);
    
    if (!student) {
      toast({
        title: "Student Not Found",
        description: "No student found with that ID or Registration Number",
        variant: "destructive"
      });
    }
  };

  const createAnnouncement = () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both title and content",
        variant: "destructive"
      });
      return;
    }

    const announcement: Announcement = {
      id: `ann_${Date.now()}`,
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      createdAt: new Date().toISOString()
    };

    const updatedAnnouncements = [announcement, ...announcements];
    setAnnouncements(updatedAnnouncements);
    localStorage.setItem('hafedpoly_announcements', JSON.stringify(updatedAnnouncements));
    
    setNewAnnouncement({ title: '', content: '' });
    
    toast({
      title: "Announcement Created",
      description: "New announcement has been posted"
    });
  };

  const deleteAnnouncement = (announcementId: string) => {
    const updatedAnnouncements = announcements.filter(a => a.id !== announcementId);
    setAnnouncements(updatedAnnouncements);
    localStorage.setItem('hafedpoly_announcements', JSON.stringify(updatedAnnouncements));
    
    toast({
      title: "Announcement Deleted",
      description: "Announcement has been removed"
    });
  };

  const filteredComplaints = complaints.filter(complaint => 
    complaintFilter === 'all' ? true : complaint.status === complaintFilter
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-primary shadow-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">Admin Dashboard</h1>
              <p className="text-primary-foreground/80">HAFEDPOLY Portal Management</p>
            </div>
            <Button onClick={logout} variant="secondary">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="complaints" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Complaints
            </TabsTrigger>
            <TabsTrigger value="announcements" className="flex items-center gap-2">
              <Megaphone className="w-4 h-4" />
              Announcements
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Student Search
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Manage Students ({students.length})
                </CardTitle>
                <CardDescription>
                  View and manage all registered students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students.map((student) => (
                    <div key={student.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="font-semibold">{student.name}</h3>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                          <p className="text-sm"><strong>Reg No:</strong> {student.regNo}</p>
                          <p className="text-sm"><strong>Department:</strong> {student.department}</p>
                          <p className="text-sm"><strong>Level:</strong> {student.level}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm"><strong>Password:</strong></span>
                            <span className="text-sm font-mono">
                              {showPasswords[student.id] ? student.password : '••••••••'}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => togglePasswordVisibility(student.id)}
                            >
                              {showPasswords[student.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => impersonateStudent(student)}
                          >
                            <LogIn className="w-4 h-4 mr-1" />
                            Login As
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteStudent(student.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {students.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No students registered yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="complaints">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Manage Complaints ({complaints.length})
                </CardTitle>
                <CardDescription>
                  Review and manage student complaints
                </CardDescription>
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant={complaintFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => setComplaintFilter('all')}
                  >
                    All ({complaints.length})
                  </Button>
                  <Button
                    size="sm"
                    variant={complaintFilter === 'pending' ? 'default' : 'outline'}
                    onClick={() => setComplaintFilter('pending')}
                  >
                    Pending ({complaints.filter(c => c.status === 'pending').length})
                  </Button>
                  <Button
                    size="sm"
                    variant={complaintFilter === 'resolved' ? 'default' : 'outline'}
                    onClick={() => setComplaintFilter('resolved')}
                  >
                    Resolved ({complaints.filter(c => c.status === 'resolved').length})
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredComplaints.map((complaint) => (
                    <div key={complaint.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{complaint.studentName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {complaint.type} • {new Date(complaint.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={complaint.status === 'pending' ? 'destructive' : 'default'}>
                            {complaint.status === 'pending' ? (
                              <Clock className="w-3 h-3 mr-1" />
                            ) : (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            )}
                            {complaint.status}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleComplaintStatus(complaint.id)}
                          >
                            Mark {complaint.status === 'pending' ? 'Resolved' : 'Pending'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteComplaint(complaint.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm">{complaint.message}</p>
                    </div>
                  ))}
                  {filteredComplaints.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No complaints found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announcements">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Create New Announcement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ann-title">Title</Label>
                    <Input
                      id="ann-title"
                      placeholder="Announcement title"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ann-content">Content</Label>
                    <Textarea
                      id="ann-content"
                      placeholder="Announcement content"
                      rows={4}
                      value={newAnnouncement.content}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                    />
                  </div>
                  <Button onClick={createAnnouncement}>
                    <Plus className="w-4 h-4 mr-2" />
                    Post Announcement
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="w-5 h-5" />
                    All Announcements ({announcements.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <div key={announcement.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{announcement.title}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {new Date(announcement.createdAt).toLocaleDateString()}
                            </span>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteAnnouncement(announcement.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{announcement.content}</p>
                      </div>
                    ))}
                    {announcements.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No announcements posted yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="search">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Student ID Search
                </CardTitle>
                <CardDescription>
                  Search for a student by their unique ID or registration number
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter Student ID or Registration Number"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                  />
                  <Button onClick={searchStudent}>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
                
                {foundStudent && (
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <h3 className="font-semibold text-lg mb-3">Student Found</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p><strong>Name:</strong> {foundStudent.name}</p>
                        <p><strong>Email:</strong> {foundStudent.email}</p>
                        <p><strong>Student ID:</strong> {foundStudent.id}</p>
                      </div>
                      <div>
                        <p><strong>Reg Number:</strong> {foundStudent.regNo}</p>
                        <p><strong>Department:</strong> {foundStudent.department}</p>
                        <p><strong>Level:</strong> {foundStudent.level}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};