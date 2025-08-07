import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, TrendingUp, Gift, Truck, Clock, Search, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatPriceString } from '../utils/priceUtils';

interface Product {
  _id: string;
  name: string;
  price: string;
  image: string;
  category: string;
  description: string;
  orderCount?: number;
  totalQuantity?: number;
  totalRevenue?: number;
  recentOrders?: number;
  totalViews?: number;
  recentViews?: number;
  uniqueViewers?: number;
  lastOrderDate?: string | null;
  trendingScore?: number;
  isTrending?: boolean;
}

const MostOrderedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  console.log('MostOrderedProducts component rendered');

  useEffect(() => {
    fetchMostOrderedProducts();
  }, []);

  const fetchMostOrderedProducts = async () => {
    try {
      console.log('Fetching most ordered products...');
      const response = await fetch('http://localhost:5000/api/products/most-ordered');
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Most ordered products data:', data);
        console.log('Algorithm used:', data.algorithm);
        console.log('Total products analyzed:', data.totalProductsAnalyzed);
        setProducts(data.products || []);
      } else {
        console.error('Response not ok:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching most ordered products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Track product view when user clicks on a product
  const trackProductView = async (productId: string) => {
    try {
      await fetch('http://localhost:5000/api/analytics/track-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          userId: null, // Will be set if user is logged in
          ipAddress: null, // Will be detected by server
          userAgent: null // Will be detected by server
        }),
      });
    } catch (error) {
      console.error('Error tracking product view:', error);
    }
  };

  if (loading) {
    return (
      <div className="py-20" style={{ backgroundColor: '#101010' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto"></div>
            <p className="mt-4 text-gray-300">Loading most popular products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-20" style={{ backgroundColor: '#101010' }}>
        <div className="max-w-7xl mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Sparkles className="w-8 h-8 text-amber-400" />
                <h2 className="text-4xl font-serif text-white">Most Popular Products</h2>
                <Sparkles className="w-8 h-8 text-amber-400" />
              </div>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Discover our best-selling jewelry pieces that customers love the most
              </p>
            </motion.div>
          </div>

          {/* No Products Message */}
          <div className="text-center mb-12">
            <p className="text-gray-300">Loading popular products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20" style={{ backgroundColor: '#101010' }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-amber-400" />
              <h2 className="text-4xl font-serif text-white">Most Popular Products</h2>
              <Sparkles className="w-8 h-8 text-amber-400" />
            </div>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Discover our best-selling jewelry pieces that customers love the most
            </p>
          </motion.div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-0 gap-0 mb-12">
          {products.slice(0, 16).map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ 
                duration: 0.9, 
                delay: index * 0.2,
                ease: "easeOut"
              }}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.4 }
              }}
              className="group"
            >
              <Link to={`/product/${product._id}`} onClick={() => trackProductView(product._id)}>
                <div className="bg-gray-800 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-700 hover:border-amber-400">
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                                         {/* Trending Badge */}
                     {product.isTrending && (
                       <motion.div 
                         className="absolute top-1 left-1 bg-red-600 text-white px-1 py-0.5 rounded-full text-xs font-semibold flex items-center gap-0.5"
                         animate={{ 
                           scale: [1, 1.1, 1],
                           rotate: [0, 5, -5, 0]
                         }}
                         transition={{ 
                           duration: 2,
                           repeat: Infinity,
                           ease: "easeInOut"
                         }}
                       >
                         <TrendingUp className="w-2 h-2" />
                         HOT
                       </motion.div>
                     )}
                     {/* Order Count Badge */}
                     {product.orderCount && product.orderCount > 0 && (
                       <div className="absolute top-1 right-1 bg-amber-600 text-white px-1 py-0.5 rounded-full text-xs font-semibold flex items-center gap-0.5">
                         <ShoppingCart className="w-2 h-2" />
                         {product.orderCount}
                       </div>
                     )}
                    {/* Quick View Button */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Search className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-2">
                    <h3 className="font-semibold text-white mb-1 truncate text-xs">{product.name}</h3>
                    <p className="text-xs text-gray-400 mb-1">{product.category}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400">
                        {formatPriceString(product.price)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-2 h-2 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-300">4.8</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Promotional Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-gray-900 to-black rounded-2xl shadow-xl overflow-hidden border border-gray-700"
        >
          {/* Top Section - Promotional Features */}
          <div className="bg-gray-800 px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Free Shipping */}
              <motion.div 
                className="flex items-center gap-4"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-amber-400/20 rounded-full p-3">
                  <Truck className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">FREE SHIPPING</h3>
                  <p className="text-gray-300 text-sm">INTERNATIONAL</p>
                </div>
              </motion.div>

              {/* 24/7 Helpline */}
              <motion.div 
                className="flex items-center gap-4"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-amber-400/20 rounded-full p-3">
                  <Clock className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">24 HOURS HELPLINE</h3>
                  <p className="text-gray-300 text-sm">+91 98765 43210</p>
                </div>
              </motion.div>

              {/* Latest Offers */}
              <motion.div 
                className="flex items-center gap-4"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-amber-400/20 rounded-full p-3">
                  <Gift className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">SEE OUR</h3>
                  <p className="text-gray-300 text-sm">LATEST OFFERS</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Middle Section - About and Navigation */}
          <div className="bg-gray-900 px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* About Section */}
              <div className="md:col-span-2">
                <h3 className="text-white font-bold text-lg mb-3">ABOUT CHANCHAL ORNAMENTS</h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  We provide the best quality of jewelry products to you. We are always here to help our lovely customers find their perfect piece.
                </p>
                <div className="flex gap-3">
                  <div className="bg-amber-400/20 rounded-lg p-2 hover:bg-amber-400/30 transition-colors cursor-pointer">
                    <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </div>
                  <div className="bg-amber-400/20 rounded-lg p-2 hover:bg-amber-400/30 transition-colors cursor-pointer">
                    <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                  </div>
                  <div className="bg-amber-400/20 rounded-lg p-2 hover:bg-amber-400/30 transition-colors cursor-pointer">
                    <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.001z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Top Categories */}
              <div>
                <h3 className="text-white font-bold text-lg mb-3">TOP CATEGORIES</h3>
                <ul className="space-y-2 text-sm">
                  <li className="text-gray-300 hover:text-amber-400 transition-colors cursor-pointer">Necklaces</li>
                  <li className="text-gray-300 hover:text-amber-400 transition-colors cursor-pointer">Rings</li>
                  <li className="text-gray-300 hover:text-amber-400 transition-colors cursor-pointer">Earrings</li>
                  <li className="text-gray-300 hover:text-amber-400 transition-colors cursor-pointer">Bracelets</li>
                  <li className="text-gray-300 hover:text-amber-400 transition-colors cursor-pointer">Wedding Collection</li>
                  <li className="text-gray-300 hover:text-amber-400 transition-colors cursor-pointer">Luxury Collection</li>
                </ul>
              </div>

              {/* Subscribe */}
              <div>
                <h3 className="text-white font-bold text-lg mb-3">SUBSCRIBE TO OUR LATEST NEWS</h3>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="EMAIL ADDRESS"
                    className="flex-1 px-3 py-2 text-sm bg-gray-800 text-white placeholder-gray-400 border border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-r-md transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Copyright */}
          <div className="bg-black px-6 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm">
              <div className="text-gray-300 mb-2 md:mb-0">
                © 2024 Chanchal Ornaments. All Rights Reserved.
              </div>
              <div className="text-gray-300 mb-2 md:mb-0">
                www.chanchalornaments.com
              </div>
              <div className="flex items-center space-x-4 text-gray-300">
                <span className="hover:text-amber-400 transition-colors cursor-pointer">HOME</span>
                <span className="text-gray-600">|</span>
                <span className="hover:text-amber-400 transition-colors cursor-pointer">ABOUT</span>
                <span className="text-gray-600">|</span>
                <span className="hover:text-amber-400 transition-colors cursor-pointer">BLOG</span>
                <span className="text-gray-600">|</span>
                <span className="hover:text-amber-400 transition-colors cursor-pointer">CONTACT</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Floating Search Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <motion.button 
            className="bg-amber-600 hover:bg-amber-700 text-white p-4 rounded-full shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <Search className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default MostOrderedProducts; 