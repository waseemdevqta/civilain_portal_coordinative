const dotenv = require('dotenv');
// 1. Load environment variables FIRST before requiring DB or other modules
dotenv.config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const User = require('./models/User');
const seedDatabase = require('./scripts/seed');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Connect to MongoDB Atlas & seed only if database is completely empty
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(async () => {
    try {
      const userCount = await User.countDocuments({});
      if (userCount === 0) {
        console.log('[Server] Database is empty, auto-seeding demo data...');
        await seedDatabase();
      } else {
        console.log(`[Server] Connected to Atlas. ${userCount} users found in database.`);
      }
    } catch (err) {
      console.error('[Server Auto-Seed Error]:', err.message);
    }
  });
}

const app = express();

// 1. CORS configuration (MUST be registered first before body parsers and routes)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all local origins and reflect origin for credentials support
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Disposition', 'Content-Type'],
  })
);

app.options('*', cors());

// 2. Body parsers (Support up to 50MB for image data and rich multipart payloads)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 3. HTTP request logger in dev
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AWAZ Civic API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// 404 & Centralized Error Handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`[Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`[Health Endpoint] http://localhost:${PORT}/api/health`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`[Unhandled Rejection Error]: ${err.message}`);
    server.close(() => process.exit(1));
  });
}

module.exports = app;
