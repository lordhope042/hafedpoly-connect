import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
  regNo?: string;
  department?: string;
  level?: string;
}

export interface Student extends User {
  regNo: string;
  department: string;
  level: string;
  role: 'student';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<Student, 'id'> & { password: string }) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('hafedpoly_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Admin login
    if (email === 'admin@hafedpoly.edu.ng' && password === 'admin123') {
      const adminUser: User = {
        id: 'admin',
        name: 'System Administrator',
        email: 'admin@hafedpoly.edu.ng',
        role: 'admin'
      };
      setUser(adminUser);
      localStorage.setItem('hafedpoly_user', JSON.stringify(adminUser));
      return true;
    }

    // Student login
    const students = JSON.parse(localStorage.getItem('hafedpoly_students') || '[]');
    const student = students.find((s: Student & { password: string }) => 
      s.email === email && s.password === password
    );

    if (student) {
      const { password: _, ...userWithoutPassword } = student;
      setUser(userWithoutPassword);
      localStorage.setItem('hafedpoly_user', JSON.stringify(userWithoutPassword));
      return true;
    }

    return false;
  };

  const register = async (userData: Omit<Student, 'id'> & { password: string }): Promise<boolean> => {
    const students = JSON.parse(localStorage.getItem('hafedpoly_students') || '[]');
    
    // Check if student already exists
    if (students.some((s: Student) => s.email === userData.email || s.regNo === userData.regNo)) {
      return false;
    }

    const newStudent = {
      ...userData,
      id: `student_${Date.now()}`
    };

    students.push(newStudent);
    localStorage.setItem('hafedpoly_students', JSON.stringify(students));
    
    const { password: _, ...userWithoutPassword } = newStudent;
    setUser(userWithoutPassword);
    localStorage.setItem('hafedpoly_user', JSON.stringify(userWithoutPassword));
    
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hafedpoly_user');
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};