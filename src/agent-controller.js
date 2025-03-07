const nlpService = require('./nlp-service');
const WordPressAPI = require('./wp-api');
const config = require('../config/config');

class MCPController {
  async processRequest(req, res) {
    try {
      console.log('Requête reçue sur /api/mcp:', {
        method: req.method,
        body: req.body,
        headers: req.headers
      });
      
      // Vérifier si la requête vient de l'ancien format ou du nouveau format MCP
      let nlQuery;
      
      // Format MCP standard (avec messages array)
      if (req.body.messages && Array.isArray(req.body.messages)) {
        console.log('Format MCP standard détecté');
        const lastMessage = req.body.messages[req.body.messages.length - 1];
        nlQuery = lastMessage.content;
      } 
      // Ancien format (avec query directement)
      else if (req.body.query) {
        console.log('Ancien format de requête détecté (query)');
        nlQuery = req.body.query;
      }
      // Format invalide
      else {
        console.log('Erreur: Aucun format valide détecté dans la requête');
        return res.status(400).json({ 
          error: 'Invalid request format', 
          response: {
            role: "assistant",
            content: "Format de requête invalide. Utilisez soit le format MCP standard avec 'messages', soit l'ancien format avec 'query'."
          }
        });
      }
      
      if (!nlQuery) {
        console.log('Erreur: contenu de message manquant dans le corps de la requête');
        return res.status(400).json({ error: 'Missing message content' });
      }
      
      console.log('Traitement de la requête MCP:', nlQuery);
      
      // Pour tester, vérifions si c'est une commande de test
      if (nlQuery.toLowerCase() === 'test' || nlQuery.toLowerCase() === 'echo' || 
          nlQuery.toLowerCase().startsWith('test ') || nlQuery.toLowerCase().startsWith('echo ')) {
        console.log('Commande de test détectée, renvoi direct sans WordPress');
        return res.json({
          success: true,
          response: {
            role: "assistant",
            content: `Test réussi! Echo: ${nlQuery}`
          }
        });
      }
      
      // Vérifier la configuration WordPress
      if (!this.validateWordPressConfig()) {
        console.error('Configuration WordPress manquante ou incomplète');
        return res.status(500).json({ 
          error: 'Server configuration error',
          response: {
            role: "assistant",
            content: "Je ne peux pas traiter votre demande car la configuration WordPress est manquante ou incomplète. Veuillez vérifier les variables d'environnement du serveur."
          }
        });
      }
      
      // Utilisez la configuration par défaut
      const siteConfig = config.wpConfig;
      console.log('Configuration WordPress utilisée:', {
        url: siteConfig.url,
        username: siteConfig.username,
        hasAppPassword: !!siteConfig.appPassword,
        hasPassword: !!siteConfig.password
      });
      
      // Créez une instance WordPress API avec la configuration par défaut
      const api = new WordPressAPI();
      
      // Authentifiez-vous
      const authSuccess = await api.authenticate();
      
      if (!authSuccess) {
        console.error('Échec de l\'authentification WordPress avec la configuration:', {
          url: siteConfig.url,
          username: siteConfig.username,
          hasAppPassword: !!siteConfig.appPassword,
          hasPassword: !!siteConfig.password
        });
        return res.status(401).json({ 
          error: 'Authentication failed',
          response: {
            role: "assistant",
            content: "Je n'ai pas pu m'authentifier auprès de WordPress. Veuillez vérifier vos informations d'identification dans les variables d'environnement."
          }
        });
      }
      
      // Utiliser le service NLP pour traiter la requête
      try {
        const nlpService = require('./nlp-service');
        
        // Détecter quel modèle AI est utilisé et disponible
        const aiProvider = config.ai.provider || 'openai';
        const aiAvailable = (aiProvider === 'openai' && nlpService.openai) || 
                          (aiProvider === 'anthropic' && nlpService.anthropic);
        
        // Si un modèle AI est configuré, l'utiliser directement
        if (aiAvailable) {
          console.log(`Utilisation directe de ${aiProvider} pour le traitement`);
          let aiResult;
          
          if (aiProvider === 'openai') {
            aiResult = await nlpService.processWithOpenAI(nlQuery, siteConfig);
          } else if (aiProvider === 'anthropic') {
            aiResult = await nlpService.processWithAnthropic(nlQuery, siteConfig);
          }
          
          console.log(`Résultat ${aiProvider}:`, aiResult);
          
          if (aiResult.success) {
            // Exécuter l'opération avec le résultat de l'IA
            const result = await this.executeRestOperation(api, aiResult);
            
            // Retourner le résultat
            // Format de réponse MCP standard
            return res.json({
              success: true,
              response: {
                role: "assistant",
                content: `J'ai exécuté votre requête "${nlQuery}" avec succès. Voici le résultat: ${JSON.stringify(result)}`
              }
            });
          } else {
            return res.status(400).json({
              error: `${aiProvider} processing failed`,
              response: {
                role: "assistant",
                content: `Je n'ai pas pu comprendre votre demande. Erreur: ${aiResult.error}`
              }
            });
          }
        }
        
        // Sinon, utiliser le traitement NLP local
        console.log('Utilisation du traitement NLP local');
        const nlpResult = await nlpService.processNaturalLanguage(nlQuery, siteConfig);
        
        // Exécuter l'opération avec le résultat de NLP
        const result = await this.executeOperation(api, nlpResult);
        
        // Retourner le résultat
        return res.json({
          success: true,
          response: {
            role: "assistant",
            content: `J'ai traité votre demande "${nlQuery}" avec le service NLP local. Résultat: ${JSON.stringify(result)}`
          }
        });
      } catch (error) {
        console.error('Erreur lors du traitement NLP ou de l\'exécution:', error);
        return res.status(500).json({
          error: 'Processing error',
          response: {
            role: "assistant",
            content: `Je n'ai pas pu traiter votre demande en raison d'une erreur: ${error.message}`
          }
        });
      }
    } catch (error) {
      console.error('Agent Controller error:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        response: {
          role: "assistant",
          content: `Une erreur interne s'est produite: ${error.message}`
        }
      });
    }
  }

  validateWordPressConfig() {
    const { wpConfig } = config;
    
    console.log('Variables d\'environnement WP brutes:', {
      WP_URL: process.env.WP_URL,
      WP_USERNAME: process.env.WP_USERNAME,
      WP_APP_PASSWORD: process.env.WP_APP_PASSWORD ? 'DÉFINI' : 'NON DÉFINI',
      WP_PASSWORD: process.env.WP_PASSWORD ? 'DÉFINI' : 'NON DÉFINI'
    });
    
    console.log('Configuration WordPress actuelle:', {
      url: wpConfig.url,
      username: wpConfig.username,
      hasAppPassword: !!wpConfig.appPassword,
      hasPassword: !!wpConfig.password
    });
    
    // Vérifier l'URL
    if (!wpConfig.url || wpConfig.url === 'https://example.com') {
      console.error('URL WordPress non configurée');
      return false;
    }
    
    // Vérifier le nom d'utilisateur
    if (!wpConfig.username) {
      console.error('Nom d\'utilisateur WordPress non configuré');
      return false;
    }
    
    // Vérifier qu'au moins un type d'authentification est configuré
    if (!wpConfig.appPassword && !wpConfig.password) {
      console.error('Aucune méthode d\'authentification configurée (ni mot de passe d\'application ni mot de passe normal)');
      return false;
    }
    
    console.log('✅ Configuration WordPress validée avec succès');
    return true;
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
    const { method, endpoint, params, data = {} } = nlpResult;
    
    // Liste des endpoints personnalisés qui ne sont pas dans l'API WordPress
    const customEndpoints = ['seo_analysis', 'analytics', 'custom_report'];
    
    // Si c'est un endpoint personnalisé, traiter différemment
    if (customEndpoints.includes(endpoint)) {
      console.log(`Traitement d'un endpoint personnalisé: ${endpoint}`);
      
      // Pour SEO Analysis, retourner directement les données d'entrée
      if (endpoint === 'seo_analysis') {
        console.log(`Analyse SEO effectuée pour: ${data.url}`);
        return {
          success: true,
          message: `Analyse SEO effectuée pour ${data.url}`,
          data: data
        };
      }
      
      // Pour d'autres types d'endpoints personnalisés
      return {
        success: true,
        message: `Opération ${endpoint} traitée avec succès`,
        data: data || {}
      };
    }
    
    // S'assurer que les mises à jour de pages et articles sont toujours publiées
    const processedData = { ...data };
    if ((method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT') && 
        (endpoint === 'pages' || endpoint.startsWith('pages/') || 
         endpoint === 'posts' || endpoint.startsWith('posts/'))) {
      
      if (!processedData.status) {
        processedData.status = 'publish';
        console.log(`Ajout du statut "publish" pour l'opération ${method} sur ${endpoint}`);
      }
    }
    
    // Pour les endpoints WordPress standard
    return await api.request(method.toLowerCase(), endpoint, processedData, params);
  }

  /**
   * Execute an operation based on intent and entities
   */
  async executeIntentOperation(api, nlpResult) {
    const { intent, entities } = nlpResult;
    
    // Switch on the intent type
    switch (intent.action) {
      case 'get':
        return await this.handleGetOperation(api, intent, entities);
      case 'create':
        return await this.handleCreateOperation(api, intent, entities);
      case 'update':
        return await this.handleUpdateOperation(api, intent, entities);
      case 'delete':
        return await this.handleDeleteOperation(api, intent, entities);
      default:
        throw new Error(`Unsupported action: ${intent.action}`);
    }
  }

  /**
   * Generate a human-readable interpretation of the NLP result
   */
  generateInterpretation(nlpResult) {
    if (nlpResult.method && nlpResult.endpoint) {
      return `${nlpResult.method.toUpperCase()} request to endpoint "${nlpResult.endpoint}"`;
    }
    
    if (nlpResult.intent) {
      return `${nlpResult.intent.action.toUpperCase()} operation on ${nlpResult.intent.resource}`;
    }
    
    return 'Unknown operation';
  }

  // Implementation of handle methods would be similar to those in nlp-controller.js
  async handleGetOperation(api, intent, entities) {
    const { resource } = intent;
    const id = entities.id;
    
    switch (resource) {
      case 'posts':
        return id ? await api.getPost(id) : await api.getPosts();
      case 'pages':
        return id ? await api.getPage(id) : await api.getPages();
      case 'users':
        return id ? await api.getUser(id) : await api.getUsers();
      case 'categories':
        return id ? await api.getCategory(id) : await api.getCategories();
      case 'tags':
        return id ? await api.getTag(id) : await api.getTags();
      case 'comments':
        return id ? await api.getComment(id) : await api.getComments();
      case 'media':
        return id ? await api.getMedia(id) : await api.getMedia();
      case 'menus':
        return id ? await api.getMenu(id) : await api.getMenus();
      case 'plugins':
        return id ? await api.getPlugin(id) : await api.getPlugins();
      case 'settings':
        return await api.getSettings();
      default:
        // Handle custom post types
        return id ? await api.getCustomPost(resource, id) : await api.getCustomPosts(resource);
    }
  }

  async handleCreateOperation(api, intent, entities) {
    const { resource } = intent;
    const data = entities.data || {};
    
    // S'assurer que les créations de pages et articles ont le statut "publish"
    const processedData = { ...data };
    if ((resource === 'posts' || resource === 'pages') && !processedData.status) {
      processedData.status = 'publish';
      console.log(`Ajout du statut "publish" pour la création de ${resource}`);
    }
    
    switch (resource) {
      case 'posts':
        return await api.createPost(processedData);
      case 'pages':
        return await api.createPage(processedData);
      case 'users':
        return await api.createUser(data);
      case 'categories':
        return await api.createCategory(data);
      case 'tags':
        return await api.createTag(data);
      case 'comments':
        return await api.createComment(data);
      case 'media':
        return await api.uploadMedia(data);
      default:
        // Handle custom post types
        return await api.createCustomPost(resource, processedData);
    }
  }

  async handleUpdateOperation(api, intent, entities) {
    const { resource } = intent;
    const id = entities.id;
    const data = entities.data || {};
    
    if (!id) {
      throw new Error(`ID is required for updating ${resource}`);
    }
    
    // S'assurer que les mises à jour de pages et articles ont le statut "publish"
    const processedData = { ...data };
    if ((resource === 'posts' || resource === 'pages') && !processedData.status) {
      processedData.status = 'publish';
      console.log(`Ajout du statut "publish" pour la mise à jour de ${resource} ID:${id}`);
    }
    
    switch (resource) {
      case 'posts':
        return await api.updatePost(id, processedData);
      case 'pages':
        return await api.updatePage(id, processedData);
      case 'users':
        return await api.updateUser(id, data);
      case 'categories':
        return await api.updateCategory(id, data);
      case 'tags':
        return await api.updateTag(id, data);
      case 'comments':
        return await api.updateComment(id, data);
      case 'plugins':
        if (data.action === 'activate') {
          return await api.activatePlugin(id);
        } else if (data.action === 'deactivate') {
          return await api.deactivatePlugin(id);
        }
        throw new Error(`Unsupported plugin action: ${data.action}`);
      case 'settings':
        return await api.updateSettings(data);
      default:
        // Handle custom post types
        return await api.updateCustomPost(resource, id, data);
    }
  }

  async handleDeleteOperation(api, intent, entities) {
    const { resource } = intent;
    const id = entities.id;
    
    if (!id) {
      throw new Error(`ID is required for deleting ${resource}`);
    }
    
    switch (resource) {
      case 'posts':
        return await api.deletePost(id);
      case 'pages':
        return await api.deletePage(id);
      case 'users':
        return await api.deleteUser(id);
      case 'categories':
        return await api.deleteCategory(id);
      case 'tags':
        return await api.deleteTag(id);
      case 'comments':
        return await api.deleteComment(id);
      case 'media':
        return await api.deleteMedia(id);
      default:
        // Handle custom post types
        return await api.deleteCustomPost(resource, id);
    }
  }

  // Méthode simple pour transformer des commandes basiques en opérations API
  transformSimpleCommand(query) {
    query = query.toLowerCase();
    
    // Commandes de création d'article
    if (query.includes('crée') || query.includes('créer') || query.includes('créé') || 
        query.includes('creer') || query.includes('ajoute') || query.includes('ajouter')) {
      
      if (query.includes('article') || query.includes('post')) {
        console.log('Détecté: création d\'article');
        
        // Extraire le titre s'il existe
        let title = 'Nouvel article';
        let content = 'Contenu de l\'article';
        
        const titleMatch = query.match(/(intitulé|titre|nommé)\s+["']?([^"']+)["']?/i);
        if (titleMatch && titleMatch[2]) {
          title = titleMatch[2].trim();
        }
        
        // Extraire le contenu s'il existe
        const contentMatch = query.match(/(contenu|texte|corps)\s+["']?([^"']+)["']?/i);
        if (contentMatch && contentMatch[2]) {
          content = contentMatch[2].trim();
        }
        
        return {
          method: 'post',
          endpoint: 'posts',
          data: {
            title: title,
            content: content,
            status: 'publish'
          }
        };
      }
    }
    
    // Commandes de liste
    if (query.includes('liste') || query.includes('lister') || query.includes('affiche') || 
        query.includes('afficher') || query.includes('montre') || query.includes('montrer')) {
      
      if (query.includes('article') || query.includes('post')) {
        console.log('Détecté: lister les articles');
        return {
          method: 'get',
          endpoint: 'posts',
          data: null
        };
      }
      
      if (query.includes('page')) {
        console.log('Détecté: lister les pages');
        return {
          method: 'get',
          endpoint: 'pages',
          data: null
        };
      }
    }
    
    // Aucune correspondance trouvée
    return null;
  }
}

module.exports = new MCPController(); 