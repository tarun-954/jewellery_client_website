import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { ArrowLeft, Heart, Share2 } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products } = useProducts();
  const { addToCart } = useCart();

  const product = products.find(p => p.id === Number(id));
  const recommendations = products
    .filter(p => p.category === product?.category && p.id !== product?.id)
    .slice(0, 4);

  if (!product) {
    return <div>Product not found</div>;
  }

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
              <p className="text-2xl text-amber-800">{product.price}</p>
            </div>

            <div className="prose prose-amber">
              <h3>Description</h3>
              <p>{product.description}</p>

              <h3>Details</h3>
              <ul>
                <li>Handcrafted with precision</li>
                <li>Premium quality materials</li>
                <li>Certified authenticity</li>
                <li>Includes luxury gift packaging</li>
              </ul>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => addToCart(product)}
                className="w-full bg-amber-800 text-white px-6 py-3 rounded-md hover:bg-amber-900 transition"
              >
                Add to Cart
              </button>
         
              <button className="w-full border border-amber-800 text-amber-800 px-6 py-3 rounded-md hover:bg-amber-50 transition">
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
                key={rec.id} 
                className="group cursor-pointer"
                onClick={() => navigate(`/product/${rec.id}`)}
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
                  <p className="text-amber-800">{rec.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;