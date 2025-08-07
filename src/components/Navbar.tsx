import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { User, ShoppingCart } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { setIsCartOpen, totalItems } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate(); // Initialize useNavigate

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login'); // Redirect to the login page after logout
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
            {/* Cart Button */}
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

            {/* User Dropdown */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="text-gray-700 hover:text-amber-800 flex items-center"
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover border border-gray-300 shadow-sm"
                    />
                  ) : (
                    <User className="h-6 w-6" />
                  )}
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 bg-amber-100 flex items-center gap-3">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt="Profile"
                          className="h-10 w-10 rounded-full object-cover border border-gray-300 shadow-sm flex-shrink-0"
                        />
                      ) : (
                        <User className="h-8 w-8 text-amber-800 flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-amber-800 truncate">{user.name}</p>
                        <p className="text-sm text-gray-600 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-200">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-amber-800 transition duration-150"
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/my-orders"
                        onClick={() => setDropdownOpen(false)}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-amber-800 transition duration-150"
                      >
                        My Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-amber-800 transition duration-150"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
