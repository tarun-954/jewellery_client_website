import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Package, ArrowLeft } from 'lucide-react';

interface OrderSuccessProps {
  orderNumber: string;
  totalAmount: number;
}

const OrderSuccess: React.FC<OrderSuccessProps> = ({ orderNumber, totalAmount }) => {
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white text-center py-12 px-8">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-300" />
            <h1 className="text-3xl font-bold mb-2">🎉 Order Confirmed!</h1>
            <p className="text-lg opacity-90">Thank you for your purchase from Chanchal Ornaments</p>
          </div>

          {/* Animation Section */}
          <div className="text-center py-8 px-8">
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-6 border-2 border-amber-200 mb-6">
              <iframe 
                src="https://lottie.host/embed/3def0741-247a-446e-8fed-097833694abf/tVfN01TYyF.lottie"
                width="300" 
                height="200"
                title="Order Confirmation Animation"
                className="mx-auto rounded-lg shadow-lg"
              />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Your order has been successfully placed!
            </h2>
          </div>

          {/* Order Details */}
          <div className="px-8 pb-8">
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Order Details</h3>
                <Package className="w-6 h-6 text-amber-600" />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-semibold text-gray-800">{orderNumber}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-bold text-xl text-amber-600">{formatPrice(totalAmount)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Confirmed
                  </span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">What's Next?</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  You'll receive a confirmation email with order details
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  We'll process your order and update you on the status
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Track your order in your account dashboard
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  We'll notify you when your order ships
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/my-orders')}
                className="flex-1 bg-amber-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
              >
                View My Orders
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </button>
            </div>

            {/* Contact Info */}
            <div className="text-center mt-8 pt-6 border-t border-gray-200">
              <p className="text-gray-600 mb-2">Need help? Contact us:</p>
              <div className="flex justify-center space-x-6 text-sm text-gray-500">
                <span>📞 +91 9805394341</span>
                <span>📧 admin@tarun.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess; 