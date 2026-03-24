require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./src/config/db');

const authRoutes = require('./src/routes/auth');
const categoryRoutes = require('./src/routes/categories');
const foodRoutes = require('./src/routes/foods');
const orderRoutes = require('./src/routes/orders');
const paymentRoutes = require('./src/routes/payments');
const adminRoutes = require('./src/routes/admin');
const driverRoutes = require('./src/routes/driver');
const newsRoutes = require('./src/routes/news');
const adminNewsRoutes = require('./src/routes/adminNews');

const { swaggerUi, swaggerSpec } = require('./src/config/swagger');

const app = express();

connectDB();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/admin/news', adminNewsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Food Ordering Platform API', docs: '/api-docs' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Docs: http://localhost:${PORT}/api-docs`);
});
