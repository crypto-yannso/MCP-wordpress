const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
const setupRoutes = require('./src/routes');
const config = require('./config/config');

// Charger les variables d'environnement depuis le fichier .env
dotenv.config();
console.log('Variables d\'environnement chargées depuis .env');

// Vérifier les variables WordPress chargées
console.log('Variables WordPress après chargement:', {
  WP_URL: process.env.WP_URL,
  WP_USERNAME: process.env.WP_USERNAME,
  WP_APP_PASSWORD: process.env.WP_APP_PASSWORD ? 'DÉFINI' : 'NON DÉFINI'
});

// Afficher les informations sur le modèle IA configuré
console.log('Configuration IA:');
console.log('- Fournisseur:', process.env.AI_PROVIDER || config.ai.provider || 'anthropic');
console.log('- Modèle Anthropic:', process.env.ANTHROPIC_MODEL || config.ai.anthropicModel || 'non configuré');
console.log('- Modèle OpenAI:', process.env.OPENAI_MODEL || config.ai.openaiModel || 'non configuré');

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