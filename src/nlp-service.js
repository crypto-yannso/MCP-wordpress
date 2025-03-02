const { NlpManager } = require('node-nlp');
const { OpenAI } = require('openai');
const config = require('../config/config');

class NLPService {
  constructor() {
    this.manager = new NlpManager({ languages: ['en'], forceNER: true });
    this.openai = null;
    
    if (config.ai.openaiApiKey) {
      this.openai = new OpenAI({
        apiKey: config.ai.openaiApiKey
      });
    }
    
    this.setupNLP();
  }

  async setupNLP() {
    // Intents for WordPress operations
    this.addPostIntents();
    this.addPageIntents();
    this.addMediaIntents();
    this.addUserIntents();
    this.addCategoryIntents();
    this.addTagIntents();
    this.addCommentIntents();
    this.addMenuIntents();
    this.addPluginIntents();
    this.addSettingIntents();
    
    // Train the NLP manager
    await this.manager.train();
  }

  addPostIntents() {
    // Get posts
    this.manager.addDocument('en', 'get all posts', 'wpapi.posts.get');
    this.manager.addDocument('en', 'list posts', 'wpapi.posts.get');
    this.manager.addDocument('en', 'show me the posts', 'wpapi.posts.get');
    this.manager.addDocument('en', 'retrieve posts', 'wpapi.posts.get');
    this.manager.addDocument('en', 'fetch posts', 'wpapi.posts.get');
    
    // Get a specific post
    this.manager.addDocument('en', 'get post with id %id%', 'wpapi.posts.getById');
    this.manager.addDocument('en', 'show post %id%', 'wpapi.posts.getById');
    this.manager.addDocument('en', 'find post by id %id%', 'wpapi.posts.getById');
    this.manager.addDocument('en', 'retrieve post %id%', 'wpapi.posts.getById');
    
    // Create a post
    this.manager.addDocument('en', 'create a post', 'wpapi.posts.create');
    this.manager.addDocument('en', 'add a new post', 'wpapi.posts.create');
    this.manager.addDocument('en', 'publish a post', 'wpapi.posts.create');
    this.manager.addDocument('en', 'write a post', 'wpapi.posts.create');
    
    // Update a post
    this.manager.addDocument('en', 'update post %id%', 'wpapi.posts.update');
    this.manager.addDocument('en', 'edit post %id%', 'wpapi.posts.update');
    this.manager.addDocument('en', 'modify post %id%', 'wpapi.posts.update');
    this.manager.addDocument('en', 'change post %id%', 'wpapi.posts.update');
    
    // Delete a post
    this.manager.addDocument('en', 'delete post %id%', 'wpapi.posts.delete');
    this.manager.addDocument('en', 'remove post %id%', 'wpapi.posts.delete');
    this.manager.addDocument('en', 'trash post %id%', 'wpapi.posts.delete');
  }

  addPageIntents() {
    // Get pages
    this.manager.addDocument('en', 'get all pages', 'wpapi.pages.get');
    this.manager.addDocument('en', 'list pages', 'wpapi.pages.get');
    this.manager.addDocument('en', 'show me the pages', 'wpapi.pages.get');
    
    // Get a specific page
    this.manager.addDocument('en', 'get page with id %id%', 'wpapi.pages.getById');
    this.manager.addDocument('en', 'show page %id%', 'wpapi.pages.getById');
    
    // Create a page
    this.manager.addDocument('en', 'create a page', 'wpapi.pages.create');
    this.manager.addDocument('en', 'add a new page', 'wpapi.pages.create');
    
    // Update a page
    this.manager.addDocument('en', 'update page %id%', 'wpapi.pages.update');
    this.manager.addDocument('en', 'edit page %id%', 'wpapi.pages.update');
    
    // Delete a page
    this.manager.addDocument('en', 'delete page %id%', 'wpapi.pages.delete');
    this.manager.addDocument('en', 'remove page %id%', 'wpapi.pages.delete');
  }

  addMediaIntents() {
    // Get media
    this.manager.addDocument('en', 'get all media', 'wpapi.media.get');
    this.manager.addDocument('en', 'list media', 'wpapi.media.get');
    this.manager.addDocument('en', 'show me the media items', 'wpapi.media.get');
    
    // Get a specific media item
    this.manager.addDocument('en', 'get media with id %id%', 'wpapi.media.getById');
    this.manager.addDocument('en', 'show media %id%', 'wpapi.media.getById');
    
    // Upload media
    this.manager.addDocument('en', 'upload media', 'wpapi.media.upload');
    this.manager.addDocument('en', 'upload a file', 'wpapi.media.upload');
    this.manager.addDocument('en', 'add an image', 'wpapi.media.upload');
    
    // Delete media
    this.manager.addDocument('en', 'delete media %id%', 'wpapi.media.delete');
    this.manager.addDocument('en', 'remove media %id%', 'wpapi.media.delete');
  }

