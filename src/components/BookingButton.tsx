import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import Confetti from 'react-confetti';

const BookingButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    date: '',
    time: '',
    phone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Send booking to backend
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      const result = await response.json();

      // Show success message
      setConfirmationMessage(
        `🎉 Booking request submitted for ${bookingData.date} at ${bookingData.time}! Check your email for details.`
      );
      setIsOpen(false);
      setBookingData({ name: '', email: '', date: '', time: '', phone: '' });
      setShowConfetti(true);

      // Hide confetti and success message after 5 seconds
      setTimeout(() => {
        setShowConfetti(false);
        setConfirmationMessage('');
      }, 5000);
    } catch (error) {
      console.error('Error creating booking:', error);
      setConfirmationMessage('❌ Failed to create booking. Please try again.');
      setTimeout(() => {
        setConfirmationMessage('');
      }, 3000);
    }
  };

  return (
    <>
      {/* Booking Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-amber-800 text-white p-4 rounded-full shadow-lg hover:bg-amber-900 transition-colors z-40"
      >
        <Calendar className="w-6 h-6" />
      </button>

      {/* Confetti Effect */}
      {showConfetti && <Confetti />}

      {/* Success Notification */}
      {confirmationMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-md shadow-lg z-50">
          {confirmationMessage}
        </div>
      )}

      {/* Booking Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-2xl font-serif text-amber-900 mb-4">Book a Store Visit</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Input */}
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

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={bookingData.email}
                  onChange={(e) =>
                    setBookingData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>

              {/* Date Input */}
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

              {/* Time Input */}
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

              {/* Phone Number Input */}
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

              {/* Submit and Cancel Buttons */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-amber-800 text-white px-4 py-2 rounded-md hover:bg-amber-900 transition"
                >
                  Book Appointment
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingButton;
