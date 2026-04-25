const dotenv = require('dotenv');

// Load environment variables FIRST before any other requires that depend on env vars
dotenv.config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const { globalLimiter, authLimiter, uploadLimiter } = require('./middleware/rateLimiter');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const Admin = require('./routes/adminRoutes');
const Candidate = require('./candidate/routes/candidateRoutes');
const Recruiter = require('./routes/recruiterRoutes');
const contactRoutes = require('./routes/contactRoutes');
const seedAdmin = require('./seedAdmin');
const path = require("path");

// Initialize Express app
const app = express();


// Body parser
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cookieParser());

// Security headers
app.use(helmet());

// Enable CORS (Allow frontend URL)
app.use(cors());

// Logging middleware
// if (process.env.NODE_ENV === 'production') {
//   app.use(morgan('dev'));
// }

// Rate limiting
app.use(globalLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/upload', uploadLimiter);

// Setup routes
// NOTE: We will create authRoutes.js in the next step


app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/recruiter', Recruiter);
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/interviews', require('./routes/interviewRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/candidate', Candidate);
app.use('/api/admin', Admin);
app.use('/api/contact', contactRoutes);

// Basic health check route
// app.get('/', (req, res) => {
//   res.send('JobYatra API is running...');
// });

// const __dirname = path.resolve();

if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '..', 'Frontend', 'dist');
  app.use(express.static(buildPath));
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}
else {
  app.get('/', (req, res) => {
    res.send('JobYatra API is running...');
  });
}

// Centralized error middleware
app.use(errorHandler);
// Health check already defined at line 69, so no extra code needed here.


// Define PORT
const PORT = process.env.PORT || 5000;

// Async startup: connect DB, seed admin, then start server
const startServer = async () => {
  // 1. Connect to database
  await connectDB();

  // 2. Seed admin user if not exists
  await seedAdmin();

  // 3. Start listening
  const server = app.listen(PORT, () => {
    console.log(
      `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    );
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

startServer();

module.exports = app;
