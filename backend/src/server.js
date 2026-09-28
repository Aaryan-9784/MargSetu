require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

// Route files
const authRoutes = require('./routes/authRoutes');
const assetRoutes = require('./routes/assetRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const lifecycleRoutes = require('./routes/lifecycleRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API
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

let server;

// Start server after DB connection
const startServer = async () => {
  await connectDB();

  // Check if we need to auto-seed when database has zero users
  const User = require('./models/User');
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('🌱 Database is empty. Running automatic seed with realistic transportation assets...');
    const { seedData } = require('./seed');
    try {
      await seedData();
      console.log('✅ Automatic database seeding completed!');
    } catch (seedErr) {
      console.error('Seed error:', seedErr);
    }
  }

  server = app.listen(PORT, () => {
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

module.exports = { app, startServer };
