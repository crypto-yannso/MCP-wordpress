const express = require('express');
const WordPressAPI = require('./wp-api');
const nlpController = require('./nlp-controller');
const agentController = require('./agent-controller');

function setupRoutes(app) {
  console.log('Configuration des routes...');
  
  const router = express.Router();
  
  // Natural language processing endpoint
  router.post('/nlp', (req, res) => nlpController.processRequest(req, res));
  router.get('/nlp', (req, res) => nlpController.processRequest(req, res));
  
  // MCP endpoint (secure with pre-configured authentication)
  console.log('Configuration de la route MCP: /api/mcp');
  const mcpRouter = express.Router();
  mcpRouter.post('/', (req, res) => {
    console.log('Route MCP appelée');
    return agentController.processRequest(req, res);
  });
  mcpRouter.head('/', (req, res) => {
    console.log('Route MCP HEAD appelée');
    res.sendStatus(200);
  });
  
  // Authentication middleware
  const authMiddleware = async (req, res, next) => {
    // Get site config from request
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

    try {
      // Create WordPress API instance with provided credentials
      const api = new WordPressAPI(siteConfig);
      
      // Authenticate
      const authSuccess = await api.authenticate();
      
      if (!authSuccess) {
        return res.status(401).json({ error: 'Authentication failed' });
      }
      
      // Add API instance to request for route handlers to use
      req.wpApi = api;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(500).json({ error: error.message });
    }
  };

  // Posts routes
  router.get('/posts', authMiddleware, async (req, res) => {
    try {
      const params = { ...req.query };
      // Remove auth params
      delete params.site_url;
      delete params.username;
      delete params.password;
      delete params.app_password;
      
      const posts = await req.wpApi.getPosts(params);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/posts/:id', authMiddleware, async (req, res) => {
    try {
      const post = await req.wpApi.getPost(req.params.id);
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/posts', authMiddleware, async (req, res) => {
    try {
      const postData = { ...req.body };
      // Remove auth params
      delete postData.site_url;
      delete postData.username;
      delete postData.password;
      delete postData.app_password;
      
      const post = await req.wpApi.createPost(postData);
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.put('/posts/:id', authMiddleware, async (req, res) => {
    try {
      const postData = { ...req.body };
      // Remove auth params
      delete postData.site_url;
      delete postData.username;
      delete postData.password;
      delete postData.app_password;
      
      const post = await req.wpApi.updatePost(req.params.id, postData);
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.delete('/posts/:id', authMiddleware, async (req, res) => {
    try {
      const result = await req.wpApi.deletePost(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Pages routes
  router.get('/pages', authMiddleware, async (req, res) => {
    try {
      const params = { ...req.query };
      // Remove auth params
      delete params.site_url;
      delete params.username;
      delete params.password;
      delete params.app_password;
      
      const pages = await req.wpApi.getPages(params);
      res.json(pages);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/pages/:id', authMiddleware, async (req, res) => {
    try {
      const page = await req.wpApi.getPage(req.params.id);
      res.json(page);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/pages', authMiddleware, async (req, res) => {
    try {
      const pageData = { ...req.body };
      // Remove auth params
      delete pageData.site_url;
      delete pageData.username;
      delete pageData.password;
      delete pageData.app_password;
      
      const page = await req.wpApi.createPage(pageData);
      res.status(201).json(page);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.put('/pages/:id', authMiddleware, async (req, res) => {
    try {
      const pageData = { ...req.body };
      // Remove auth params
      delete pageData.site_url;
      delete pageData.username;
      delete pageData.password;
      delete pageData.app_password;
      
      const page = await req.wpApi.updatePage(req.params.id, pageData);
      res.json(page);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.delete('/pages/:id', authMiddleware, async (req, res) => {
    try {
      const result = await req.wpApi.deletePage(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Media routes
  router.get('/media', authMiddleware, async (req, res) => {
    try {
      const params = { ...req.query };
      delete params.site_url;
      delete params.username;
      delete params.password;
      delete params.app_password;
      
      const media = await req.wpApi.getMedia(params);
      res.json(media);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/media/:id', authMiddleware, async (req, res) => {
    try {
      const media = await req.wpApi.getMediaItem(req.params.id);
      res.json(media);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/media', authMiddleware, async (req, res) => {
    // This would typically require a file upload middleware like multer
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      const media = await req.wpApi.uploadMedia(req.file, req.body.title);
      res.status(201).json(media);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.delete('/media/:id', authMiddleware, async (req, res) => {
    try {
      const result = await req.wpApi.deleteMedia(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Users routes
  router.get('/users', authMiddleware, async (req, res) => {
    try {
      const params = { ...req.query };
      delete params.site_url;
      delete params.username;
      delete params.password;
      delete params.app_password;
      
      const users = await req.wpApi.getUsers(params);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/users/:id', authMiddleware, async (req, res) => {
    try {
      const user = await req.wpApi.getUser(req.params.id);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/users', authMiddleware, async (req, res) => {
    try {
      const userData = { ...req.body };
      delete userData.site_url;
      delete userData.username;
      delete userData.password;
      delete userData.app_password;
      
      const user = await req.wpApi.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.put('/users/:id', authMiddleware, async (req, res) => {
    try {
      const userData = { ...req.body };
      delete userData.site_url;
      delete userData.username;
      delete userData.password;
      delete userData.app_password;
      
      const user = await req.wpApi.updateUser(req.params.id, userData);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.delete('/users/:id', authMiddleware, async (req, res) => {
    try {
      const reassign = req.query.reassign || req.body.reassign;
      const result = await req.wpApi.deleteUser(req.params.id, reassign);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Categories routes
  router.get('/categories', authMiddleware, async (req, res) => {
    try {
      const params = { ...req.query };
      delete params.site_url;
      delete params.username;
      delete params.password;
      delete params.app_password;
      
      const categories = await req.wpApi.getCategories(params);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/categories/:id', authMiddleware, async (req, res) => {
    try {
      const category = await req.wpApi.getCategory(req.params.id);
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/categories', authMiddleware, async (req, res) => {
    try {
      const categoryData = { ...req.body };
      delete categoryData.site_url;
      delete categoryData.username;
      delete categoryData.password;
      delete categoryData.app_password;
      
      const category = await req.wpApi.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.put('/categories/:id', authMiddleware, async (req, res) => {
    try {
      const categoryData = { ...req.body };
      delete categoryData.site_url;
      delete categoryData.username;
      delete categoryData.password;
      delete categoryData.app_password;
      
      const category = await req.wpApi.updateCategory(req.params.id, categoryData);
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.delete('/categories/:id', authMiddleware, async (req, res) => {
    try {
      const result = await req.wpApi.deleteCategory(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Tags routes
  router.get('/tags', authMiddleware, async (req, res) => {
    try {
      const params = { ...req.query };
      delete params.site_url;
      delete params.username;
      delete params.password;
      delete params.app_password;
      
      const tags = await req.wpApi.getTags(params);
      res.json(tags);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/tags/:id', authMiddleware, async (req, res) => {
    try {
      const tag = await req.wpApi.getTag(req.params.id);
      res.json(tag);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/tags', authMiddleware, async (req, res) => {
    try {
      const tagData = { ...req.body };
      delete tagData.site_url;
      delete tagData.username;
      delete tagData.password;
      delete tagData.app_password;
      
      const tag = await req.wpApi.createTag(tagData);
      res.status(201).json(tag);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.put('/tags/:id', authMiddleware, async (req, res) => {
    try {
      const tagData = { ...req.body };
      delete tagData.site_url;
      delete tagData.username;
      delete tagData.password;
      delete tagData.app_password;
      
      const tag = await req.wpApi.updateTag(req.params.id, tagData);
      res.json(tag);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.delete('/tags/:id', authMiddleware, async (req, res) => {
    try {
      const result = await req.wpApi.deleteTag(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Comments routes
  router.get('/comments', authMiddleware, async (req, res) => {
    try {
      const params = { ...req.query };
      delete params.site_url;
      delete params.username;
      delete params.password;
      delete params.app_password;
      
      const comments = await req.wpApi.getComments(params);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/comments/:id', authMiddleware, async (req, res) => {
    try {
      const comment = await req.wpApi.getComment(req.params.id);
      res.json(comment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/comments', authMiddleware, async (req, res) => {
    try {
      const commentData = { ...req.body };
      delete commentData.site_url;
      delete commentData.username;
      delete commentData.password;
      delete commentData.app_password;
      
      const comment = await req.wpApi.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.put('/comments/:id', authMiddleware, async (req, res) => {
    try {
      const commentData = { ...req.body };
      delete commentData.site_url;
      delete commentData.username;
      delete commentData.password;
      delete commentData.app_password;
      
      const comment = await req.wpApi.updateComment(req.params.id, commentData);
      res.json(comment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.delete('/comments/:id', authMiddleware, async (req, res) => {
    try {
      const result = await req.wpApi.deleteComment(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Menus routes
  router.get('/menus', authMiddleware, async (req, res) => {
    try {
      const menus = await req.wpApi.getMenus();
      res.json(menus);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/menus/:id', authMiddleware, async (req, res) => {
    try {
      const menu = await req.wpApi.getMenu(req.params.id);
      res.json(menu);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Settings routes (requires WP REST API - Settings plugin)
  router.get('/settings', authMiddleware, async (req, res) => {
    try {
      const settings = await req.wpApi.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.put('/settings', authMiddleware, async (req, res) => {
    try {
      const settingsData = { ...req.body };
      delete settingsData.site_url;
      delete settingsData.username;
      delete settingsData.password;
      delete settingsData.app_password;
      
      const settings = await req.wpApi.updateSettings(settingsData);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Plugins routes (requires WP REST API - Plugins Extension)
  router.get('/plugins', authMiddleware, async (req, res) => {
    try {
      const plugins = await req.wpApi.getPlugins();
      res.json(plugins);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/plugins/:plugin', authMiddleware, async (req, res) => {
    try {
      const plugin = await req.wpApi.getPlugin(req.params.plugin);
      res.json(plugin);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.put('/plugins/:plugin/activate', authMiddleware, async (req, res) => {
    try {
      const result = await req.wpApi.activatePlugin(req.params.plugin);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.put('/plugins/:plugin/deactivate', authMiddleware, async (req, res) => {
    try {
      const result = await req.wpApi.deactivatePlugin(req.params.plugin);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Custom endpoints
  router.all('/custom/:endpoint(*)', authMiddleware, async (req, res) => {
    try {
      const method = req.method.toLowerCase();
      const endpoint = req.params.endpoint;
      
      // Process query parameters
      const params = { ...req.query };
      delete params.site_url;
      delete params.username;
      delete params.password;
      delete params.app_password;
      
      // Process body data for POST, PUT requests
      const data = method === 'post' || method === 'put' ? { ...req.body } : null;
      if (data) {
        delete data.site_url;
        delete data.username;
        delete data.password;
        delete data.app_password;
      }
      
      const result = await req.wpApi.request(method, endpoint, data, params);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Custom post types
  router.get('/custom/:type', authMiddleware, async (req, res) => {
    try {
      const params = { ...req.query };
      delete params.site_url;
      delete params.username;
      delete params.password;
      delete params.app_password;
      
      const posts = await req.wpApi.getCustomPosts(req.params.type, params);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/custom/:type/:id', authMiddleware, async (req, res) => {
    try {
      const post = await req.wpApi.getCustomPost(req.params.type, req.params.id);
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/custom/:type', authMiddleware, async (req, res) => {
    try {
      const postData = { ...req.body };
      delete postData.site_url;
      delete postData.username;
      delete postData.password;
      delete postData.app_password;
      
      const post = await req.wpApi.createCustomPost(req.params.type, postData);
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.put('/custom/:type/:id', authMiddleware, async (req, res) => {
    try {
      const postData = { ...req.body };
      delete postData.site_url;
      delete postData.username;
      delete postData.password;
      delete postData.app_password;
      
      const post = await req.wpApi.updateCustomPost(req.params.type, req.params.id, postData);
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.delete('/custom/:type/:id', authMiddleware, async (req, res) => {
    try {
      const result = await req.wpApi.deleteCustomPost(req.params.type, req.params.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.use('/api/wordpress', router);
  
  // For the MCP endpoint, we don't need the authentication middleware
  app.use('/api/mcp', mcpRouter);
  
  // Pour la rétrocompatibilité, rediriger l'ancien endpoint /api/agent/nlp vers le nouveau /api/mcp
  const legacyAgentRouter = express.Router();
  legacyAgentRouter.post('/nlp', (req, res) => {
    console.log('Ancien chemin /api/agent/nlp appelé - redirection vers MCP');
    return agentController.processRequest(req, res);
  });
  legacyAgentRouter.head('/nlp', (req, res) => {
    console.log('Route agent HEAD appelée via l\'ancien chemin');
    res.sendStatus(200);
  });
  app.use('/api/agent', legacyAgentRouter);
  
  console.log('Configuration des routes terminée');
}

module.exports = setupRoutes;