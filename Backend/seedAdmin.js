const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load env vars
dotenv.config();

/**
 * Seed Admin User
 * This script connects to the database, checks if an admin exists,
 * and creates one if it doesn't.
 */
const seedAdmin = async () => {
  try {
    // 1. Connect to MongoDB
    // console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    // console.log('MongoDB Connected.');

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('Error: ADMIN_EMAIL or ADMIN_PASSWORD not found in .env');
      process.exit(1);
    }

    // 2. Check if admin already exists
    const adminExists = await User.findOne({ email: adminEmail });

    if (adminExists) {
      // console.log(`Admin user with email ${adminEmail} already exists.`);
      process.exit(0);
    }

    // 3. Create admin user
    // Note: The User model pre-save hook will handle password hashing
    const admin = await User.create({
      name: 'Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });

    // console.log('Admin user created successfully:');
    // console.log(`Name: ${admin.name}`);
    // console.log(`Email: ${admin.email}`);
    // console.log(`Role: ${admin.role}`);

    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err.message);
    process.exit(1);
  }
};

// Run the script
seedAdmin();
