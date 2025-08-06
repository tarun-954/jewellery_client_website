import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      const formData = new FormData();
      formData.append('profileImage', e.target.files[0]);
      try {
        const res = await fetch('http://localhost:5000/api/upload-profile-image', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.imageUrl) {
          setProfileImage(data.imageUrl);
          toast.success('Profile image uploaded!');
        } else {
          toast.error(data.message || 'Image upload failed');
        }
      } catch (error) {
        toast.error('Image upload failed');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(email, password, name, profileImage);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ffffff] px-2">
      <div className="w-full max-w-5xl h-[95vh] flex flex-col md:flex-row rounded-xl overflow-hidden shadow-2xl bg-white/0">
        {/* Left: Branded Area */}
        <div className="relative flex-1 flex flex-col justify-center items-start px-8 py-12 bg-[#61121a] min-h-[400px]">
          {/* Large arc shape */}
          <div className="absolute left-0 bottom-0 w-[150%] h-[80%] bg-[#f3d3be] rounded-tl-[80%] rounded-tr-[80%] -z-10" style={{clipPath:'ellipse(80% 60% at 0% 100%)'}}></div>
          <span className="text-s text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-600 font-medium mb-2 tracking-widest uppercase">Jewellery Store</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-2"><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-100 to-amber-400">Shine.</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-100 to-amber-400">Shop.</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-100 to-amber-400">Signup</span></h1>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-400 mb-4">with Elegance</h2>
          <p className="text-base text-gray-200 font-medium mb-8 max-w-md">Join our exclusive community and get access to the latest collections, offers, and more. Experience the brilliance of fine jewellery shopping.</p>
          <button className="inline-flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg shadow hover:bg-gray-800 transition font-semibold text-base">
            Learn More
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </button>
        </div>
        {/* Right: Signup Form Card */}
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="w-full max-w-md p-8 md:p-10 rounded-2xl shadow-lg flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Create your account</h2>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {/* Profile Image Upload */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative w-20 h-20">
                  <img
                    src={profileImage || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name || 'User')}
                    alt="Profile Preview"
                    className="w-20 h-20 rounded-full object-cover border border-gray-200 shadow-sm bg-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-white border border-gray-300 text-gray-700 rounded-full p-1 hover:bg-gray-100 focus:outline-none"
                    style={{ fontSize: '12px' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m2-2l-6 6" /></svg>
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={uploading}
                />
                {uploading && <span className="text-xs text-gray-400">Uploading...</span>}
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-gray-900 bg-white placeholder-gray-400"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
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
                  autoComplete="new-password"
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-gray-900 bg-white placeholder-gray-400"
                  placeholder="Create new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span className="text-xs text-gray-400 mt-1 block">Password must be at least 6 characters.</span>
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 rounded-md bg-gray-900 hover:bg-gray-800 text-white font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 mt-2"
              >
                Create Account
              </button>
            </form>
            {/* Divider */}
            <div className="flex items-center gap-2 my-2">
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
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png" alt="Google" className="w-5 h-5 mr-2" />
              Continue with Google
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">
              By signing up, you agree to our <Link to="/terms" className="underline hover:text-amber-700">Terms & Conditions</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
