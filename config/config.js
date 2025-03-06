// Assurons-nous que les variables d'environnement sont disponibles
require('dotenv').config();

// Afficher les variables d'environnement au chargement du fichier de configuration
console.log('Dans config.js - Variables d\'environnement WordPress:', {
  WP_URL: process.env.WP_URL,
  WP_USERNAME: process.env.WP_USERNAME,
  WP_APP_PASSWORD: process.env.WP_APP_PASSWORD ? 'DÉFINI' : 'NON DÉFINI'
});

module.exports = {
  // WordPress site configuration
  wpConfig: {
    url: process.env.WP_URL || 'https://example.com',
    username: process.env.WP_USERNAME,
    password: process.env.WP_PASSWORD,
    // For clients using application passwords
    appPassword: process.env.WP_APP_PASSWORD
  },
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost'
  },
  // NLP/AI configuration
  ai: {
    provider: process.env.AI_PROVIDER || 'anthropic', // 'openai' ou 'anthropic'
    openaiApiKey: process.env.OPENAI_API_KEY,
    openaiModel: process.env.OPENAI_MODEL || 'gpt-4-turbo',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20240620'
  }
};