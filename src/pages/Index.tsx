import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Login } from '@/components/Login';
import { AdminDashboard } from '@/components/AdminDashboard';
import { StudentDashboard } from '@/components/StudentDashboard';

const Index = () => {
  const { user, isAdmin, isStudent } = useAuth();

  if (!user) {
    return <Login />;
  }

  if (isAdmin) {
    return <AdminDashboard />;
  }

  if (isStudent) {
    return <StudentDashboard />;
  }

  return <Login />;
};

export default Index;
