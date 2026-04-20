const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Job = require('./models/Job');
const { getJobs } = require('./controllers/jobController');

const testController = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jobyatra');

    // Mock req, res, next
    const req = {
      query: {
        search: '',
        location: '',
        salary: '1',
        remote: 'false',
        experience: 'Any',
        type: 'Full Time',
        skills: '',
        sort: 'latest'
      }
    };

    let responseData = null;
    const res = {
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        responseData = data;
      }
    };

    const next = (err) => {
      console.error('Next called with error:', err);
    };

    // console.log('--- Calling getJobs Controller ---');
    await getJobs(req, res, next);
    // console.log('--- Controller Execution Finished ---');

    // console.log('Response Status:', res.statusCode || 200);
    // console.log('Response Data Count:', responseData ? responseData.count : 'N/A');
    // console.log('Response Data Length:', responseData && responseData.data ? responseData.data.length : 'N/A');

    process.exit(0);
  } catch (err) {
    console.error('Test Execution Error:', err);
    process.exit(1);
  }
};

testController();
