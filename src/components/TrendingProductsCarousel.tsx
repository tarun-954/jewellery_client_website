import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, TrendingUp, Heart, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

const TrendingProductsCarousel = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const productsPerSlide = 4;
  const totalSlides = Math.ceil(products.length / productsPerSlide);

  console.log('TrendingProductsCarousel component rendered');

  useEffect(() => {
    fetchTrendingProducts();
  }, []);

  const fetchTrendingProducts = async () => {
    try {
      console.log('Fetching trending products...');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/products/most-ordered`);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Trending products data:', data);
        setProducts(data.products || []);
      } else {
        console.error('Response not ok:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching trending products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Track product view when user clicks on a product
  const trackProductView = async (productId: string) => {
    try {
              await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/analytics/track-view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          userId: null,
          ipAddress: null,
          userAgent: null
        }),
      });
    } catch (error) {
      console.error('Error tracking product view:', error);
    }
  };

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (slideIndex: number) => {
    setDirection(slideIndex > currentSlide ? 1 : -1);
    setCurrentSlide(slideIndex);
  };

  const getCurrentProducts = () => {
    const startIndex = currentSlide * productsPerSlide;
    return products.slice(startIndex, startIndex + productsPerSlide);
  };

  if (loading) {
    return (
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-800 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading trending products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-600">No trending products available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm text-amber-600 mb-2">TRENDING PRODUCTS</p>
            <h2 className="text-4xl font-serif text-gray-900 mb-4">SOPHISTICATED BEAUTY</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our most popular jewelry pieces that customers love
            </p>
          </motion.div>
        </div>

        {/* Products Carousel */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            disabled={totalSlides <= 1}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            disabled={totalSlides <= 1}
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Products Grid */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentSlide}
                custom={direction}
                initial={{ x: direction * 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: direction * -300, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {getCurrentProducts().map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group"
                  >
                    <Link to={`/product/${product._id}`} onClick={() => trackProductView(product._id)}>
                      <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                        {/* Product Image */}
                        <div className="relative aspect-square overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          
                          {/* Trending Badge */}
                          {product.isTrending && (
                            <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              TRENDING
                            </div>
                          )}

                          {/* Order Count Badge */}
                          {product.orderCount && product.orderCount > 0 && (
                            <div className="absolute top-3 right-3 bg-amber-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                              <ShoppingCart className="w-3 h-3" />
                              {product.orderCount}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors">
                              <Heart className="w-4 h-4 text-gray-600" />
                            </button>
                            <button className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors">
                              <ShoppingCart className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Product Info */}
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-amber-800">
                              {formatPriceString(product.price)}
                            </span>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600">4.8</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Dots and Controls */}
        <div className="flex items-center justify-between mt-8">
          <button className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-2 rounded-md transition-colors font-medium">
            SHOW MORE
          </button>

          {/* Pagination Dots */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSlides }, (_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-gray-800 scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              className="bg-white border border-gray-300 rounded-full p-2 hover:bg-gray-50 transition-colors"
              disabled={totalSlides <= 1}
            >
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={nextSlide}
              className="bg-white border border-gray-300 rounded-full p-2 hover:bg-gray-50 transition-colors"
              disabled={totalSlides <= 1}
            >
              <ArrowRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingProductsCarousel; 