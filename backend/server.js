const express = require('express');
const connectDB = require('./config/mongodb')
const cors = require('cors');
require('dotenv').config();
const path = require("path");

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

const auth_Routes = require("./routes/authRoutes");

const subCategoryRoutes = require("./routes/subCategoryRoutes");
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const detectionRoutes = require('./routes/detectionRoutes');

// const vendorCitiesRoutes = require('./routes/vendorCitiesRoutes');

const locationRoutes = require('./routes/locationRoutes');
const addressRoutes = require('./routes/addressRoutes');

// Create Express app
const app = express();

connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use('/folder', express.static('folder'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use("/api/user", auth_Routes);
app.use("/api/user", subCategoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/category', categoryRoutes);

// app.use('/api/detection', detectionRoutes);

// app.use('/api/vendor-cities', vendorCitiesRoutes);

app.use('/api/location', locationRoutes);

app.use('/api/address', addressRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Plant Backend API' });
});

// Error handler middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({ 
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`Server is running on port ${PORT}`);
// });