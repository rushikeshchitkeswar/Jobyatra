const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Job = require('./models/Job');

const testQuery = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jobyatra');

    // Test the exact query that failed
    const queryObj = { status: 'Active', salaryValue: { $gte: 1 } };
    // console.log('Testing Query:', JSON.stringify(queryObj, null, 2));

    const results = await Job.find(queryObj);
    // console.log(`Results found: ${results.length}`);

    if (results.length === 0) {
      // console.log('Sample Job from DB for comparison:');
      const sample = await Job.findOne();
      // console.log(JSON.stringify(sample, null, 2));
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

testQuery();
