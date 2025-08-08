import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_URL } from '../config/api';

interface User {
  id: string;
  email: string;
  name: string;
  isAdmin?: boolean;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, profileImage?: string) => Promise<void>;
  logout: () => void;
  loginWithGoogle?: () => Promise<void>; // Placeholder for Google OAuth
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const handleOAuthSuccess = (token: string) => {
  if (!token) return;
  // Decode JWT (simple base64 decode, not verifying signature here)
  const payload = JSON.parse(atob(token.split('.')[1]));
  const user = {
    id: payload.id,
    email: payload.email,
    name: payload.name,
    isAdmin: payload.isAdmin,
    profileImage: payload.profileImage || '',
  };
  localStorage.setItem('userDetails', JSON.stringify(user));
  localStorage.setItem('token', token);
  // Optionally, you can trigger a custom event or use a state management solution to update the UI
};

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
    try {
      console.log('Attempting login for:', email);
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      console.log('Login response status:', res.status);
      console.log('Login response data:', data);
      
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      setUser(data.user);
      localStorage.setItem('userDetails', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      console.log('Login successful, user set:', data.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string, profileImage?: string) => {
    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, profileImage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed');
      // Don't automatically login after signup - let user login manually
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  // Placeholder for Google OAuth
  const loginWithGoogle = async () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userDetails');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loginWithGoogle }}>
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
