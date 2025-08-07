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

const Product = mongoose.model('Product', productSchema);

// Function to format price consistently
const formatPrice = (price) => {
  if (typeof price === 'string') {
    // Remove existing ₹ symbol, commas, and spaces
    const cleanPrice = price.replace(/[₹,\s]/g, '');
    const numericPrice = parseFloat(cleanPrice);
    if (!isNaN(numericPrice)) {
      return `₹${numericPrice.toLocaleString('en-IN')}`;
    }
  }
  return price;
};

const fixProductPrices = async () => {
  try {
    console.log('Starting to fix product prices...');

    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products`);

    let fixedCount = 0;
    let unchangedCount = 0;

    for (const product of products) {
      const originalPrice = product.price;
      const formattedPrice = formatPrice(product.price);
      
      if (originalPrice !== formattedPrice) {
        console.log(`Fixing price for "${product.name}":`);
        console.log(`  Before: "${originalPrice}"`);
        console.log(`  After:  "${formattedPrice}"`);
        
        product.price = formattedPrice;
        await product.save();
        fixedCount++;
      } else {
        unchangedCount++;
      }
    }

    console.log('\n✅ Price fixing completed!');
    console.log(`- Fixed: ${fixedCount} products`);
    console.log(`- Unchanged: ${unchangedCount} products`);
    console.log(`- Total: ${products.length} products`);

  } catch (error) {
    console.error('Error fixing product prices:', error);
  } finally {
    mongoose.connection.close();
  }
};

fixProductPrices(); 