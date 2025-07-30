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
  process.exit(1);
});

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  isAdmin: { type: Boolean, default: false },
});
const User = mongoose.model('User', userSchema);

async function setAdminStatus() {
  try {
    const email = 'admin@tarun.com';
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found. Please create the user first with email:', email);
      return;
    }
    
    user.isAdmin = true;
    await user.save();
    console.log('Admin status set successfully for:', email);
  } catch (error) {
    console.error('Error setting admin status:', error);
  } finally {
    mongoose.connection.close();
  }
}

setAdminStatus(); 