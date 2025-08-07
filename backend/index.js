require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendBookingConfirmation, sendAdminConfirmation, sendOrderConfirmation, sendAdminOrderNotification } = require('./emailService');
const multer = require('multer');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Check if JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set in environment variables');
  process.exit(1);
}

app.use(cors());
app.use(express.json());

// Express session middleware
app.use(session({
  secret: process.env.JWT_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    let user = await User.findOne({ email });
    let isNewUser = false;
    if (!user) {
      user = new User({
        name: profile.displayName,
        email,
        password: '', // Not used for Google users
        profileImage: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
      });
      await user.save();
      isNewUser = true;
    } else {
      // Update profile image if changed
      if (profile.photos && profile.photos[0] && user.profileImage !== profile.photos[0].value) {
        user.profileImage = profile.photos[0].value;
        await user.save();
      }
    }
    
    // Track signup analytics for new users
    if (isNewUser) {
      const signupAnalytics = new SignupAnalytics({
        userId: user._id,
        email: user.email
      });
      await signupAnalytics.save();
    }
    
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// Google OAuth endpoints
app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/api/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login', session: true }), async (req, res) => {
  try {
    // Generate JWT and send to frontend (or set cookie)
    const user = req.user;
    
    // Track login analytics for Google OAuth
    const loginAnalytics = new LoginAnalytics({
      userId: user._id,
      email: user.email
    });
    await loginAnalytics.save();
    
    const token = jwt.sign({ id: user._id, email: user.email, name: user.name, isAdmin: user.isAdmin, profileImage: user.profileImage }, process.env.JWT_SECRET, { expiresIn: '7d' });
    // Redirect to frontend with token (e.g., as query param)
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/oauth-success?token=${token}`);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect('/login');
  }
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('Connected to MongoDB');
  
  // Add sample products if none exist
  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    console.log('No products found, adding sample products...');
    const sampleProducts = [
      {
        name: 'Diamond Pendant Necklace',
        price: '1299',
        image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=500',
        category: 'Necklaces',
        description: 'Beautiful diamond pendant necklace with elegant design',
        material: 'Gold, Diamond'
      },
      {
        name: 'Pearl Earrings',
        price: '899',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500',
        category: 'Earrings',
        description: 'Classic pearl earrings perfect for any occasion',
        material: 'Silver, Pearl'
      },
      {
        name: 'Gold Bangle Set',
        price: '2499',
        image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500',
        category: 'Bangles',
        description: 'Traditional gold bangle set with intricate designs',
        material: 'Gold'
      },
      {
        name: 'Silver Ring',
        price: '599',
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500',
        category: 'Rings',
        description: 'Elegant silver ring with modern design',
        material: 'Silver'
      },
      {
        name: 'Ruby Necklace',
        price: '1899',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500',
        category: 'Necklaces',
        description: 'Stunning ruby necklace with gold setting',
        material: 'Gold, Ruby'
      },
      {
        name: 'Emerald Bracelet',
        price: '1599',
        image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=500',
        category: 'Bracelets',
        description: 'Beautiful emerald bracelet with silver chain',
        material: 'Silver, Emerald'
      }
    ];
    
    try {
      await Product.insertMany(sampleProducts);
      console.log('Sample products added successfully');
    } catch (error) {
      console.error('Error adding sample products:', error);
    }
  }
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Multer storage config for profile images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + file.fieldname + ext);
  }
});
const upload = multer({ storage });

// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Profile image upload endpoint - stores image as Base64 in MongoDB
app.post('/api/upload-profile-image', upload.single('profileImage'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  try {
    // Read the file and convert to Base64
    const fs = require('fs');
    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);
    const base64Image = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;
    
    // Delete the temporary file
    fs.unlinkSync(filePath);
    
    // Return the Base64 image data
    res.json({ imageUrl: base64Image });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ message: 'Error processing image' });
  }
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
  profileImage: { type: String, default: '' } // <-- Added for profile image
});
const User = mongoose.model('User', userSchema);

// Product schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  material: String,
  inStock: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', productSchema);

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

// Product View Tracking Schema for trending algorithm
const productViewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional, for logged-in users
  ipAddress: String, // For anonymous tracking
  userAgent: String,
  timestamp: { type: Date, default: Date.now },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] }
});
const ProductView = mongoose.model('ProductView', productViewSchema);

// Booking schema
const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});
const Booking = mongoose.model('Booking', bookingSchema);

// Order schema
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderNumber: { type: String, required: true, unique: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, required: true }
  }],
  shippingAddress: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], 
    default: 'Pending' 
  },
  trackingNumber: { type: String, default: '' },
  paymentMethod: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// Product endpoints
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, price, image, category, description, material } = req.body;
    
    // Ensure consistent price formatting - remove existing ₹ symbol if present
    let formattedPrice = price;
    if (typeof price === 'string') {
      // Remove existing ₹ symbol and format consistently
      const cleanPrice = price.replace(/[₹,\s]/g, '');
      const numericPrice = parseFloat(cleanPrice);
      if (!isNaN(numericPrice)) {
        formattedPrice = `₹${numericPrice.toLocaleString('en-IN')}`;
      }
    }
    
    const product = new Product({
      name,
      price: formattedPrice,
      image,
      category,
      description,
      material: material || ''
    });
    await product.save();
    console.log('Product created successfully:', name);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    console.log('Product deleted successfully:', product.name);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/products/category/:category', async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Booking endpoints
app.post('/api/bookings', async (req, res) => {
  try {
    const { name, email, phone, date, time } = req.body;
    
    // Create new booking
    const booking = new Booking({
      name,
      email,
      phone,
      date,
      time
    });
    
    await booking.save();
    
    // Send confirmation email
    const emailResult = await sendBookingConfirmation({
      name,
      email,
      phone,
      date,
      time
    });
    
    console.log('Email sending result:', emailResult);
    
    res.status(201).json({ 
      message: 'Booking created successfully',
      booking: booking,
      emailSent: true
    });
    
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/bookings/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Send admin confirmation email when status is changed to 'Completed'
    if (status === 'Completed') {
      const emailResult = await sendAdminConfirmation({
        name: booking.name,
        email: booking.email,
        phone: booking.phone,
        date: booking.date,
        time: booking.time
      });
      
      console.log('Admin confirmation email result:', emailResult);
    }
    
    res.json({ message: 'Booking status updated', booking });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    console.log('Booking deleted successfully:', booking.name);
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

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

// Get most ordered products endpoint - REAL TRENDING ALGORITHM
app.get('/api/products/most-ordered', async (req, res) => {
  try {
    // Get the last 30 days for trending calculation
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get the last 7 days for recent trending
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Step 1: Get order-based trending (most important)
    const orderTrending = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: { $nin: ['Cancelled'] }
        }
      },
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.productId',
          totalOrders: { $sum: 1 },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          recentOrders: {
            $sum: {
              $cond: [
                { $gte: ['$createdAt', sevenDaysAgo] },
                1,
                0
              ]
            }
          },
          lastOrderDate: { $max: '$createdAt' }
        }
      },
      {
        $sort: { totalOrders: -1, recentOrders: -1, totalRevenue: -1 }
      },
      {
        $limit: 15
      }
    ]);

    // Step 2: Get view-based trending (secondary factor)
    const viewTrending = await ProductView.aggregate([
      {
        $match: {
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$productId',
          totalViews: { $sum: 1 },
          recentViews: {
            $sum: {
              $cond: [
                { $gte: ['$timestamp', sevenDaysAgo] },
                1,
                0
              ]
            }
          },
          uniqueViewers: { $addToSet: '$ipAddress' }
        }
      },
      {
        $addFields: {
          uniqueViewCount: { $size: '$uniqueViewers' }
        }
      },
      {
        $sort: { totalViews: -1, recentViews: -1, uniqueViewCount: -1 }
      },
      {
        $limit: 15
      }
    ]);

    // Step 3: Combine and calculate trending scores
    const allProductIds = new Set([
      ...orderTrending.map(p => p._id.toString()),
      ...viewTrending.map(p => p._id.toString())
    ]);

    const trendingScores = [];
    
    for (const productId of allProductIds) {
      const orderData = orderTrending.find(p => p._id.toString() === productId);
      const viewData = viewTrending.find(p => p._id.toString() === productId);
      
      // Calculate trending score with weights
      const orderScore = orderData ? (orderData.totalOrders * 10) + (orderData.recentOrders * 20) + (orderData.totalRevenue / 100) : 0;
      const viewScore = viewData ? (viewData.totalViews * 0.1) + (viewData.recentViews * 0.2) + (viewData.uniqueViewCount * 0.5) : 0;
      
      const totalScore = orderScore + viewScore;
      
      trendingScores.push({
        productId,
        orderData,
        viewData,
        trendingScore: totalScore
      });
    }

    // Sort by trending score
    trendingScores.sort((a, b) => b.trendingScore - a.trendingScore);

    // Step 4: Fetch full product details for top trending products
    const topProductIds = trendingScores.slice(0, 10).map(score => score.productId);
    const fullProducts = await Product.find({ _id: { $in: topProductIds } });

    // Step 5: Build final response
    const productsWithTrendingData = trendingScores.slice(0, 10).map(score => {
      const fullProduct = fullProducts.find(p => p._id.toString() === score.productId);
      const orderData = score.orderData;
      const viewData = score.viewData;
      
      return {
        _id: score.productId,
        name: fullProduct ? fullProduct.name : 'Product',
        price: fullProduct ? fullProduct.price : '0',
        image: fullProduct ? fullProduct.image : '',
        category: fullProduct ? fullProduct.category : 'Jewelry',
        description: fullProduct ? fullProduct.description : '',
        orderCount: orderData ? orderData.totalOrders : 0,
        totalQuantity: orderData ? orderData.totalQuantity : 0,
        totalRevenue: orderData ? orderData.totalRevenue : 0,
        recentOrders: orderData ? orderData.recentOrders : 0,
        totalViews: viewData ? viewData.totalViews : 0,
        recentViews: viewData ? viewData.recentViews : 0,
        uniqueViewers: viewData ? viewData.uniqueViewCount : 0,
        lastOrderDate: orderData ? orderData.lastOrderDate : null,
        trendingScore: Math.round(score.trendingScore),
        isTrending: score.trendingScore > 50 // Mark as trending if score > 50
      };
    });

    res.json({ 
      products: productsWithTrendingData,
      algorithm: 'Real trending based on orders (70%) and views (30%) from last 30 days',
      totalProductsAnalyzed: allProductIds.size
    });

  } catch (error) {
    console.error('Error fetching most ordered products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Track product view for trending algorithm
app.post('/api/analytics/track-view', async (req, res) => {
  try {
    const { productId, userId, ipAddress, userAgent } = req.body;
    
    // Validate productId
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const view = new ProductView({
      productId,
      userId: userId || null,
      ipAddress: ipAddress || req.ip,
      userAgent: userAgent || req.get('User-Agent')
    });
    
    await view.save();
    res.json({ message: 'View tracked successfully' });
  } catch (error) {
    console.error('Track view error:', error);
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

// Order endpoints
app.post('/api/orders', async (req, res) => {
  try {
    const { userId, items, shippingAddress, totalAmount, paymentMethod } = req.body;
    
    // Validate required fields
    if (!userId || !items || !shippingAddress || !totalAmount || !paymentMethod) {
      return res.status(400).json({ 
        message: 'Missing required fields: userId, items, shippingAddress, totalAmount, paymentMethod' 
      });
    }
    
    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items must be a non-empty array' });
    }
    
    // Generate unique order number
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substr(2, 9).toUpperCase();
    const orderNumber = `ORD-${timestamp}-${randomPart}`;
    
    console.log('Creating order with number:', orderNumber);
    console.log('Order data:', { userId, items: items.length, totalAmount, paymentMethod });
    
    const order = new Order({
      userId,
      orderNumber,
      items,
      shippingAddress,
      totalAmount,
      paymentMethod
    });
    
    await order.save();
    console.log('Order created successfully:', orderNumber);
    
    // Send order confirmation email to customer
    try {
      const emailResult = await sendOrderConfirmation(order);
      console.log('Order confirmation email result:', emailResult);
    } catch (emailError) {
      console.error('Error sending order confirmation email:', emailError);
      // Don't fail the order creation if email fails
    }
    
    // Send admin notification email
    try {
      const adminEmailResult = await sendAdminOrderNotification(order);
      console.log('Admin order notification email result:', adminEmailResult);
    } catch (adminEmailError) {
      console.error('Error sending admin order notification email:', adminEmailError);
      // Don't fail the order creation if email fails
    }
    
    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    console.error('Error creating order:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Order number already exists. Please try again.' 
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ') 
      });
    }
    
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

app.get('/api/orders/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .populate('items.productId')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('items.productId')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    const updateData = { status, updatedAt: new Date() };
    
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('userId', 'name email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    console.log('Order status updated:', order.orderNumber, 'to', status);
    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password, name, profileImage } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      name,
      profileImage: profileImage || ''
    });
    await user.save();
    
    // Track signup analytics
    const signupAnalytics = new SignupAnalytics({
      userId: user._id,
      email: user.email
    });
    await signupAnalytics.save();
    
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Signup error:', error);
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
    console.log('Sending response:', { token: '***', user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, profileImage: user.profileImage } });
    console.log('=== LOGIN REQUEST END ===');
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, profileImage: user.profileImage } });
  } catch (err) {
    console.error('=== LOGIN ERROR ===');
    console.error('Login error:', err);
    console.error('Error stack:', err.stack);
    console.error('=== END LOGIN ERROR ===');
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile endpoint
app.put('/api/update-profile', async (req, res) => {
  try {
    const { userId, name, profileImage } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields if provided
    if (name) user.name = name;
    if (profileImage !== undefined) user.profileImage = profileImage;
    
    await user.save();
    
    res.json({ 
      message: 'Profile updated successfully',
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        isAdmin: user.isAdmin, 
        profileImage: user.profileImage 
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
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