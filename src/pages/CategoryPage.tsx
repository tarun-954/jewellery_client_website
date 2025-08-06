import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Filter, X, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { formatPrice } from '../utils/priceUtils';

const CategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('featured');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: [0, 100000],
    productType: '',
    material: '',
    inStock: true
  });
  const filterRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();
  const { getProductsByCategory } = useProducts();
  
  const categoryProducts = getProductsByCategory(id || '');

  // Helper function to convert price to number
  const getPriceAsNumber = (price: string | number): number => {
    if (typeof price === 'number') return price;
    if (typeof price === 'string') {
      // Remove currency symbols, commas, and spaces, then parse
      const cleanPrice = price.replace(/[₹,\s]/g, '');
      const parsed = parseFloat(cleanPrice);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter products based on selected filters
  const filteredProducts = useMemo(() => {
    return categoryProducts.filter(product => {
      const price = getPriceAsNumber(product.price);
      
      // Price range filter
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false;
      }
      
      // Product type filter (if implemented)
      if (filters.productType && product.category !== filters.productType) {
        return false;
      }
      
      // Material filter (if product has material property)
      if (filters.material && product.material && product.material !== filters.material) {
        return false;
      }
      
      // In stock filter - show only in-stock products when filter is active
      if (filters.inStock && product.inStock === false) {
        return false;
      }
      
      return true;
    });
  }, [categoryProducts, filters]);

  // Sort products based on selected option
  const sortedProducts = useMemo(() => {
    const products = [...filteredProducts];
    
    switch (sortBy) {
      case 'price-asc':
        return products.sort((a, b) => {
          const priceA = getPriceAsNumber(a.price);
          const priceB = getPriceAsNumber(b.price);
          return priceA - priceB;
        });
      case 'price-desc':
        return products.sort((a, b) => {
          const priceA = getPriceAsNumber(a.price);
          const priceB = getPriceAsNumber(b.price);
          return priceB - priceA;
        });
      case 'newest':
        // Sort by creation date (newest first)
        return products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'featured':
      default:
        // Keep original order for featured
        return products;
    }
  }, [filteredProducts, sortBy]);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      priceRange: [0, 100000],
      productType: '',
      material: '',
      inStock: true
    });
  };

  // Get unique materials from products (if available)
  const availableMaterials = useMemo(() => {
    const materials = categoryProducts
      .map(product => product.material)
      .filter(Boolean)
      .filter((material, index, arr) => arr.indexOf(material) === index);
    return materials;
  }, [categoryProducts]);

  // Get price range from products
  const priceRange = useMemo(() => {
    const prices = categoryProducts.map(product => getPriceAsNumber(product.price)).filter(price => !isNaN(price) && price > 0);
    
    if (prices.length === 0) {
      return {
        min: 0,
        max: 100000
      };
    }
    
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }, [categoryProducts]);

  // Scroll to top when the category page is loaded or when `id` changes
  useEffect(() => {
    window.scrollTo(0, 0);  // Scroll to top of the page
  }, [id]); // This ensures that the page scrolls to the top whenever the category changes

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
            <div className="flex items-center space-x-4">
              {/* Filter Button */}
              <div className="relative" ref={filterRef}>
                <button 
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-4 py-2 border border-gray-300 rounded-md hover:border-gray-400 transition-colors"
                  onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                >
                  <Filter className="h-5 w-5" />
                  <span>Filter</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
                  {Object.values(filters).some(filter => 
                    Array.isArray(filter) ? filter[0] !== priceRange.min || filter[1] !== priceRange.max : filter !== '' && filter !== true
                  ) && (
                    <span className="bg-amber-600 text-white text-xs px-2 py-1 rounded-full">
                      Active
                    </span>
                  )}
                </button>
              
              {/* Filter Dropdown */}
              {isFilterDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Filters</h3>
                      <button 
                        onClick={clearFilters}
                        className="text-sm text-amber-600 hover:text-amber-700"
                      >
                        Clear all
                      </button>
                    </div>
                    <FilterContent 
                      filters={filters} 
                      setFilters={setFilters} 
                      clearFilters={clearFilters}
                      availableMaterials={availableMaterials}
                      priceRange={priceRange}
                    />
                  </div>
                </div>
              )}
              </div>
              
              {/* Quick In Stock Filter */}
              <button
                onClick={() => setFilters(prev => ({ ...prev, inStock: !prev.inStock }))}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  filters.inStock
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <span>✓</span>
                <span>In Stock Only</span>
              </button>
            </div>
            
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
        <div className="mb-4">
          <p className="text-gray-600">
            Showing {sortedProducts.length} of {categoryProducts.length} products
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
                          <div key={product._id} className="group">
                              <div 
                  className="relative aspect-[3/4] overflow-hidden bg-gray-100 cursor-pointer"
                  onClick={() => navigate(`/product/${product._id}`)}
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
                    className="text-lg font-medium text-gray-900 cursor-pointer truncate overflow-hidden text-ellipsis"
                    onClick={() => navigate(`/product/${product._id}`)}
                    title={product.name} // Show full name on hover
                  >
                  {product.name}
                </h3>
                <p className="mt-1 text-gray-500">{formatPrice(getPriceAsNumber(product.price))}</p>
                <button 
                  onClick={() => addToCart({
                    id: product._id,
                    name: product.name,
                    price: getPriceAsNumber(product.price),
                    image: product.image,
                    category: product.category
                  })}
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

