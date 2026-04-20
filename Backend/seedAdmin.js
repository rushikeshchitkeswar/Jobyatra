const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load env vars
dotenv.config();

/**
 * Seed Admin User
 * Can be called as a standalone script: node seedAdmin.js
 * Or imported into server.js and called after DB connects.
 */
const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.warn('[SeedAdmin] ADMIN_EMAIL or ADMIN_PASSWORD not set in .env — skipping seed.');
      return;
    }

    // Check if admin already exists
    const adminExists = await User.findOne({ email: adminEmail, role: 'admin' });

    if (adminExists) {
      console.log(`[SeedAdmin] Admin already exists: ${adminEmail}`);
      return;
    }

    // Create admin user (password hashed by User model pre-save hook)
    const admin = await User.create({
      name: 'Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });

    console.log('[SeedAdmin] Admin user created successfully!');
    console.log(`  Name:  ${admin.name}`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  Role:  ${admin.role}`);
  } catch (err) {
    console.error('[SeedAdmin] Error seeding admin:', err.message);
  }
};

// Only auto-connect and run when this file is executed directly
// e.g. `node seedAdmin.js`
if (require.main === module) {
  (async () => {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected.');
    await seedAdmin();
    process.exit(0);
  })();
}

module.exports = seedAdmin;
