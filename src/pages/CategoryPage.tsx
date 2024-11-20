import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Filter } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';

const CategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('featured');
  const { addToCart } = useCart();
  const { getProductsByCategory } = useProducts();
  
  const categoryProducts = getProductsByCategory(id || '');

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[40vh] bg-neutral-900">
        <div className="absolute inset-0 bg-black/50">
          <div className="max-w-7xl mx-auto px-4 h-full flex items-center">
            <div className="text-center w-full">
              <h1 className="text-5xl font-serif text-white mb-4 capitalize">
                {id?.replace('-', ' ')}
              </h1>
              <p className="text-white/80 text-lg max-w-2xl mx-auto">
                Discover our exquisite collection of handcrafted pieces that blend timeless elegance with contemporary design.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <Filter className="h-5 w-5" />
              <span>Filter</span>
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border-none bg-transparent focus:ring-0 text-gray-900"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {categoryProducts.map((product) => (
            <div key={product.id} className="group">
              <div 
                className="relative aspect-[3/4] overflow-hidden bg-gray-100 cursor-pointer"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="object-cover w-full h-full group-hover:scale-110 transition duration-300"
                />
                <button className="absolute top-4 right-4 p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Heart className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <div className="mt-4 text-center">
                <h3 
                  className="text-lg font-medium text-gray-900 cursor-pointer"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  {product.name}
                </h3>
                <p className="mt-1 text-gray-500">₹{product.price}</p>

                <button 
                  onClick={() => addToCart(product)}
                  className="mt-3 w-full bg-amber-800 text-white px-4 py-2 rounded-md hover:bg-amber-900 transition"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;