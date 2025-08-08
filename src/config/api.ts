// API Configuration
export const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/.netlify/functions/api' : 'http://localhost:5000/api');

// For production, this will use Netlify Functions
// For development, this will use local backend