  addUserIntents() {
    // Get users
    this.manager.addDocument('en', 'get all users', 'wpapi.users.get');
    this.manager.addDocument('en', 'list users', 'wpapi.users.get');
    this.manager.addDocument('en', 'show me the users', 'wpapi.users.get');
    
    // Get a specific user
    this.manager.addDocument('en', 'get user with id %id%', 'wpapi.users.getById');
    this.manager.addDocument('en', 'show user %id%', 'wpapi.users.getById');
    
    // Create a user
    this.manager.addDocument('en', 'create a user', 'wpapi.users.create');
    this.manager.addDocument('en', 'add a new user', 'wpapi.users.create');
    this.manager.addDocument('en', 'register a user', 'wpapi.users.create');
    
    // Update a user
    this.manager.addDocument('en', 'update user %id%', 'wpapi.users.update');
    this.manager.addDocument('en', 'edit user %id%', 'wpapi.users.update');
    
    // Delete a user
    this.manager.addDocument('en', 'delete user %id%', 'wpapi.users.delete');
    this.manager.addDocument('en', 'remove user %id%', 'wpapi.users.delete');
  }

  addCategoryIntents() {
    // Get categories
    this.manager.addDocument('en', 'get all categories', 'wpapi.categories.get');
    this.manager.addDocument('en', 'list categories', 'wpapi.categories.get');
    this.manager.addDocument('en', 'show me the categories', 'wpapi.categories.get');
    
    // Get a specific category
    this.manager.addDocument('en', 'get category with id %id%', 'wpapi.categories.getById');
    this.manager.addDocument('en', 'show category %id%', 'wpapi.categories.getById');
    
    // Create a category
    this.manager.addDocument('en', 'create a category', 'wpapi.categories.create');
    this.manager.addDocument('en', 'add a new category', 'wpapi.categories.create');
    
    // Update a category
    this.manager.addDocument('en', 'update category %id%', 'wpapi.categories.update');
    this.manager.addDocument('en', 'edit category %id%', 'wpapi.categories.update');
    
    // Delete a category
    this.manager.addDocument('en', 'delete category %id%', 'wpapi.categories.delete');
    this.manager.addDocument('en', 'remove category %id%', 'wpapi.categories.delete');
  }

  addTagIntents() {
    // Get tags
    this.manager.addDocument('en', 'get all tags', 'wpapi.tags.get');
    this.manager.addDocument('en', 'list tags', 'wpapi.tags.get');
    this.manager.addDocument('en', 'show me the tags', 'wpapi.tags.get');
    
    // Get a specific tag
    this.manager.addDocument('en', 'get tag with id %id%', 'wpapi.tags.getById');
    this.manager.addDocument('en', 'show tag %id%', 'wpapi.tags.getById');
    
    // Create a tag
    this.manager.addDocument('en', 'create a tag', 'wpapi.tags.create');
    this.manager.addDocument('en', 'add a new tag', 'wpapi.tags.create');
    
    // Update a tag
    this.manager.addDocument('en', 'update tag %id%', 'wpapi.tags.update');
    this.manager.addDocument('en', 'edit tag %id%', 'wpapi.tags.update');
    
    // Delete a tag
    this.manager.addDocument('en', 'delete tag %id%', 'wpapi.tags.delete');
    this.manager.addDocument('en', 'remove tag %id%', 'wpapi.tags.delete');
  }

  addCommentIntents() {
    // Get comments
    this.manager.addDocument('en', 'get all comments', 'wpapi.comments.get');
    this.manager.addDocument('en', 'list comments', 'wpapi.comments.get');
    this.manager.addDocument('en', 'show me the comments', 'wpapi.comments.get');
    
    // Get a specific comment
    this.manager.addDocument('en', 'get comment with id %id%', 'wpapi.comments.getById');
    this.manager.addDocument('en', 'show comment %id%', 'wpapi.comments.getById');
    
    // Create a comment
    this.manager.addDocument('en', 'create a comment', 'wpapi.comments.create');
    this.manager.addDocument('en', 'add a new comment', 'wpapi.comments.create');
    this.manager.addDocument('en', 'post a comment', 'wpapi.comments.create');
    
    // Update a comment
    this.manager.addDocument('en', 'update comment %id%', 'wpapi.comments.update');
    this.manager.addDocument('en', 'edit comment %id%', 'wpapi.comments.update');
    
    // Delete a comment
    this.manager.addDocument('en', 'delete comment %id%', 'wpapi.comments.delete');
    this.manager.addDocument('en', 'remove comment %id%', 'wpapi.comments.delete');
  }

