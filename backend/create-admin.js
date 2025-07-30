require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  isAdmin: { type: Boolean, default: false },
});
const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    const email = 'admin@tarun.com';
    const password = 'admin123';
    const name = 'Admin';
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists. Setting admin status...');
      existingUser.isAdmin = true;
      await existingUser.save();
      console.log('Admin status set successfully for:', email);
      return;
    }
    
    // Create new admin user
    const hashedPassword = await bcrypt.hash(password, 10);
    const adminUser = new User({
      name,
      email,
      password: hashedPassword,
      isAdmin: true
    });
    
    await adminUser.save();
    console.log('Admin user created successfully:', email);
    console.log('Password:', password);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
  }
}

createAdminUser(); 