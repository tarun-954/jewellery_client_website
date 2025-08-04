import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useAnalytics } from '../context/AnalyticsContext';
import { TrendingUp, Users, ShoppingCart, Calendar, RefreshCw } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const DashboardAnalytics: React.FC = () => {
  const { analyticsData, loading, error, fetchAnalytics } = useAnalytics();
  const [timeRange, setTimeRange] = useState(7);

  const handleTimeRangeChange = (days: number) => {
    setTimeRange(days);
    fetchAnalytics(days);
  };

  const handleRefresh = () => {
    fetchAnalytics(timeRange);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-800"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Error loading analytics: {error}</p>
        </div>
        <div className="flex justify-center">
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-900 transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const combinedUserData = analyticsData.loginData.map(login => {
    const signup = analyticsData.signupData.find(s => s._id === login._id);
    return {
      date: login._id,
      logins: login.count,
      signups: signup ? signup.count : 0
    };
  });

  // Add missing dates for signups
  analyticsData.signupData.forEach(signup => {
    if (!combinedUserData.find(item => item.date === signup._id)) {
      combinedUserData.push({
        date: signup._id,
        logins: 0,
        signups: signup.count
      });
    }
  });

  // Sort by date
  combinedUserData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const salesChartData = analyticsData.salesData.map(sale => ({
    date: sale._id,
    sales: sale.count,
    revenue: sale.totalRevenue
  }));

  // Create separate line data for individual metrics
  const loginTrendData = analyticsData.loginData.map(login => ({
    date: login._id,
    count: login.count
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const signupTrendData = analyticsData.signupData.map(signup => ({
    date: signup._id,
    count: signup.count
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const salesTrendData = analyticsData.salesData.map(sale => ({
    date: sale._id,
    count: sale.count
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const revenueTrendData = analyticsData.salesData.map(sale => ({
    date: sale._id,
    revenue: sale.totalRevenue
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const categoryData = analyticsData.categorySales.map((category, index) => ({
    name: category._id.charAt(0).toUpperCase() + category._id.slice(1),
    value: category.count,
    color: COLORS[index % COLORS.length]
  }));

  // Calculate totals
  const totalLogins = analyticsData.loginData.reduce((sum, item) => sum + item.count, 0);
  const totalSignups = analyticsData.signupData.reduce((sum, item) => sum + item.count, 0);
  const totalSales = analyticsData.salesData.reduce((sum, item) => sum + item.count, 0);
  const totalRevenue = analyticsData.salesData.reduce((sum, item) => sum + item.totalRevenue, 0);

  return (
    <div className="space-y-6">
      {/* Time Range Selector and Refresh Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif text-gray-900">Analytics Dashboard</h2>
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                onClick={() => handleTimeRangeChange(days)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                  timeRange === days
                    ? 'bg-amber-800 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {days} days
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm font-medium transition ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Logins</p>
              <p className="text-2xl font-bold text-gray-900">{totalLogins}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Signups</p>
              <p className="text-2xl font-bold text-gray-900">{totalSignups}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">{totalSales}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-amber-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Line Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity Combined Line Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Activity Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={combinedUserData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="logins"
                stroke="#3B82F6"
                strokeWidth={3}
                name="Logins"
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="signups"
                stroke="#10B981"
                strokeWidth={3}
                name="Signups"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sales & Revenue Combined Line Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sales & Revenue Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="sales"
                stroke="#8B5CF6"
                strokeWidth={3}
                name="Sales Count"
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="#F59E0B"
                strokeWidth={3}
                name="Revenue (₹)"
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Individual Login Trend */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Login Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={loginTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Individual Signup Trend */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Signup Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={signupTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sales Trend */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#8B5CF6"
                strokeWidth={3}
                name="Sales"
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trend */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#F59E0B"
                strokeWidth={3}
                name="Revenue (₹)"
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Sales Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sales by Category</h3>
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardAnalytics; 