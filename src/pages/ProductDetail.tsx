import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { ArrowLeft, Heart, Share2 } from 'lucide-react';
import Confetti from 'react-confetti';
import { formatPrice, formatPriceString } from '../utils/priceUtils';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products } = useProducts();
  const { addToCart } = useCart();


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    date: '',
    time: '',
    phone: '',
  });

  const product = products.find((p) => p._id === id);
  const recommendations = products
          .filter((p) => p.category === product?.category && p._id !== product?._id)
    .slice(0, 4);

  // Track product view for trending algorithm
  useEffect(() => {
    if (product && id) {
      const trackProductView = async () => {
        try {
          await fetch('http://localhost:5000/api/analytics/track-view', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              productId: id,
              userId: null, // Will be set if user is logged in
              ipAddress: null, // Will be detected by server
              userAgent: null // Will be detected by server
            }),
          });
        } catch (error) {
          console.error('Error tracking product view:', error);
        }
      };
      
      trackProductView();
    }
  }, [product, id]);

  if (!product) {
    return <div>Product not found</div>;
  }

  const handleBookingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Send booking to database
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: bookingData.name,
          email: bookingData.email,
          phone: bookingData.phone,
          date: bookingData.date,
          time: bookingData.time,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      const result = await response.json();
      
      setConfirmationMessage(
        `🎉 Appointment successfully placed for ${bookingData.date} at ${bookingData.time}! Check your email for confirmation.`
      );
      setIsModalOpen(false);
      setBookingData({ name: '', email: '', date: '', time: '', phone: '' });
      setShowConfetti(true);

      // Automatically hide confetti and confirmation message after 5 seconds
      setTimeout(() => {
        setShowConfetti(false);
        setConfirmationMessage('');
      }, 5000);
      
    } catch (error) {
      console.error('Error creating booking:', error);
      setConfirmationMessage('❌ Failed to create booking. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full rounded-lg shadow-lg"
            />
            <div className="absolute top-4 right-4 space-x-2">
              <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                <Heart className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-serif text-gray-900 mb-2">{product.name}</h1>
              <p className="text-2xl text-amber-800">{formatPriceString(product.price)}</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Description</h3>
              <div
                className="text-gray-700 overflow-hidden text-ellipsis"
                style={{
                  maxHeight: '8rem',
                  overflowY: 'auto',
                  wordBreak: 'break-word',
                }}
              >
                {product.description}
              </div>

              <h3 className="text-lg font-semibold text-gray-900">Details</h3>
              <ul className="list-disc pl-5">
                <li>Handcrafted with precision</li>
                <li>Premium quality materials</li>
                <li>Certified authenticity</li>
                <li>Includes luxury gift packaging</li>
              </ul>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => addToCart({
                  id: product._id,
                  name: product.name,
                  price: typeof product.price === 'string' ? Number(product.price.replace(/[^\d.]/g, '')) : product.price,
                  image: product.image,
                  category: product.category
                })}
                className="w-full bg-amber-800 text-white px-6 py-3 rounded-md hover:bg-amber-900 transition"
              >
                Add to Cart
              </button>

              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full border border-amber-800 text-amber-800 px-6 py-3 rounded-md hover:bg-amber-50 transition"
              >
                Book Store Visit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="border-t bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-serif text-gray-900 mb-8">You May Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {recommendations.map((rec) => (
              <div
                key={rec._id}
                className="group cursor-pointer"
                onClick={() => navigate(`/product/${rec._id}`)}
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100 rounded-lg">
                  <img
                    src={rec.image}
                    alt={rec.name}
                    className="object-cover w-full h-full group-hover:scale-110 transition duration-300"
                  />
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">{rec.name}</h3>
                  <p className="text-amber-800">{formatPriceString(rec.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-2xl font-serif text-amber-900 mb-4">Book a Store Visit</h2>
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  value={bookingData.name}
                  onChange={(e) =>
                    setBookingData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={bookingData.email || ''}
                  onChange={(e) =>
                    setBookingData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={bookingData.date}
                  onChange={(e) =>
                    setBookingData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  value={bookingData.time}
                  onChange={(e) =>
                    setBookingData((prev) => ({ ...prev, time: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={bookingData.phone}
                  onChange={(e) =>
                    setBookingData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-amber-800 text-white px-4 py-2 rounded-md hover:bg-amber-900 transition"
                >
                  Book Appointment
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confetti after successful booking */}
      {showConfetti && <Confetti />}

      {/* Success Notification */}
      {confirmationMessage && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg">
          {confirmationMessage}
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
