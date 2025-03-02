const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
const setupRoutes = require('./src/routes');
const config = require('./config/config');

// Initialize Express app
const app = express();
const PORT = config.server.port;
const HOST = config.server.host;

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(morgan('combined')); // HTTP request logging

// Add multer middleware for handling file uploads
app.use((req, res, next) => {
  if (req.path === '/api/wordpress/media' && req.method.toLowerCase() === 'post') {
    upload.single('file')(req, res, next);
  } else {
    next();
  }
});

// Set up API routes
setupRoutes(app);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Server error',
    message: err.message
  });
});

// Start the server
app.listen(PORT, HOST, () => {
  console.log(`MCP WordPress API Server running at http://${HOST}:${PORT}`);
  console.log(`API endpoint: http://${HOST}:${PORT}/api/wordpress`);
});

module.exports = app; // Export for testing