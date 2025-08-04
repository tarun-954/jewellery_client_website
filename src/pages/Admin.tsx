import React, { useState, useEffect } from 'react';
import { Plus, Package, Trash2, CheckCircle, BarChart3 } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardAnalytics from '../components/DashboardAnalytics';

interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  category: string;
  description: string;
}

interface Booking {
  name: string;
  date: string;
  time: string;
  phone: string;
  id: string;
  status: 'Pending' | 'Completed';
  image: string;
}

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'analytics' | 'management'>('analytics');

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/');
    }
  }, [user, navigate]);

  const { addProduct, products, deleteProduct } = useProducts();
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    price: '',
    image: '',
    category: 'necklaces',
    description: ''
  });

  // Load bookings from localStorage
  const [bookings, setBookings] = useState<Booking[]>([]);
  useEffect(() => {
    const storedBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const validBookings: Booking[] = storedBookings.map((booking: any) => ({
      ...booking,
      id: booking.id || `${Date.now()}-${Math.random()}`, // Ensure unique IDs if missing
      status: booking.status === 'Completed' ? 'Completed' : 'Pending',
      image: booking.image || '',
    }));
    setBookings(validBookings);
    localStorage.setItem('bookings', JSON.stringify(validBookings)); // Update storage
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct(newProduct);
    setNewProduct({
      name: '',
      price: '',
      image: '',
      category: 'necklaces',
      description: ''
    });
  };

  const handleDeleteBooking = (id: string) => {
    try {
      const updatedBookings = bookings.filter((booking) => booking.id !== id);
      setBookings(updatedBookings);
      localStorage.setItem('bookings', JSON.stringify(updatedBookings)); // Persist remaining bookings
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const handleCompleteBooking = (id: string) => {
    const updatedBookings: Booking[] = bookings.map((booking) =>
      booking.id === id ? { ...booking, status: 'Completed' } : booking
    );
    setBookings(updatedBookings);
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-serif text-amber-900 mb-8">Admin Dashboard</h1>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm mb-8">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition ${
              activeTab === 'analytics'
                ? 'bg-amber-800 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('management')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition ${
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input
                      type="url"
                      value={newProduct.image}
                      onChange={(e) => setNewProduct((prev) => ({ ...prev, image: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                      required
                    />
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
                      <option value="mangalsutra">Mangalsutra</option>
                      <option value="bangles">Bangles</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) => setNewProduct((prev) => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                      rows={4}
                      placeholder="Enter a detailed description of the product..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-amber-800 text-white px-4 py-2 rounded-md hover:bg-amber-900 transition"
                  >
                    Add Product
                  </button>
                </form>
              </div>

              {/* Product Management */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-serif text-gray-900 mb-6 flex items-center">
                  <Package className="w-6 h-6 mr-2" />
                  Manage Products
                </h2>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1 overflow-hidden">
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-gray-500">{product.price}</p>
                        <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                        <p
                          className="text-sm text-gray-500 truncate overflow-hidden text-ellipsis"
                          title={product.description}
                        >
                          {product.description}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bookings Section */}
            <div className="bg-white p-4 rounded-lg shadow-sm mt-10">
              <h2 className="text-2xl font-serif text-gray-900 mb-6 flex items-center">
                <Calendar className="w-6 h-6 mr-2" />
                Booked Appointments
              </h2>

              {/* Header for the booking details */}
              <div className="grid grid-cols-6 gap-5 text-sm ms-3 font-medium text-gray-700 mb-4">
                <div>Name</div>
                {/* <div>Image</div> */}
                <div>Date</div>
                <div>Time</div>
                <div>Phone</div>
                <div>Status</div>
                <div>Options</div>
              </div>

              {/* Bookings List */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {bookings.length === 0 ? (
                  <p className="text-gray-500">No appointments booked yet.</p>
                ) : (
                  bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className={`grid grid-cols-6 gap-4 p-4 border rounded-lg ${
                        booking.status === 'Completed' ? 'bg-green-200' : 'bg-red-200'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div>{booking.name}</div>
                        <img
                          src={booking.image || 'https://cdni.iconscout.com/illustration/premium/thumb/online-hotel-booking-illustration-download-in-svg-png-gif-file-formats--app-reservation-pack-holidays-illustrations-7706271.png'}
                          alt={booking.name}
                          className="w-12 h-12 object-cover rounded-full"
                        />
                      </div>
                      <div>{booking.date}</div>
                      <div>{booking.time}</div>
                      <div>{booking.phone}</div>
                      <div className={`text-sm font-medium ${booking.status === 'Completed' ? 'text-green-700' : 'text-red-700'}`}>
                        {booking.status}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleCompleteBooking(booking.id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <CheckCircle className="w-5 ms-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBooking(booking.id)}
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
      </div>
    </div>
  );
};

export default Admin;
