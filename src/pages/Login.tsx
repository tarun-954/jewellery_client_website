import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Login successful!');
      const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
      if (userDetails && userDetails.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ffffff] px-2">
      <div className="w-full max-w-5xl flex flex-col md:flex-row rounded-xl overflow-hidden shadow-2xl bg-white/0">
        {/* Left: Branded Area */}
        <div className="relative flex-1 flex flex-col justify-center items-start px-8 py-12 bg-[#61121a] min-h-[400px]">
          {/* Large arc shape */}
          <div className="absolute left-0 bottom-0 w-[150%] h-[80%] bg-[#f3d3be] rounded-tl-[80%] rounded-tr-[80%] -z-10" style={{clipPath:'ellipse(80% 60% at 0% 100%)'}}></div>
          <span className="text-s text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-600 font-medium mb-2 tracking-widest uppercase">Jewellery Store</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-2"><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-100 to-amber-400">Shine.</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-100 to-amber-400">Shop.</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-100 to-amber-400">Login</span></h1>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-400 mb-4">with Elegance</h2>
          <p className="text-base text-gray-200 font-medium mb-8 max-w-md">Access your account to explore our latest collections, manage your orders, and enjoy exclusive offers.</p>
          <button className="inline-flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg shadow hover:bg-gray-800 transition font-semibold text-base">
            Learn More
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </button>
          {/* Lottie Animation */}
          <div className="absolute bottom-8 right-8 hidden md:block">
            <dotlottie-player
              src="https://lottie.host/b7886a5b-0bc5-4aed-be5d-e8ec39dfbf27/g445aQovzO.lottie"
              background="transparent"
              speed="1"
              style={{ width: '120px', height: '120px' }}
              loop
              autoPlay
            />
          </div>
        </div>
        {/* Right: Login Form Card */}
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="w-full max-w-md p-8 md:p-10 rounded-2xl shadow-lg flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Welcome Back</h2>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-gray-900 bg-white placeholder-gray-400"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-gray-900 bg-white placeholder-gray-400"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 rounded-md bg-gray-900 hover:bg-gray-800 text-white font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 mt-2"
              >
                Sign In
              </button>
              {/* Don't have an account? Sign up link */}
              <p className="text-sm text-gray-500 text-center mt-2">Don't have an account?{' '}
                <Link to="/signup" className="text-amber-700 hover:underline font-medium">Sign up</Link>
              </p>
            </form>
            {/* Divider */}
            <div className="flex items-center gap-2 my-4">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="text-gray-400 text-xs">or</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>
            {/* Google Login Button */}
            <button
              type="button"
              onClick={loginWithGoogle}
              className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 shadow-sm font-medium transition"
            >
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwBj4O935vR1QxJ5BqTGp2Eaq94mWcR8iFrg&s" alt="Google" className="w-5 h-5 mr-2" />
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
