require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendBookingConfirmation, sendAdminConfirmation, sendOrderConfirmation, sendAdminOrderNotification } = require('./emailService');

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
    const product = new Product({
      name,
      price,
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
    console.log('Sending response:', { token: '***', user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
    console.log('=== LOGIN REQUEST END ===');
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
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