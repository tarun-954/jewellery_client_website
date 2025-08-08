import React, { useState, useEffect, useRef } from 'react';
import { Plus, Package, Trash2, CheckCircle, BarChart3, RefreshCw, Truck, Clock, XCircle, Camera, X } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useNavigate } from 'react-router-dom';
import DashboardAnalytics from '../components/DashboardAnalytics';
import toast from 'react-hot-toast';
import { formatPrice, formatPriceString } from '../utils/priceUtils';

interface Product {
  _id: string;
  name: string;
  price: string;
  image: string;
  category: string;
  description: string;
  material?: string;
  inStock?: boolean;
}

interface Booking {
  _id: string;
  name: string;
  date: string;
  time: string;
  phone: string;
  email: string;
  status: 'Pending' | 'Completed';
  createdAt: string;
  profileImage?: string; // Added profileImage to Booking interface
}

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'analytics' | 'management' | 'orders'>('analytics');

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/');
    } else {
      // Auto-refresh bookings when admin logs in
      fetchBookings();
      // Fetch orders for admin
      fetchAllOrders();
    }
  }, [user, navigate]);

  const { addProduct, products, deleteProduct, loading: productsLoading, error: productsError } = useProducts();
  const { orders, updateOrderStatus, fetchAllOrders, loading: ordersLoading } = useOrders();
  const [newProduct, setNewProduct] = useState<Omit<Product, '_id'>>({
    name: '',
    price: '',
    image: '',
    category: 'necklaces',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [orderUpdates, setOrderUpdates] = useState<{ [key: string]: { status: string; trackingNumber: string } }>({});

  // Camera functionality
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load bookings from database
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  
  const fetchBookings = async (showSuccessMessage = false) => {
    setBookingsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/bookings`);
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const data = await response.json();
      setBookings(data);
      if (showSuccessMessage) {
        toast.success('Bookings refreshed successfully!');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleRefreshBookings = () => {
    fetchBookings(true);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addProduct(newProduct);
      setNewProduct({
        name: '',
        price: '',
        image: '',
        category: 'necklaces',
        description: ''
      });
      toast.success('Product added successfully!');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        toast.success('Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/bookings/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setBookings(bookings.filter(booking => booking._id !== id));
          toast.success('Booking deleted successfully!');
        } else {
          throw new Error('Failed to delete booking');
        }
      } catch (error) {
        console.error('Error deleting booking:', error);
        toast.error('Failed to delete booking');
      }
    }
  };

  const handleCompleteBooking = async (id: string) => {
    try {
              const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/bookings/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Completed' }),
      });
      if (response.ok) {
        setBookings(bookings.map(booking => 
          booking._id === id ? { ...booking, status: 'Completed' } : booking
        ));
        toast.success('Booking marked as completed!');
      } else {
        throw new Error('Failed to update booking');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking');
    }
  };

  // Camera functions
  const startCamera = async () => {
    try {
      // Reset states
      setCameraReady(false);
      setShowCamera(true);
      
      // Try simpler video constraints first
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true
      });
      
      setCameraStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Simple approach: just play the video
        videoRef.current.play().then(() => {
          console.log('Video playing successfully');
          // Give it a moment to start playing
          setTimeout(() => {
            setCameraReady(true);
          }, 1000);
        }).catch(e => {
          console.error('Play error:', e);
          toast.error('Camera playback error. Please try again.');
        });
        
        videoRef.current.onerror = (e) => {
          console.error('Video error:', e);
          toast.error('Camera video error. Please try again.');
          stopCamera();
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Unable to access camera. Please check permissions and try again.');
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
    setCameraReady(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context && video.videoWidth > 0 && video.videoHeight > 0) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setNewProduct((prev) => ({ ...prev, image: imageData }));
        
        // Stop camera after capturing
        stopCamera();
        toast.success('Photo captured successfully!');
      } else {
        toast.error('Camera not ready. Please wait a moment and try again.');
      }
    } else {
      toast.error('Camera elements not found. Please refresh and try again.');
    }
  };

  if (!user || !user.isAdmin) {
    return null;
  }

  // Separate orders into active and delivered
  const activeOrders = orders.filter(order => order.status !== 'Delivered' && order.status !== 'Cancelled');
  const deliveredOrders = orders.filter(order => order.status === 'Delivered' || order.status === 'Cancelled');

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-serif text-gray-900 mb-8">Admin Dashboard</h1>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm mb-8">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-amber-800 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'orders'
                  ? 'bg-amber-800 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Truck className="w-5 h-5" />
              <span>Orders</span>
            </button>
            <button
              onClick={() => setActiveTab('management')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'management'
                  ? 'bg-amber-800 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Package className="w-5 h-5" />
              <span>Management</span>
            </button>
          </div>

        {activeTab === 'analytics' ? (
          <DashboardAnalytics />
        ) : activeTab === 'orders' ? (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif text-gray-900 flex items-center">
                <Truck className="w-6 h-6 mr-2" />
                Order Management
              </h2>
              <button
                onClick={() => {
                  fetchAllOrders();
                  toast.success('Orders refreshed successfully!');
                }}
                disabled={ordersLoading}
                className="px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${ordersLoading ? 'animate-spin' : ''}`} />
                <span>{ordersLoading ? 'Refreshing...' : 'Refresh Orders'}</span>
              </button>
            </div>
            
            {orders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No orders found.</p>
            ) : (
              <div className="space-y-8">
                {/* Active Orders Section */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-blue-600" />
                    Active Orders ({activeOrders.length})
                  </h3>
                  {activeOrders.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No active orders at the moment.</p>
                  ) : (
                    <div className="space-y-6">
                      {activeOrders.map((order) => (
                        <div key={order._id} className="border rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">Order #{order.orderNumber}</h3>
                              <p className="text-sm text-gray-600">
                                Customer: {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                              </p>
                              <p className="text-sm text-gray-600">Email: {order.shippingAddress.email}</p>
                              <p className="text-sm text-gray-600">
                                Date: {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">{formatPrice(order.totalAmount)}</p>
                              <span className={`px-2 py-1 rounded text-sm font-medium ${
                                order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                                order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Order Items:</h4>
                            <div className="space-y-2">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex items-center space-x-4">
                                  <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                                  <div className="flex-1">
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-gray-600">
                                      Qty: {item.quantity} × {formatPrice(item.price)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Shipping Address:</h4>
                            <p className="text-sm text-gray-600">
                              {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                            </p>
                            <p className="text-sm text-gray-600">Phone: {order.shippingAddress.phone}</p>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
                              <select
                                value={orderUpdates[order._id]?.status || order.status}
                                onChange={(e) => {
                                  const newStatus = e.target.value;
                                  setOrderUpdates(prev => ({
                                    ...prev,
                                    [order._id]: {
                                      ...prev[order._id],
                                      status: newStatus
                                    }
                                  }));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>
                            
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                              <input
                                type="text"
                                placeholder="Enter tracking number"
                                value={orderUpdates[order._id]?.trackingNumber || order.trackingNumber || ''}
                                onChange={(e) => {
                                  const newTrackingNumber = e.target.value;
                                  setOrderUpdates(prev => ({
                                    ...prev,
                                    [order._id]: {
                                      ...prev[order._id],
                                      trackingNumber: newTrackingNumber
                                    }
                                  }));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                              />
                            </div>
                            
                            <div className="flex items-end">
                              <button
                                onClick={() => {
                                  const updatedStatus = orderUpdates[order._id]?.status || order.status;
                                  const updatedTrackingNumber = orderUpdates[order._id]?.trackingNumber || order.trackingNumber;
                                  updateOrderStatus(order._id, updatedStatus, updatedTrackingNumber);
                                  // Clear the updates for this order
                                  setOrderUpdates(prev => {
                                    const newUpdates = { ...prev };
                                    delete newUpdates[order._id];
                                    return newUpdates;
                                  });
                                  toast.success('Order status updated successfully!');
                                }}
                                className="px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-900 transition-colors"
                              >
                                Update Status
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Delivered Orders Section */}
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                    Delivered Orders ({deliveredOrders.length})
                  </h3>
                  {deliveredOrders.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No delivered orders yet.</p>
                  ) : (
                    <div className="space-y-6">
                      {deliveredOrders.map((order) => (
                        <div key={order._id} className="border rounded-lg p-6 bg-gray-50">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">Order #{order.orderNumber}</h3>
                              <p className="text-sm text-gray-600">
                                Customer: {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                              </p>
                              <p className="text-sm text-gray-600">Email: {order.shippingAddress.email}</p>
                              <p className="text-sm text-gray-600">
                                Date: {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">{formatPrice(order.totalAmount)}</p>
                              <span className={`px-2 py-1 rounded text-sm font-medium ${
                                order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Order Items:</h4>
                            <div className="space-y-2">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex items-center space-x-4">
                                  <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                                  <div className="flex-1">
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-gray-600">
                                      Qty: {item.quantity} × {formatPrice(item.price)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Shipping Address:</h4>
                            <p className="text-sm text-gray-600">
                              {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                            </p>
                            <p className="text-sm text-gray-600">Phone: {order.shippingAddress.phone}</p>
                          </div>
                          
                          {order.trackingNumber && (
                            <div className="mb-4">
                              <h4 className="font-medium mb-2">Tracking Information:</h4>
                              <p className="text-sm text-gray-600">Tracking Number: {order.trackingNumber}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Add Product Form */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-serif text-gray-900 mb-6 flex items-center">
                  <Plus className="w-6 h-6 mr-2" />
                  Add New Product
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input
                      type="text"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct((prev) => ({ ...prev, price: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                      placeholder="₹999"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                    <div className="space-y-3">
                      {/* Image URL Input */}
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Image URL</label>
                        <input
                          type="url"
                          value={newProduct.image}
                          onChange={(e) => setNewProduct((prev) => ({ ...prev, image: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      
                      {/* File Upload */}
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Or Upload Image</label>
                        <div className="flex gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const result = event.target?.result as string;
                                  setNewProduct((prev) => ({ ...prev, image: result }));
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                          />
                          <button
                            type="button"
                            onClick={startCamera}
                            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors flex items-center gap-2"
                          >
                            <Camera className="w-4 h-4" />
                            Camera
                          </button>
                        </div>
                      </div>
                      
                      {/* Image Preview */}
                      {newProduct.image && (
                        <div className="mt-2">
                          <label className="block text-xs text-gray-600 mb-1">Preview</label>
                          <div className="w-32 h-32 border border-gray-300 rounded-lg overflow-hidden">
                            <img
                              src={newProduct.image}
                              alt="Product preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02NCAzMkM3NC4wNTg5IDMyIDgyIDM5Ljk0MTEgODIgNTBDODIgNjAuMDU4OSA3NC4wNTg5IDY4IDY0IDY4QzUzLjk0MTEgNjggNDYgNjAuMDU4OSA0NiA1MEM0NiAzOS45NDExIDUzLjk0MTEgMzIgNjQgMzJaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0xMTIgMTE2Vjg4QzExMiA4My41ODE3IDEwOC40MTggODAgMTA0IDgwSDI0QzE5LjU4MTcgODAgMTYgODMuNTgxNyAxNiA4OFYxMTZIMTI4WiIgZmlsbD0iIzlCOUJBMCIvPgo8L3N2Zz4K';
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct((prev) => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                    >
                      <option value="necklaces">Necklaces</option>
                      <option value="rings">Rings</option>
                      <option value="earrings">Earrings</option>
                      <option value="bracelets">Bracelets</option>
                      <option value="wedding">Wedding Collection</option>
                      <option value="luxury">Luxury Collection</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) => setNewProduct((prev) => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                      rows={3}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Adding Product...' : 'Add Product'}
                  </button>
                </form>
              </div>

              {/* Product Management */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-serif text-gray-900 mb-6 flex items-center">
                  <Package className="w-6 h-6 mr-2" />
                  Product Management
                </h2>
                {productsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-800"></div>
                    <span className="ml-3 text-gray-600">Loading products...</span>
                  </div>
                ) : productsError ? (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {productsError}
                  </div>
                ) : products.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No products found.</p>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {products.map((product) => (
                      <div key={product._id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                        <div className="flex-1">
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-sm text-gray-600">{product.category}</p>
                          <p className="text-sm font-medium">
                            {formatPriceString(product.price)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bookings Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm mt-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif text-gray-900 flex items-center">
                  <Calendar className="w-6 h-6 mr-2" />
                  Booked Appointments
                </h2>
                <button
                  onClick={handleRefreshBookings}
                  disabled={bookingsLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${bookingsLoading ? 'animate-spin' : ''}`} />
                  <span>{bookingsLoading ? 'Refreshing...' : 'Refresh'}</span>
                </button>
              </div>

              {/* Header for the booking details */}
              <div className="grid grid-cols-6 gap-5 text-sm ms-3 font-medium text-gray-700 mb-4">
                <div>Name</div>
                <div>Date</div>
                <div>Time</div>
                <div>Phone</div>
                <div>Status</div>
                <div>Options</div>
              </div>

              {/* Bookings List */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {bookingsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-800"></div>
                    <span className="ml-3 text-gray-600">Loading bookings...</span>
                  </div>
                ) : bookings.length === 0 ? (
                  <p className="text-gray-500">No appointments booked yet.</p>
                ) : (
                  bookings.map((booking) => (
                    <div
                      key={booking._id}
                      className={`grid grid-cols-6 gap-4 p-4 border rounded-lg ${
                        booking.status === 'Completed' ? 'bg-green-200' : 'bg-red-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {booking.profileImage ? (
                          <img
                            src={booking.profileImage}
                            alt="Profile"
                            className="h-10 w-10 rounded-full object-cover border border-gray-300 shadow-sm"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold text-lg">
                            {booking.name ? booking.name[0].toUpperCase() : '?'}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-900">{booking.name}</div>
                          <div className="text-xs text-gray-500">{booking.email}</div>
                        </div>
                      </div>
                      <div>{booking.date}</div>
                      <div>{booking.time}</div>
                      <div>{booking.phone}</div>
                      <div className={`text-sm font-medium ${booking.status === 'Completed' ? 'text-green-700' : 'text-red-700'}`}>
                        {booking.status}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleCompleteBooking(booking._id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <CheckCircle className="w-5 ms-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBooking(booking._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* Camera Modal */}
        {showCamera && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Take Photo</h3>
                <button
                  onClick={stopCamera}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 bg-gray-900 rounded-lg"
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                {!cameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 rounded-lg">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p>Initializing camera...</p>
                      <button
                        onClick={startCamera}
                        className="mt-2 px-3 py-1 bg-amber-600 text-white rounded text-sm hover:bg-amber-700"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-center mt-4 space-x-4">
                <button
                  onClick={capturePhoto}
                  disabled={!cameraReady}
                  className={`px-6 py-2 rounded-md transition-colors flex items-center gap-2 ${
                    cameraReady 
                      ? 'bg-amber-600 text-white hover:bg-amber-700' 
                      : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  {cameraReady ? 'Capture Photo' : 'Camera Loading...'}
                </button>
                <button
                  onClick={stopCamera}
                  className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
