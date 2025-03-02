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
    openaiApiKey: process.env.OPENAI_API_KEY,
    openaiModel: process.env.OPENAI_MODEL || 'gpt-4-turbo'
  }
};