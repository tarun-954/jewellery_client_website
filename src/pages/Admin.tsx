import React, { useState } from 'react';
import { Plus, Package, Trash2 } from 'lucide-react';
import { useProducts } from '../context/ProductContext';

interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  category: string;
  description: string;
}

const Admin = () => {
  const { addProduct, products, deleteProduct } = useProducts();
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    price: '',
    image: '',
    category: 'necklaces',
    description: ''
  });

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

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-serif text-amber-900 mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Add Product Form */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-serif text-gray-900 mb-6 flex items-center">
              <Plus className="w-6 h-6 mr-2" />
              Add New Product
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <input
                  type="text"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                  placeholder="$999"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, image: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
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
                  <div className="flex-1">
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.price}</p>
                    <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                    <p className="text-sm text-gray-500 truncate">{product.description}</p>
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
      </div>
    </div>
  );
};

export default Admin;