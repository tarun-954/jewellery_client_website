import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAnalytics } from '../context/AnalyticsContext';
import toast from 'react-hot-toast';
import Confetti from 'react-confetti'; // Add this import
import { formatPrice } from '../utils/priceUtils';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totalItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const { trackSale } = useAnalytics();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'credit-card',
  });
  const [showConfetti, setShowConfetti] = useState(false); // State for confetti

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }
    try {
      // Track sales for each item
      for (const item of items) {
        for (let i = 0; i < item.quantity; i++) {
          await trackSale(
            item.id,
            item.name,
            `₹${item.price}`,
            item.category || 'unknown'
          );
        }
      }

      // Simulate order placement
      toast.success('Order placed successfully!');
      setShowConfetti(true); // Trigger confetti
      
      // Clear cart after successful order
      clearCart();
      
      setTimeout(() => {
        setShowConfetti(false); // Hide confetti after 3 seconds
        navigate('/');
      }, 3000);
    } catch (error) {
      toast.error('Failed to place the order. Please try again.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <dotlottie-player
          src="https://lottie.host/7f829be9-9f88-47f2-8bcf-196d7651b7f5/18cjxaO2m5.lottie"
          background="transparent"
          speed={1}
          style={{ width: '350px', height: '350px' }}
          loop
          autoplay
        ></dotlottie-player>
        <div className="text-center mt-6">
          <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">
            Please add items to your cart before proceeding to checkout.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const calculateTotal = () =>
    items
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toFixed(2);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 lg:px-8">
        {showConfetti && <Confetti recycle={false} numberOfPieces={300} />} {/* Add confetti */}
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Shipping Information */}
          <div className="lg:col-span-2 bg-white rounded shadow p-6">
            <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
              <div className="grid md:grid-cols-3 gap-4">
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  name="zipCode"
                  placeholder="ZIP Code"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="credit-card">Credit Card</option>
                <option value="bank-transfer">Bank Transfer</option>
                <option value="purchase-order">Purchase Order</option>
              </select>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Place Order
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1 ml-4">
                    <h3 className="font-semibold">{item.name}</h3>
                    <div className="text-sm text-gray-600">
                      {formatPrice(item.price)} × {item.quantity}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      -
                    </button>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="px-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4 text-right">
              <h3 className="text-lg font-bold">Total: {formatPrice(Number(calculateTotal()))}</h3>
              <p className="text-sm text-gray-600">{totalItems} item(s)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