// Filter Content Component
interface FilterContentProps {
  filters: {
    priceRange: number[];
    productType: string;
    material: string;
    inStock: boolean;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    priceRange: number[];
    productType: string;
    material: string;
    inStock: boolean;
  }>>;
  clearFilters: () => void;
  availableMaterials: (string | undefined)[];
  priceRange: {
    min: number;
    max: number;
  };
}

const FilterContent: React.FC<FilterContentProps> = ({ filters, setFilters, clearFilters, availableMaterials, priceRange }) => {
  return (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">Min Price</label>
              <input
                type="number"
                placeholder="Min"
                min={0}
                value={filters.priceRange[0]}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setFilters(prev => ({
                    ...prev,
                    priceRange: [value, prev.priceRange[1]]
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">Max Price</label>
              <input
                type="number"
                placeholder="Max"
                min={0}
                value={filters.priceRange[1]}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 100000;
                  setFilters(prev => ({
                    ...prev,
                    priceRange: [prev.priceRange[0], value]
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>
          <div className="text-sm text-gray-500">
            ₹{filters.priceRange[0].toLocaleString()} - ₹{filters.priceRange[1].toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">
            Available range: ₹{priceRange.min.toLocaleString()} - ₹{priceRange.max.toLocaleString()}
          </div>
          <button
            onClick={() => setFilters(prev => ({
              ...prev,
              priceRange: [0, 100000]
            }))}
            className="text-xs text-amber-600 hover:text-amber-700 underline"
          >
            Reset to ₹0 - ₹1,00,000
          </button>
        </div>
      </div>

      {/* Material Filter */}
      {availableMaterials.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Material</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {availableMaterials.map((material) => (
              <label key={material} className="flex items-center">
                <input
                  type="radio"
                  name="material"
                  value={material}
                  checked={filters.material === material}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    material: e.target.value
                  }))}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700 capitalize">{material}</span>
              </label>
            ))}
            <label className="flex items-center">
              <input
                type="radio"
                name="material"
                value=""
                checked={filters.material === ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  material: e.target.value
                }))}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">All Materials</span>
            </label>
          </div>
        </div>
      )}

      {/* In Stock Filter */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Availability</h4>
        <div className="space-y-2">
          <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                inStock: e.target.checked
              }))}
              className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-900">In Stock Only</span>
              <p className="text-xs text-gray-500">Show only products currently available</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
