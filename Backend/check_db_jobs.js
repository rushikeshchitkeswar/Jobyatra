const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Job = require('./models/Job');

const checkJobs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jobyatra');
    const count = await Job.countDocuments();
    console.log(`Total Jobs: ${count}`);
    
    const jobs = await Job.find({ status: 'Active' });
    console.log(`Active Jobs: ${jobs.length}`);
    
    jobs.forEach(j => {
      console.log(JSON.stringify(j, null, 2));
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkJobs();
