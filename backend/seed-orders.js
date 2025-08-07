require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/jewellery_store')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  price: String,
  image: String,
  category: String,
  description: String,
  material: String,
  createdAt: { type: Date, default: Date.now }
});

// Order Schema
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

// Product View Schema
const productViewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ipAddress: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] }
});

const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);
const ProductView = mongoose.model('ProductView', productViewSchema);

// Sample user ID (you can replace this with a real user ID from your database)
const sampleUserId = new mongoose.Types.ObjectId();

// Sample shipping address
const sampleShippingAddress = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+91 98765 43210',
  address: '123 Main Street',
  city: 'Mumbai',
  state: 'Maharashtra',
  zipCode: '400001'
};

// Generate random date within last 30 days
const getRandomDate = () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  return new Date(thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime()));
};

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substr(2, 9).toUpperCase();
  return `ORD-${timestamp}-${randomPart}`;
};

const seedOrders = async () => {
  try {
    console.log('Starting to seed orders...');

    // Get all products
    const products = await Product.find({});
    if (products.length === 0) {
      console.log('No products found. Please seed products first.');
      return;
    }

    console.log(`Found ${products.length} products`);

    // Clear existing orders and views
    await Order.deleteMany({});
    await ProductView.deleteMany({});
    console.log('Cleared existing orders and views');

    // Create sample orders with different patterns to test trending
    const orders = [];
    const views = [];

    // Product 1: High trending (many orders in last 7 days)
    const product1 = products[0];
    for (let i = 0; i < 15; i++) {
      const orderDate = getRandomDate();
      orders.push({
        userId: sampleUserId,
        orderNumber: generateOrderNumber(),
        items: [{
          productId: product1._id,
          name: product1.name,
          price: parseFloat(product1.price.replace('₹', '').replace(',', '')),
          quantity: Math.floor(Math.random() * 3) + 1,
          image: product1.image
        }],
        shippingAddress: sampleShippingAddress,
        totalAmount: parseFloat(product1.price.replace('₹', '').replace(',', '')),
        paymentMethod: 'Credit Card',
        createdAt: orderDate,
        updatedAt: orderDate
      });

      // Add views for this product
      for (let j = 0; j < Math.floor(Math.random() * 10) + 5; j++) {
        views.push({
          productId: product1._id,
          userId: sampleUserId,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: getRandomDate()
        });
      }
    }

    // Product 2: Medium trending (some orders in last 30 days)
    const product2 = products[1] || products[0];
    for (let i = 0; i < 8; i++) {
      const orderDate = getRandomDate();
      orders.push({
        userId: sampleUserId,
        orderNumber: generateOrderNumber(),
        items: [{
          productId: product2._id,
          name: product2.name,
          price: parseFloat(product2.price.replace('₹', '').replace(',', '')),
          quantity: Math.floor(Math.random() * 2) + 1,
          image: product2.image
        }],
        shippingAddress: sampleShippingAddress,
        totalAmount: parseFloat(product2.price.replace('₹', '').replace(',', '')),
        paymentMethod: 'UPI',
        createdAt: orderDate,
        updatedAt: orderDate
      });

      // Add views for this product
      for (let j = 0; j < Math.floor(Math.random() * 8) + 3; j++) {
        views.push({
          productId: product2._id,
          userId: sampleUserId,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          timestamp: getRandomDate()
        });
      }
    }

    // Product 3: Low trending (few orders)
    const product3 = products[2] || products[0];
    for (let i = 0; i < 3; i++) {
      const orderDate = getRandomDate();
      orders.push({
        userId: sampleUserId,
        orderNumber: generateOrderNumber(),
        items: [{
          productId: product3._id,
          name: product3.name,
          price: parseFloat(product3.price.replace('₹', '').replace(',', '')),
          quantity: 1,
          image: product3.image
        }],
        shippingAddress: sampleShippingAddress,
        totalAmount: parseFloat(product3.price.replace('₹', '').replace(',', '')),
        paymentMethod: 'Cash on Delivery',
        createdAt: orderDate,
        updatedAt: orderDate
      });

      // Add views for this product
      for (let j = 0; j < Math.floor(Math.random() * 5) + 1; j++) {
        views.push({
          productId: product3._id,
          userId: sampleUserId,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
          timestamp: getRandomDate()
        });
      }
    }

    // Add some views for other products to create more realistic data
    products.slice(3, 8).forEach(product => {
      for (let i = 0; i < Math.floor(Math.random() * 20) + 5; i++) {
        views.push({
          productId: product._id,
          userId: sampleUserId,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: getRandomDate()
        });
      }
    });

    // Insert orders
    await Order.insertMany(orders);
    console.log(`Created ${orders.length} orders`);

    // Insert views
    await ProductView.insertMany(views);
    console.log(`Created ${views.length} product views`);

    console.log('✅ Orders and views seeded successfully!');
    console.log('\n📊 Trending Data Summary:');
    console.log(`- Product 1 (${product1.name}): ${orders.filter(o => o.items[0].productId.toString() === product1._id.toString()).length} orders`);
    console.log(`- Product 2 (${product2.name}): ${orders.filter(o => o.items[0].productId.toString() === product2._id.toString()).length} orders`);
    console.log(`- Product 3 (${product3.name}): ${orders.filter(o => o.items[0].productId.toString() === product3._id.toString()).length} orders`);
    console.log(`- Total views created: ${views.length}`);

  } catch (error) {
    console.error('Error seeding orders:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedOrders(); 