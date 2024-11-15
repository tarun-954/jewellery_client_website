import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CartSidebar from './components/CartSidebar';
import BookingButton from './components/BookingButton';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Admin from './pages/Admin';
import CategoryPage from './pages/CategoryPage';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen bg-neutral-50">
              <Navbar />
              <CartSidebar />
              <BookingButton />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/category/:id" element={<CategoryPage />} />
              </Routes>
            </div>
          </Router>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;