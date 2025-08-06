import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleOAuthSuccess } from '../context/AuthContext';

const OAuthSuccess: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      handleOAuthSuccess(token);
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <svg className="animate-spin h-8 w-8 text-amber-800 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        </div>
        <p className="text-lg text-amber-900 font-semibold">Logging you in with Google...</p>
      </div>
    </div>
  );
};

export default OAuthSuccess;