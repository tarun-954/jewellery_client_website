import React from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartSidebar = () => {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, totalItems } = useCart();

  const total = items.reduce((sum, item) => {
    const price = parseFloat(item.price.replace('$', '').replace(',', ''));
    return sum + price * item.quantity;
  }, 0);

    
  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/30" onClick={() => setIsCartOpen(false)} />
      
      <div className="absolute inset-y-0 right-0 w-full max-w-md flex">
        <div className="relative w-full bg-white shadow-xl">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-4 py-6 bg-gray-50 sm:px-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Shopping Cart ({totalItems})</h2>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500"
                  onClick={() => setIsCartOpen(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Cart items */}
            <div className="flex-1 px-4 py-6 sm:px-6 overflow-auto">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
                  <p className="mt-1 text-sm text-gray-500">Start adding some items to your cart!</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-20 w-20 object-cover rounded"
                      />
                      <div className="ml-4 flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">{item.price}</p>
                        <div className="mt-2 flex items-center">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-gray-400 hover:text-gray-500"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="mx-2 text-gray-600">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-gray-400 hover:text-gray-500"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-4 text-gray-400 hover:text-gray-500"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>Subtotal</p>
                <p>₹{total.toFixed(2)}</p>
              </div>
              <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
              <div className="mt-6">
                <button
                  className="w-full bg-amber-800 text-white px-6 py-3 rounded-md hover:bg-amber-900 transition"
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;