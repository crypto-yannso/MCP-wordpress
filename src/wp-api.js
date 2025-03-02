const axios = require('axios');
const config = require('../config/config');

class WordPressAPI {
  constructor(siteConfig = null) {
    this.config = siteConfig || config.wpConfig;
    this.baseURL = `${this.config.url}/wp-json/wp/v2`;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
    });
    
    if (this.config.appPassword) {
      this.client.defaults.headers.common['Authorization'] = `Basic ${Buffer.from(
        `${this.config.username}:${this.config.appPassword}`
      ).toString('base64')}`;
    }
  }

  async authenticate() {
    if (!this.config.appPassword && this.config.username && this.config.password) {
      try {
        const response = await axios.post(`${this.config.url}/wp-json/jwt-auth/v1/token`, {
          username: this.config.username,
          password: this.config.password
        });
        
        if (response.data && response.data.token) {
          this.client.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
          return true;
        }
      } catch (error) {
        console.error('Authentication failed:', error.message);
        return false;
      }
    }
    return !!this.config.appPassword;
  }

  // Posts
  async getPosts(params = {}) {
    try {
      const response = await this.client.get('/posts', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get posts: ${error.message}`);
    }
  }

  async getPost(id) {
    try {
      const response = await this.client.get(`/posts/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get post ${id}: ${error.message}`);
    }
  }

  async createPost(postData) {
    try {
      const response = await this.client.post('/posts', postData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create post: ${error.message}`);
    }
  }

  async updatePost(id, postData) {
    try {
      const response = await this.client.put(`/posts/${id}`, postData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update post ${id}: ${error.message}`);
    }
  }

  async deletePost(id) {
    try {
      const response = await this.client.delete(`/posts/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete post ${id}: ${error.message}`);
    }
  }

  // Pages
  async getPages(params = {}) {
    try {
      const response = await this.client.get('/pages', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get pages: ${error.message}`);
    }
  }

  async getPage(id) {
    try {
      const response = await this.client.get(`/pages/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get page ${id}: ${error.message}`);
    }
  }

  async createPage(pageData) {
    try {
      const response = await this.client.post('/pages', pageData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create page: ${error.message}`);
    }
  }

  async updatePage(id, pageData) {
    try {
      const response = await this.client.put(`/pages/${id}`, pageData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update page ${id}: ${error.message}`);
    }
  }

  async deletePage(id) {
    try {
      const response = await this.client.delete(`/pages/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete page ${id}: ${error.message}`);
    }
  }

  // Media
  async getMedia(params = {}) {
    try {
      const response = await this.client.get('/media', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get media: ${error.message}`);
    }
  }

  async getMediaItem(id) {
    try {
      const response = await this.client.get(`/media/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get media ${id}: ${error.message}`);
    }
  }

  async uploadMedia(file, title = '') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (title) formData.append('title', title);
      
      const response = await this.client.post('/media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to upload media: ${error.message}`);
    }
  }

  async deleteMedia(id) {
    try {
      const response = await this.client.delete(`/media/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete media ${id}: ${error.message}`);
    }
  }

  // Users
  async getUsers(params = {}) {
    try {
      const response = await this.client.get('/users', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get users: ${error.message}`);
    }
  }

  async getUser(id) {
    try {
      const response = await this.client.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get user ${id}: ${error.message}`);
    }
  }

  async createUser(userData) {
    try {
      const response = await this.client.post('/users', userData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  async updateUser(id, userData) {
    try {
      const response = await this.client.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update user ${id}: ${error.message}`);
    }
  }

  async deleteUser(id, reassign) {
    try {
      const response = await this.client.delete(`/users/${id}`, {
        params: { reassign }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete user ${id}: ${error.message}`);
    }
  }

  // Categories
  async getCategories(params = {}) {
    try {
      const response = await this.client.get('/categories', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get categories: ${error.message}`);
    }
  }

  async getCategory(id) {
    try {
      const response = await this.client.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get category ${id}: ${error.message}`);
    }
  }

  async createCategory(categoryData) {
    try {
      const response = await this.client.post('/categories', categoryData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create category: ${error.message}`);
    }
  }

  async updateCategory(id, categoryData) {
    try {
      const response = await this.client.put(`/categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update category ${id}: ${error.message}`);
    }
  }

  async deleteCategory(id) {
    try {
      const response = await this.client.delete(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete category ${id}: ${error.message}`);
    }
  }

  // Tags
  async getTags(params = {}) {
    try {
      const response = await this.client.get('/tags', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get tags: ${error.message}`);
    }
  }

  async getTag(id) {
    try {
      const response = await this.client.get(`/tags/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get tag ${id}: ${error.message}`);
    }
  }

  async createTag(tagData) {
    try {
      const response = await this.client.post('/tags', tagData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create tag: ${error.message}`);
    }
  }

  async updateTag(id, tagData) {
    try {
      const response = await this.client.put(`/tags/${id}`, tagData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update tag ${id}: ${error.message}`);
    }
  }

  async deleteTag(id) {
    try {
      const response = await this.client.delete(`/tags/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete tag ${id}: ${error.message}`);
    }
  }

  // Comments
  async getComments(params = {}) {
    try {
      const response = await this.client.get('/comments', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get comments: ${error.message}`);
    }
  }

  async getComment(id) {
    try {
      const response = await this.client.get(`/comments/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get comment ${id}: ${error.message}`);
    }
  }

  async createComment(commentData) {
    try {
      const response = await this.client.post('/comments', commentData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create comment: ${error.message}`);
    }
  }

  async updateComment(id, commentData) {
    try {
      const response = await this.client.put(`/comments/${id}`, commentData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update comment ${id}: ${error.message}`);
    }
  }

  async deleteComment(id) {
    try {
      const response = await this.client.delete(`/comments/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete comment ${id}: ${error.message}`);
    }
  }

  // Menus (using WP API Menus plugin)
  async getMenus() {
    try {
      const response = await axios.get(`${this.config.url}/wp-json/wp-api-menus/v2/menus`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get menus: ${error.message}`);
    }
  }

  async getMenu(id) {
    try {
      const response = await axios.get(`${this.config.url}/wp-json/wp-api-menus/v2/menus/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get menu ${id}: ${error.message}`);
    }
  }

  // Custom post types
  async getCustomPosts(type, params = {}) {
    try {
      const response = await this.client.get(`/${type}`, { params });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get ${type}: ${error.message}`);
    }
  }

  async getCustomPost(type, id) {
    try {
      const response = await this.client.get(`/${type}/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get ${type} ${id}: ${error.message}`);
    }
  }

  async createCustomPost(type, postData) {
    try {
      const response = await this.client.post(`/${type}`, postData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create ${type}: ${error.message}`);
    }
  }

  async updateCustomPost(type, id, postData) {
    try {
      const response = await this.client.put(`/${type}/${id}`, postData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update ${type} ${id}: ${error.message}`);
    }
  }

  async deleteCustomPost(type, id) {
    try {
      const response = await this.client.delete(`/${type}/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete ${type} ${id}: ${error.message}`);
    }
  }

  // Settings (requires WP REST API - Settings plugin)
  async getSettings() {
    try {
      const response = await this.client.get('/settings');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get settings: ${error.message}`);
    }
  }

  async updateSettings(settingsData) {
    try {
      const response = await this.client.put('/settings', settingsData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update settings: ${error.message}`);
    }
  }

  // Plugins (requires WP REST API - Plugins Extension)
  async getPlugins() {
    try {
      const response = await this.client.get('/plugins');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get plugins: ${error.message}`);
    }
  }

  async getPlugin(plugin) {
    try {
      const response = await this.client.get(`/plugins/${plugin}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get plugin ${plugin}: ${error.message}`);
    }
  }

  async activatePlugin(plugin) {
    try {
      const response = await this.client.put(`/plugins/${plugin}`, { status: 'active' });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to activate plugin ${plugin}: ${error.message}`);
    }
  }

  async deactivatePlugin(plugin) {
    try {
      const response = await this.client.put(`/plugins/${plugin}`, { status: 'inactive' });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to deactivate plugin ${plugin}: ${error.message}`);
    }
  }

  // Generic method for custom endpoints
  async request(method, endpoint, data = null, params = {}) {
    try {
      const config = { params };
      let response;
      
      switch (method.toLowerCase()) {
        case 'get':
          response = await this.client.get(endpoint, config);
          break;
        case 'post':
          response = await this.client.post(endpoint, data, config);
          break;
        case 'put':
          response = await this.client.put(endpoint, data, config);
          break;
        case 'delete':
          response = await this.client.delete(endpoint, config);
          break;
        default:
          throw new Error(`Invalid method: ${method}`);
      }
      
      return response.data;
    } catch (error) {
      throw new Error(`Request failed: ${error.message}`);
    }
  }
}

module.exports = WordPressAPI;