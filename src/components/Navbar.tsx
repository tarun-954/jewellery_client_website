import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { User, ShoppingCart, Menu } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { setIsCartOpen, totalItems } = useCart();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="font-serif text-2xl text-amber-800">
            Chanchal Ornaments
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-amber-800">Home</Link>
            <Link to="/category/necklaces" className="text-gray-700 hover:text-amber-800">Necklaces</Link>
            <Link to="/category/rings" className="text-gray-700 hover:text-amber-800">Rings</Link>
            <Link to="/category/earrings" className="text-gray-700 hover:text-amber-800">Earrings</Link>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              className="text-gray-700 hover:text-amber-800 relative"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-800 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            {user ? (
              <button 
                onClick={logout}
                className="text-gray-700 hover:text-amber-800"
              >
                <User className="h-6 w-6" />
              </button>
            ) : (
              <Link 
                to="/login"
                className="text-gray-700 hover:text-amber-800"
              >
                <User className="h-6 w-6" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;