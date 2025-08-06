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

// Initial products data
const initialProducts = [
  {
    name: 'Diamond Pendant Necklace',
    price: '₹1,299',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80',
    category: 'necklaces',
    description: 'Elegant diamond pendant necklace featuring a stunning solitaire diamond set in 18k white gold. Perfect for special occasions.',
    material: '18k White Gold',
    inStock: true
  },
  {
    name: 'Pearl String Necklace',
    price: '₹899',
    image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&q=80',
    category: 'necklaces',
    description: 'Classic pearl string necklace with perfectly matched cultured pearls. A timeless piece for any collection.',
    material: 'Silver',
    inStock: true
  },
  {
    name: 'Classic Diamond Ring',
    price: '₹999',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80',
    category: 'rings',
    description: 'Beautiful diamond ring featuring a round brilliant cut diamond in a classic setting. Ideal for engagements.',
    material: '18k White Gold',
    inStock: true
  },
  {
    name: 'Pearl Drop Earrings',
    price: '₹499',
    image: 'https://images.unsplash.com/photo-1635767798638-3665c302e27c?auto=format&fit=crop&q=80',
    category: 'earrings',
    description: 'Elegant pearl drop earrings with diamond accents. Perfect for both formal events and everyday wear.',
    material: 'Silver',
    inStock: true
  },
  {
    name: 'Gold Wedding Bracelet',
    price: '₹1,599',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80',
    category: 'bracelets',
    description: 'Exquisite gold wedding bracelet with intricate traditional designs. Perfect for bridal jewelry collection.',
    material: '22k Gold',
    inStock: true
  },
  {
    name: 'Luxury Diamond Set',
    price: '₹2,999',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80',
    category: 'luxury',
    description: 'Premium luxury diamond set including necklace, earrings, and ring. The ultimate statement piece.',
    material: '18k White Gold',
    inStock: true
  }
];

async function seedProducts() {
  try {
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert initial products
    const productPromises = initialProducts.map(product => {
      return new Product(product).save();
    });

    await Promise.all(productPromises);

    console.log('Sample products seeded successfully!');
    console.log(`- ${initialProducts.length} products added`);

    // Display added products
    const products = await Product.find();
    console.log('\nAdded products:');
    products.forEach(product => {
      console.log(`- ${product.name} (${product.category}) - ${product.price}`);
    });

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding products:', error);
    mongoose.connection.close();
  }
}

seedProducts(); 