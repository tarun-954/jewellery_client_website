require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

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

// Sample data
const sampleLogins = [
  { email: 'user1@example.com', date: '2024-01-15' },
  { email: 'user2@example.com', date: '2024-01-15' },
  { email: 'user3@example.com', date: '2024-01-16' },
  { email: 'user1@example.com', date: '2024-01-16' },
  { email: 'user4@example.com', date: '2024-01-17' },
  { email: 'user2@example.com', date: '2024-01-17' },
  { email: 'user5@example.com', date: '2024-01-18' },
  { email: 'user1@example.com', date: '2024-01-18' },
  { email: 'user3@example.com', date: '2024-01-19' },
  { email: 'user6@example.com', date: '2024-01-19' },
  { email: 'user2@example.com', date: '2024-01-20' },
  { email: 'user7@example.com', date: '2024-01-20' },
  { email: 'user1@example.com', date: '2024-01-21' },
  { email: 'user4@example.com', date: '2024-01-21' },
  { email: 'user8@example.com', date: '2024-01-22' },
];

const sampleSignups = [
  { email: 'newuser1@example.com', date: '2024-01-15' },
  { email: 'newuser2@example.com', date: '2024-01-16' },
  { email: 'newuser3@example.com', date: '2024-01-17' },
  { email: 'newuser4@example.com', date: '2024-01-18' },
  { email: 'newuser5@example.com', date: '2024-01-19' },
  { email: 'newuser6@example.com', date: '2024-01-20' },
  { email: 'newuser7@example.com', date: '2024-01-21' },
];

const sampleSales = [
  { productId: 1, productName: 'Diamond Pendant Necklace', price: '₹1,299', category: 'necklaces', date: '2024-01-15' },
  { productId: 2, productName: 'Pearl String Necklace', price: '₹899', category: 'necklaces', date: '2024-01-15' },
  { productId: 3, productName: 'Classic Diamond Ring', price: '₹999', category: 'rings', date: '2024-01-16' },
  { productId: 4, productName: 'Pearl Drop Earrings', price: '₹499', category: 'earrings', date: '2024-01-16' },
  { productId: 1, productName: 'Diamond Pendant Necklace', price: '₹1,299', category: 'necklaces', date: '2024-01-17' },
  { productId: 3, productName: 'Classic Diamond Ring', price: '₹999', category: 'rings', date: '2024-01-17' },
  { productId: 2, productName: 'Pearl String Necklace', price: '₹899', category: 'necklaces', date: '2024-01-18' },
  { productId: 4, productName: 'Pearl Drop Earrings', price: '₹499', category: 'earrings', date: '2024-01-18' },
  { productId: 1, productName: 'Diamond Pendant Necklace', price: '₹1,299', category: 'necklaces', date: '2024-01-19' },
  { productId: 3, productName: 'Classic Diamond Ring', price: '₹999', category: 'rings', date: '2024-01-19' },
  { productId: 2, productName: 'Pearl String Necklace', price: '₹899', category: 'necklaces', date: '2024-01-20' },
  { productId: 4, productName: 'Pearl Drop Earrings', price: '₹499', category: 'earrings', date: '2024-01-20' },
  { productId: 1, productName: 'Diamond Pendant Necklace', price: '₹1,299', category: 'necklaces', date: '2024-01-21' },
  { productId: 3, productName: 'Classic Diamond Ring', price: '₹999', category: 'rings', date: '2024-01-21' },
  { productId: 2, productName: 'Pearl String Necklace', price: '₹899', category: 'necklaces', date: '2024-01-22' },
];

async function seedAnalytics() {
  try {
    // Clear existing data
    await LoginAnalytics.deleteMany({});
    await SignupAnalytics.deleteMany({});
    await ProductSale.deleteMany({});

    console.log('Cleared existing analytics data');

    // Insert sample data
    const loginPromises = sampleLogins.map(login => {
      return new LoginAnalytics({
        email: login.email,
        timestamp: new Date(login.date),
        date: login.date
      }).save();
    });

    const signupPromises = sampleSignups.map(signup => {
      return new SignupAnalytics({
        email: signup.email,
        timestamp: new Date(signup.date),
        date: signup.date
      }).save();
    });

    const salePromises = sampleSales.map(sale => {
      return new ProductSale({
        productId: sale.productId,
        productName: sale.productName,
        price: sale.price,
        category: sale.category,
        timestamp: new Date(sale.date),
        date: sale.date
      }).save();
    });

    await Promise.all([...loginPromises, ...signupPromises, ...salePromises]);

    console.log('Sample analytics data seeded successfully!');
    console.log(`- ${sampleLogins.length} login records`);
    console.log(`- ${sampleSignups.length} signup records`);
    console.log(`- ${sampleSales.length} sale records`);

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding analytics data:', error);
    mongoose.connection.close();
  }
}

seedAnalytics(); 