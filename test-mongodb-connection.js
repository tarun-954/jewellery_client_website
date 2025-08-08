import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function testConnection() {
  console.log('Testing MongoDB connection...');
  console.log('MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');
  
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI environment variable is not set');
    console.log('Please set MONGO_URI in your .env file or environment variables');
    process.exit(1);
  }

  try {
    console.log('Attempting to connect to MongoDB...');
    
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Successfully connected to MongoDB!');
    
    // Test a simple operation
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📊 Available collections:', collections.map(c => c.name));
    
    // Test if we can perform a simple query
    const testCollection = db.collection('test');
    await testCollection.insertOne({ test: 'connection', timestamp: new Date() });
    console.log('✅ Database write test successful');
    
    await testCollection.deleteOne({ test: 'connection' });
    console.log('✅ Database delete test successful');
    
    console.log('🎉 All tests passed! MongoDB connection is working correctly.');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    if (error.message.includes('Authentication failed')) {
      console.log('💡 This might be an authentication issue. Check:');
      console.log('   - Username and password in connection string');
      console.log('   - Database user permissions');
    } else if (error.message.includes('Network timeout')) {
      console.log('💡 This might be a network issue. Check:');
      console.log('   - Network access settings in MongoDB Atlas');
      console.log('   - Connection string format');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('💡 This might be a DNS issue. Check:');
      console.log('   - Connection string format');
      console.log('   - Cluster name and domain');
    }
    
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
  }
}

testConnection();
