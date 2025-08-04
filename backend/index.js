require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Check if JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set in environment variables');
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model('User', userSchema);

// Analytics schemas
const loginAnalyticsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  email: String,
  timestamp: { type: Date, default: Date.now },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] }
});
const LoginAnalytics = mongoose.model('LoginAnalytics', loginAnalyticsSchema);

const signupAnalyticsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  email: String,
  timestamp: { type: Date, default: Date.now },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] }
});
const SignupAnalytics = mongoose.model('SignupAnalytics', signupAnalyticsSchema);

const productSaleSchema = new mongoose.Schema({
  productId: Number,
  productName: String,
  price: String,
  category: String,
  timestamp: { type: Date, default: Date.now },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] }
});
const ProductSale = mongoose.model('ProductSale', productSaleSchema);

// Analytics endpoints
app.get('/api/analytics/login-signup', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const loginData = await LoginAnalytics.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$date',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const signupData = await SignupAnalytics.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$date',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({ loginData, signupData });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/analytics/sales', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const salesData = await ProductSale.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$date',
          count: { $sum: 1 },
          totalRevenue: { $sum: { $toDouble: { $replaceAll: { input: '$price', find: '₹', replacement: '' } } } }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const categorySales = await ProductSale.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({ salesData, categorySales });
  } catch (error) {
    console.error('Sales analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Track product sale
app.post('/api/analytics/track-sale', async (req, res) => {
  try {
    const { productId, productName, price, category } = req.body;
    const sale = new ProductSale({
      productId,
      productName,
      price,
      category
    });
    await sale.save();
    res.json({ message: 'Sale tracked successfully' });
  } catch (error) {
    console.error('Track sale error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;
  console.log('Signup request:', { name, email, password: password ? '***' : 'missing' });
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed });
    await user.save();
    
    // Track signup analytics
    const signupAnalytics = new SignupAnalytics({
      userId: user._id,
      email: user.email
    });
    await signupAnalytics.save();
    
    console.log('User created successfully:', email);
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  console.log('=== LOGIN REQUEST START ===');
  const { email, password } = req.body;
  console.log('Login request:', { email, password: password ? '***' : 'missing' });
  
  if (!email || !password) {
    console.log('Missing email or password');
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  try {
    console.log('Looking up user in database...');
    const user = await User.findOne({ email });
    console.log('User lookup result:', user ? 'Found' : 'Not found');
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    console.log('Comparing passwords...');
    const valid = await bcrypt.compare(password, user.password);
    console.log('Password validation:', valid ? 'Valid' : 'Invalid');
    
    if (!valid) {
      console.log('Invalid password for:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    // Track login analytics
    const loginAnalytics = new LoginAnalytics({
      userId: user._id,
      email: user.email
    });
    await loginAnalytics.save();
    
    console.log('Generating JWT token...');
    const token = jwt.sign({ id: user._id, email: user.email, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1d' });
    console.log('Login successful:', email);
    console.log('Sending response:', { token: '***', user: { name: user.name, email: user.email, isAdmin: user.isAdmin } });
    console.log('=== LOGIN REQUEST END ===');
    res.json({ token, user: { name: user.name, email: user.email, isAdmin: user.isAdmin } });
  } catch (err) {
    console.error('=== LOGIN ERROR ===');
    console.error('Login error:', err);
    console.error('Error stack:', err.stack);
    console.error('=== END LOGIN ERROR ===');
    res.status(500).json({ message: 'Server error' });
  }
});

// Set admin status endpoint
app.post('/api/set-admin', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.isAdmin = true;
    await user.save();
    console.log('Admin status set for:', email);
    res.json({ message: 'Admin status set successfully' });
  } catch (err) {
    console.error('Set admin error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 