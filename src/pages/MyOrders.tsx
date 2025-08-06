import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { formatPrice } from '../utils/priceUtils';
import { Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const MyOrders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { orders, loading, error, fetchUserOrders } = useOrders();

  useEffect(() => {
    console.log('MyOrders useEffect - user:', user);
    if (!user) {
      navigate('/login');
      return;
    }
    // Fetch orders when component mounts
    console.log('Calling fetchUserOrders for user:', user.id);
    fetchUserOrders();
  }, [user, navigate]); // Remove fetchUserOrders from dependencies to prevent infinite loop

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'Processing':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'Shipped':
        return <Truck className="w-5 h-5 text-purple-600" />;
      case 'Delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Separate orders into active and previous
  const activeOrders = orders.filter(order => order.status !== 'Delivered' && order.status !== 'Cancelled');
  const previousOrders = orders.filter(order => order.status === 'Delivered' || order.status === 'Cancelled');

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <button
              onClick={fetchUserOrders}
              disabled={loading}
              className="px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Refreshing...' : 'Refresh Orders'}
            </button>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-800"></div>
              <span className="ml-3 text-gray-600">Loading your orders...</span>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">No Orders Yet</h2>
              <p className="text-gray-500 mb-6">
                You haven't placed any orders yet. Start shopping to see your order history here.
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-amber-800 text-white rounded hover:bg-amber-900 transition-colors"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Active Orders Section */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-6 h-6 mr-2 text-blue-600" />
                  Active Orders ({activeOrders.length})
                </h2>
                {activeOrders.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-lg border">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No active orders at the moment.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {activeOrders.map((order) => (
                      <div key={order._id} className="bg-white rounded-lg shadow-sm border">
                        {/* Order Header */}
                        <div className="p-6 border-b border-gray-200">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(order.status)}
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">Order #{order.orderNumber}</h3>
                                <p className="text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>
                              </div>
                            </div>
                            <div className="mt-4 sm:mt-0 text-right">
                              <p className="text-lg font-bold text-gray-900">
                                Total: {formatPrice(order.totalAmount)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {order.items.reduce((sum, item) => sum + item.quantity, 0)} item(s)
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="p-6">
                          <h4 className="font-semibold text-gray-900 mb-4">Order Items</h4>
                          <div className="space-y-4">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex items-center space-x-4">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900">{item.name}</h5>
                                  <p className="text-sm text-gray-500">
                                    Quantity: {item.quantity} × {formatPrice(item.price)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-gray-900">
                                    {formatPrice(item.price * item.quantity)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Shipping Information */}
                        <div className="p-6 bg-gray-50 border-t border-gray-200">
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Shipping Address</h4>
                              <div className="text-sm text-gray-600">
                                <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                                <p>{order.shippingAddress.address}</p>
                                <p>
                                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                                </p>
                                <p>Phone: {order.shippingAddress.phone}</p>
                                <p>Email: {order.shippingAddress.email}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Order Details</h4>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p>Payment Method: {order.paymentMethod}</p>
                                {order.trackingNumber && (
                                  <p>Tracking Number: {order.trackingNumber}</p>
                                )}
                                <p>Order Date: {formatDate(order.createdAt)}</p>
                                {order.updatedAt !== order.createdAt && (
                                  <p>Last Updated: {formatDate(order.updatedAt)}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Previous Orders Section */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                  Previous Orders ({previousOrders.length})
                </h2>
                {previousOrders.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-lg border">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No previous orders yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {previousOrders.map((order) => (
                      <div key={order._id} className="bg-white rounded-lg shadow-sm border">
                        {/* Order Header */}
                        <div className="p-6 border-b border-gray-200">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(order.status)}
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">Order #{order.orderNumber}</h3>
                                <p className="text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>
                              </div>
                            </div>
                            <div className="mt-4 sm:mt-0 text-right">
                              <p className="text-lg font-bold text-gray-900">
                                Total: {formatPrice(order.totalAmount)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {order.items.reduce((sum, item) => sum + item.quantity, 0)} item(s)
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="p-6">
                          <h4 className="font-semibold text-gray-900 mb-4">Order Items</h4>
                          <div className="space-y-4">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex items-center space-x-4">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900">{item.name}</h5>
                                  <p className="text-sm text-gray-500">
                                    Quantity: {item.quantity} × {formatPrice(item.price)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-gray-900">
                                    {formatPrice(item.price * item.quantity)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Shipping Information */}
                        <div className="p-6 bg-gray-50 border-t border-gray-200">
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Shipping Address</h4>
                              <div className="text-sm text-gray-600">
                                <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                                <p>{order.shippingAddress.address}</p>
                                <p>
                                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                                </p>
                                <p>Phone: {order.shippingAddress.phone}</p>
                                <p>Email: {order.shippingAddress.email}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Order Details</h4>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p>Payment Method: {order.paymentMethod}</p>
                                {order.trackingNumber && (
                                  <p>Tracking Number: {order.trackingNumber}</p>
                                )}
                                <p>Order Date: {formatDate(order.createdAt)}</p>
                                {order.updatedAt !== order.createdAt && (
                                  <p>Last Updated: {formatDate(order.updatedAt)}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders; 