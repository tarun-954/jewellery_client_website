import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  email: string;
  name: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    // Mock admin login - in a real app, this would be handled by your backend
    if (email === 'admin@chanchal.com' && password === 'admin123') {
      setUser({ email, name: 'Admin', isAdmin: true });
    } else {
      setUser({ email, name: 'Customer' });
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setUser({ email, name });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};