import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

  // Load user details from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('userDetails');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Mock admin login - in a real app, this would be handled by your backend
    let loggedInUser;
    if (email === 'admin@chanchal.com' && password === 'admin123') {
      loggedInUser = { email, name: 'Admin', isAdmin: true };
    } else {
      loggedInUser = { email, name: 'Customer' };
    }
    setUser(loggedInUser);
    localStorage.setItem('userDetails', JSON.stringify(loggedInUser));
  };

  const signup = async (email: string, password: string, name: string) => {
    const newUser = { email, name };
    setUser(newUser);
    localStorage.setItem('userDetails', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userDetails');
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
