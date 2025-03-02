const nlpService = require('./nlp-service');
const WordPressAPI = require('./wp-api');

/**
 * Handles natural language commands and interfaces with WordPress API
 */
class NLPController {
  /**
   * Process a natural language request to WordPress API
   */
  async processRequest(req, res) {
    try {
      // Extract site configuration from request
      const siteConfig = {
        url: req.body.site_url || req.query.site_url,
        username: req.body.username || req.query.username
      };
      
      // Check for app password or regular password
      if (req.body.app_password || req.query.app_password) {
        siteConfig.appPassword = req.body.app_password || req.query.app_password;
      } else if (req.body.password || req.query.password) {
        siteConfig.password = req.body.password || req.query.password;
      }

      // Validate required params
      if (!siteConfig.url) {
        return res.status(400).json({ error: 'Missing site_url parameter' });
      }

      if (!siteConfig.username || (!siteConfig.appPassword && !siteConfig.password)) {
        return res.status(400).json({ error: 'Missing authentication parameters' });
      }

      // Get natural language query from request
      const nlQuery = req.body.query || req.query.query;
      
      if (!nlQuery) {
        return res.status(400).json({ error: 'Missing query parameter' });
      }
      
      // Process the natural language query
      const nlpResult = await nlpService.processNaturalLanguage(nlQuery, siteConfig);
      
      if (!nlpResult.success) {
        return res.status(400).json({ 
          error: 'Failed to process natural language query',
          details: nlpResult.error
        });
      }
      
      // Create WordPress API instance
      const api = new WordPressAPI(siteConfig);
      
      // Authenticate
      const authSuccess = await api.authenticate();
      
      if (!authSuccess) {
        return res.status(401).json({ error: 'Authentication failed' });
      }
      
      // Execute the WordPress API operation based on NLP result
      const result = await this.executeOperation(api, nlpResult);
      
      // Return result to client
      return res.json({
        success: true,
        query: nlQuery,
        interpretation: this.generateInterpretation(nlpResult),
        result: result
      });
    } catch (error) {
      console.error('NLP Controller error:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  /**
   * Execute a WordPress API operation based on NLP result
   */
  async executeOperation(api, nlpResult) {
    // If result has method and endpoint (from OpenAI)
    if (nlpResult.method && nlpResult.endpoint) {
      return await this.executeRestOperation(api, nlpResult);
    }
    
    // If result has intent (from NLP manager)
    if (nlpResult.intent) {
      return await this.executeIntentOperation(api, nlpResult);
    }
    
    throw new Error('Invalid NLP result format');
  }

  /**
   * Execute a REST operation from OpenAI result
   */
  async executeRestOperation(api, nlpResult) {
    const { method, endpoint, params, data } = nlpResult;
    
    return await api.request(method.toLowerCase(), endpoint, data, params);
  }

  /**
   * Execute an operation based on NLP intent
   */
  async executeIntentOperation(api, nlpResult) {
    const { intent, entities } = nlpResult;
    const { resource, action } = intent;
    
    switch (resource) {
      case 'posts':
        return await this.handlePostsOperation(api, action, entities);
      case 'pages':
        return await this.handlePagesOperation(api, action, entities);
      case 'media':
        return await this.handleMediaOperation(api, action, entities);
      case 'users':
        return await this.handleUsersOperation(api, action, entities);
      case 'categories':
        return await this.handleCategoriesOperation(api, action, entities);
      case 'tags':
        return await this.handleTagsOperation(api, action, entities);
      case 'comments':
        return await this.handleCommentsOperation(api, action, entities);
      case 'menus':
        return await this.handleMenusOperation(api, action, entities);
      case 'plugins':
        return await this.handlePluginsOperation(api, action, entities);
      case 'settings':
        return await this.handleSettingsOperation(api, action, entities);
      default:
        throw new Error(`Unsupported resource: ${resource}`);
    }
  }

  /**
   * Handle posts operations
   */
  async handlePostsOperation(api, action, entities) {
    switch (action) {
      case 'get':
        return await api.getPosts();
      case 'getById':
        if (!entities.id) {
          throw new Error('Post ID is required');
        }
        return await api.getPost(entities.id);
      case 'create':
        // In a real application, you would extract post data from the entities
        // For simplicity, we're just creating a basic post here
        return await api.createPost({
          title: entities.title || 'New Post',
          content: entities.content || 'Post content',
          status: 'draft'
        });
      case 'update':
        if (!entities.id) {
          throw new Error('Post ID is required');
        }
        return await api.updatePost(entities.id, {
          title: entities.title,
          content: entities.content
        });
      case 'delete':
        if (!entities.id) {
          throw new Error('Post ID is required');
        }
        return await api.deletePost(entities.id);
      default:
        throw new Error(`Unsupported action for posts: ${action}`);
    }
  }

  /**
   * Handle pages operations
   */
  async handlePagesOperation(api, action, entities) {
    switch (action) {
      case 'get':
        return await api.getPages();
      case 'getById':
        if (!entities.id) {
          throw new Error('Page ID is required');
        }
        return await api.getPage(entities.id);
      case 'create':
        return await api.createPage({
          title: entities.title || 'New Page',
          content: entities.content || 'Page content',
          status: 'draft'
        });
      case 'update':
        if (!entities.id) {
          throw new Error('Page ID is required');
        }
        return await api.updatePage(entities.id, {
          title: entities.title,
          content: entities.content
        });
      case 'delete':
        if (!entities.id) {
          throw new Error('Page ID is required');
        }
        return await api.deletePage(entities.id);
      default:
        throw new Error(`Unsupported action for pages: ${action}`);
    }
  }

  /**
   * Handle media operations
   */
  async handleMediaOperation(api, action, entities) {
    switch (action) {
      case 'get':
        return await api.getMedia();
      case 'getById':
        if (!entities.id) {
          throw new Error('Media ID is required');
        }
        return await api.getMediaItem(entities.id);
      case 'upload':
        // This would typically be handled differently since it requires a file
        throw new Error('Media upload via natural language is not supported');
      case 'delete':
        if (!entities.id) {
          throw new Error('Media ID is required');
        }
        return await api.deleteMedia(entities.id);
      default:
        throw new Error(`Unsupported action for media: ${action}`);
    }
  }

  /**
   * Handle users operations
   */
  async handleUsersOperation(api, action, entities) {
    switch (action) {
      case 'get':
        return await api.getUsers();
      case 'getById':
        if (!entities.id) {
          throw new Error('User ID is required');
        }
        return await api.getUser(entities.id);
      case 'create':
        return await api.createUser({
          username: entities.username || 'newuser',
          email: entities.email || 'user@example.com',
          password: entities.password || 'password'
        });
      case 'update':
        if (!entities.id) {
          throw new Error('User ID is required');
        }
        return await api.updateUser(entities.id, {
          username: entities.username,
          email: entities.email
        });
      case 'delete':
        if (!entities.id) {
          throw new Error('User ID is required');
        }
        return await api.deleteUser(entities.id, entities.reassign);
      default:
        throw new Error(`Unsupported action for users: ${action}`);
    }
  }

  /**
   * Handle categories operations
   */
  async handleCategoriesOperation(api, action, entities) {
    switch (action) {
      case 'get':
        return await api.getCategories();
      case 'getById':
        if (!entities.id) {
          throw new Error('Category ID is required');
        }
        return await api.getCategory(entities.id);
      case 'create':
        return await api.createCategory({
          name: entities.name || 'New Category',
          description: entities.description || ''
        });
      case 'update':
        if (!entities.id) {
          throw new Error('Category ID is required');
        }
        return await api.updateCategory(entities.id, {
          name: entities.name,
          description: entities.description
        });
      case 'delete':
        if (!entities.id) {
          throw new Error('Category ID is required');
        }
        return await api.deleteCategory(entities.id);
      default:
        throw new Error(`Unsupported action for categories: ${action}`);
    }
  }

  /**
   * Handle tags operations
   */
  async handleTagsOperation(api, action, entities) {
    switch (action) {
      case 'get':
        return await api.getTags();
      case 'getById':
        if (!entities.id) {
          throw new Error('Tag ID is required');
        }
        return await api.getTag(entities.id);
      case 'create':
        return await api.createTag({
          name: entities.name || 'New Tag',
          description: entities.description || ''
        });
      case 'update':
        if (!entities.id) {
          throw new Error('Tag ID is required');
        }
        return await api.updateTag(entities.id, {
          name: entities.name,
          description: entities.description
        });
      case 'delete':
        if (!entities.id) {
          throw new Error('Tag ID is required');
        }
        return await api.deleteTag(entities.id);
      default:
        throw new Error(`Unsupported action for tags: ${action}`);
    }
  }

  /**
   * Handle comments operations
   */
  async handleCommentsOperation(api, action, entities) {
    switch (action) {
      case 'get':
        return await api.getComments();
      case 'getById':
        if (!entities.id) {
          throw new Error('Comment ID is required');
        }
        return await api.getComment(entities.id);
      case 'create':
        return await api.createComment({
          post: entities.post || 0,
          author_name: entities.author || 'Anonymous',
          content: entities.content || 'Comment content'
        });
      case 'update':
        if (!entities.id) {
          throw new Error('Comment ID is required');
        }
        return await api.updateComment(entities.id, {
          content: entities.content
        });
      case 'delete':
        if (!entities.id) {
          throw new Error('Comment ID is required');
        }
        return await api.deleteComment(entities.id);
      default:
        throw new Error(`Unsupported action for comments: ${action}`);
    }
  }

  /**
   * Handle menus operations
   */
  async handleMenusOperation(api, action, entities) {
    switch (action) {
      case 'get':
        return await api.getMenus();
      case 'getById':
        if (!entities.id) {
          throw new Error('Menu ID is required');
        }
        return await api.getMenu(entities.id);
      default:
        throw new Error(`Unsupported action for menus: ${action}`);
    }
  }

  /**
   * Handle plugins operations
   */
  async handlePluginsOperation(api, action, entities) {
    switch (action) {
      case 'get':
        return await api.getPlugins();
      case 'getByName':
        if (!entities.plugin) {
          throw new Error('Plugin name is required');
        }
        return await api.getPlugin(entities.plugin);
      case 'activate':
        if (!entities.plugin) {
          throw new Error('Plugin name is required');
        }
        return await api.activatePlugin(entities.plugin);
      case 'deactivate':
        if (!entities.plugin) {
          throw new Error('Plugin name is required');
        }
        return await api.deactivatePlugin(entities.plugin);
      default:
        throw new Error(`Unsupported action for plugins: ${action}`);
    }
  }

  /**
   * Handle settings operations
   */
  async handleSettingsOperation(api, action, entities) {
    switch (action) {
      case 'get':
        return await api.getSettings();
      case 'update':
        // In a real application, you would extract settings data from the entities
        // For simplicity, we're just returning an error here
        throw new Error('Settings update via natural language not fully supported yet');
      default:
        throw new Error(`Unsupported action for settings: ${action}`);
    }
  }

  /**
   * Generate a human-readable interpretation of the NLP result
   */
  generateInterpretation(nlpResult) {
    if (nlpResult.method && nlpResult.endpoint) {
      return {
        action: `${nlpResult.method} request to ${nlpResult.endpoint}`,
        parameters: {
          ...(Object.keys(nlpResult.params).length > 0 ? { query: nlpResult.params } : {}),
          ...(Object.keys(nlpResult.data).length > 0 ? { body: nlpResult.data } : {})
        }
      };
    }
    
    if (nlpResult.intent) {
      const { resource, action } = nlpResult.intent;
      let actionDescription;
      
      switch (action) {
        case 'get':
          actionDescription = 'Retrieving all';
          break;
        case 'getById':
          actionDescription = `Retrieving a specific ${resource.slice(0, -1)}`;
          break;
        case 'create':
          actionDescription = `Creating a new ${resource.slice(0, -1)}`;
          break;
        case 'update':
          actionDescription = `Updating a ${resource.slice(0, -1)}`;
          break;
        case 'delete':
          actionDescription = `Deleting a ${resource.slice(0, -1)}`;
          break;
        default:
          actionDescription = action;
      }
      
      return {
        action: `${actionDescription} ${resource}`,
        parameters: nlpResult.entities
      };
    }
    
    return { error: 'Unable to generate interpretation' };
  }
}

module.exports = new NLPController();