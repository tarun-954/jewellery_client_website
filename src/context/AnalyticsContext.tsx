import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AnalyticsData {
  loginData: Array<{ _id: string; count: number }>;
  signupData: Array<{ _id: string; count: number }>;
  salesData: Array<{ _id: string; count: number; totalRevenue: number }>;
  categorySales: Array<{ _id: string; count: number }>;
}

interface AnalyticsContextType {
  analyticsData: AnalyticsData;
  loading: boolean;
  error: string | null;
  fetchAnalytics: (days?: number) => Promise<void>;
  trackSale: (productId: number, productName: string, price: string, category: string) => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    loginData: [],
    signupData: [],
    salesData: [],
    categorySales: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = 'http://localhost:5000/api';

  const fetchAnalytics = async (days: number = 7) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching analytics data...');
      
      // Fetch login/signup analytics
      const loginSignupResponse = await fetch(`${API_URL}/analytics/login-signup?days=${days}`);
      console.log('Login/signup response status:', loginSignupResponse.status);
      
      if (!loginSignupResponse.ok) {
        throw new Error(`Login/signup API error: ${loginSignupResponse.status} ${loginSignupResponse.statusText}`);
      }
      
      const loginSignupData = await loginSignupResponse.json();
      console.log('Login/signup data:', loginSignupData);

      // Fetch sales analytics
      const salesResponse = await fetch(`${API_URL}/analytics/sales?days=${days}`);
      console.log('Sales response status:', salesResponse.status);
      
      if (!salesResponse.ok) {
        throw new Error(`Sales API error: ${salesResponse.status} ${salesResponse.statusText}`);
      }
      
      const salesData = await salesResponse.json();
      console.log('Sales data:', salesData);

      setAnalyticsData({
        loginData: loginSignupData.loginData || [],
        signupData: loginSignupData.signupData || [],
        salesData: salesData.salesData || [],
        categorySales: salesData.categorySales || []
      });
      
      console.log('Analytics data updated successfully');
    } catch (err) {
      console.error('Error fetching analytics:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const trackSale = async (productId: number, productName: string, price: string, category: string) => {
    try {
      const response = await fetch(`${API_URL}/analytics/track-sale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, productName, price, category })
      });

      if (!response.ok) {
        throw new Error('Failed to track sale');
      }
    } catch (err) {
      console.error('Error tracking sale:', err);
    }
  };

  // Fetch analytics on mount
  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <AnalyticsContext.Provider value={{ analyticsData, loading, error, fetchAnalytics, trackSale }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}; 