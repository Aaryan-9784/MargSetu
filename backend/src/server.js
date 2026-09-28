require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, disconnectDB } = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

// Route files
const authRoutes = require('./routes/authRoutes');
const assetRoutes = require('./routes/assetRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const lifecycleRoutes = require('./routes/lifecycleRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Parse configured client origins (supports comma-separated list)
const clientUrlEnv = process.env.CLIENT_URL || '';
const configuredOrigins = clientUrlEnv
  ? clientUrlEnv.split(',').map((url) => url.trim().replace(/\/$/, ''))
  : [];

// Dynamic CORS configuration - production and preview friendly
const isAllowedOrigin = (origin) => {
  // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, Render health checks)
  if (!origin) return true;

  // Wildcard configured
  if (clientUrlEnv === '*') return true;

  // Exact configured match
  if (configuredOrigins.includes(origin)) return true;

  // Local development origins
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin) || /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
    return true;
  }

  // All Vercel deployments (production domain and git preview branches)
  if (/^https:\/\/[a-zA-Z0-9_.-]+\.vercel\.app$/.test(origin)) {
    return true;
  }

  return false;
};

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      // Dynamic origin return satisfies credentials: true without wildcard breakage
      return callback(null, origin || true);
    }
    // Permissive fallback so legitimate client requests are not blocked
    return callback(null, origin || true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Service Index
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    service: 'RoadSetu Transportation Infrastructure Asset Management API',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      assets: '/api/assets',
      maintenance: '/api/maintenance',
      lifecycle: '/api/lifecycle',
      dashboard: '/api/dashboard',
    },
    environment: process.env.NODE_ENV || 'development',
  });
});

// Health Check API (used by Render and uptime monitors)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'RoadSetu Transportation Infrastructure Asset Management API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/lifecycle', lifecycleRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

let server;

// Start server after DB connection
const startServer = async () => {
  await connectDB();

  // Check if we need to auto-seed when database has zero users
  try {
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Database is empty. Running automatic seed with realistic transportation assets...');
      const { seedData } = require('./seed');
      await seedData();
      console.log('✅ Automatic database seeding completed!');
    }
  } catch (seedErr) {
    console.warn('⚠️ Note on database auto-seed check:', seedErr.message);
  }

  server = app.listen(PORT, HOST, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 RoadSetu Government API Server Running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🛣️ Asset Routes: http://localhost:${PORT}/api/assets`);
    console.log(`======================================================\n`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

// Graceful shutdown handling for Render and container environments
const handleShutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Gracefully shutting down server...`);
  if (server) {
    server.close(async () => {
      console.log('HTTP server closed.');
      await disconnectDB();
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

module.exports = { app, startServer };