  addMenuIntents() {
    // Get menus
    this.manager.addDocument('en', 'get all menus', 'wpapi.menus.get');
    this.manager.addDocument('en', 'list menus', 'wpapi.menus.get');
    this.manager.addDocument('en', 'show me the menus', 'wpapi.menus.get');
    
    // Get a specific menu
    this.manager.addDocument('en', 'get menu with id %id%', 'wpapi.menus.getById');
    this.manager.addDocument('en', 'show menu %id%', 'wpapi.menus.getById');
  }

  addPluginIntents() {
    // Get plugins
    this.manager.addDocument('en', 'get all plugins', 'wpapi.plugins.get');
    this.manager.addDocument('en', 'list plugins', 'wpapi.plugins.get');
    this.manager.addDocument('en', 'show me the plugins', 'wpapi.plugins.get');
    
    // Get a specific plugin
    this.manager.addDocument('en', 'get plugin %plugin%', 'wpapi.plugins.getByName');
    this.manager.addDocument('en', 'show plugin %plugin%', 'wpapi.plugins.getByName');
    
    // Activate a plugin
    this.manager.addDocument('en', 'activate plugin %plugin%', 'wpapi.plugins.activate');
    this.manager.addDocument('en', 'enable plugin %plugin%', 'wpapi.plugins.activate');
    
    // Deactivate a plugin
    this.manager.addDocument('en', 'deactivate plugin %plugin%', 'wpapi.plugins.deactivate');
    this.manager.addDocument('en', 'disable plugin %plugin%', 'wpapi.plugins.deactivate');
  }

  addSettingIntents() {
    // Get settings
    this.manager.addDocument('en', 'get all settings', 'wpapi.settings.get');
    this.manager.addDocument('en', 'list settings', 'wpapi.settings.get');
    this.manager.addDocument('en', 'show me the settings', 'wpapi.settings.get');
    
    // Update settings
    this.manager.addDocument('en', 'update settings', 'wpapi.settings.update');
    this.manager.addDocument('en', 'modify settings', 'wpapi.settings.update');
    this.manager.addDocument('en', 'change settings', 'wpapi.settings.update');
  }

  async processNaturalLanguage(text, siteConfig) {
    try {
      // First try with the NLP manager
      const result = await this.manager.process('en', text);
      
      // If confidence is high enough, return the parsed intent
      if (result.intent && result.score > 0.7) {
        const intent = this.parseIntent(result.intent);
        const entities = this.extractEntities(result.entities);
        
        return {
          success: true,
          intent: intent,
          entities: entities,
          siteConfig: siteConfig
        };
      }
      
      // If NLP manager fails, try with OpenAI
      if (this.openai) {
        return await this.processWithOpenAI(text, siteConfig);
      }
      
      // If all else fails
      return {
        success: false,
        error: 'Unable to understand the request',
        nlpResult: result
      };
    } catch (error) {
      console.error('NLP processing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async processWithOpenAI(text, siteConfig) {
    try {
      const system = `You are a WordPress API assistant. Your task is to convert natural language requests into API operations.
      
      Output a JSON object with the following structure:
      {
        "method": "GET|POST|PUT|DELETE", // The HTTP method to use
        "endpoint": "string", // The WordPress API endpoint (e.g., "posts", "pages/123", etc.)
        "params": {}, // For GET requests: URL parameters
        "data": {} // For POST/PUT requests: Request body
      }
      
      Examples:
      1. Input: "Show me all the posts"
         Output: {"method": "GET", "endpoint": "posts", "params": {}}
      
      2. Input: "Create a new post called 'Hello World' with content 'This is my first post'"
         Output: {"method": "POST", "endpoint": "posts", "data": {"title": "Hello World", "content": "This is my first post"}}
      
      3. Input: "Update post 123 to set the title to 'New Title'"
         Output: {"method": "PUT", "endpoint": "posts/123", "data": {"title": "New Title"}}
      
      4. Input: "Delete the post with ID 456"
         Output: {"method": "DELETE", "endpoint": "posts/456"}
      
      Supported resources: posts, pages, media, users, categories, tags, comments, menus, plugins, settings
      
      Only respond with valid JSON. Do not include any explanations or additional text.`;

      const response = await this.openai.chat.completions.create({
        model: config.ai.openaiModel,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: text }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0].message.content;
      const parsed = JSON.parse(content);
      
      return {
        success: true,
        method: parsed.method,
        endpoint: parsed.endpoint,
        params: parsed.params || {},
        data: parsed.data || {},
        siteConfig: siteConfig
      };
    } catch (error) {
      console.error('OpenAI processing error:', error);
      return {
        success: false,
        error: 'AI processing failed: ' + error.message
      };
    }
  }

  parseIntent(intent) {
    const parts = intent.split('.');
    return {
      resource: parts[1],
      action: parts[2]
    };
  }

  extractEntities(entities) {
    const result = {};
    
    if (!entities || entities.length === 0) {
      return result;
    }
    
    entities.forEach(entity => {
      result[entity.entity] = entity.option || entity.utterance;
    });
    
    return result;
  }
}

module.exports = new NLPService();