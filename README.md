# WordPress MCP API Server

A Claude MCP (Model-Calling-Protocol) compatible server that can communicate with the WordPress REST API to perform all possible actions on a WordPress site. The server processes natural language instructions and converts them into WordPress API operations.

## MCP Integration

This server follows Anthropic's Model-Calling-Protocol standard, providing a simple request/response interface:

- **Endpoint**: `/api/mcp`
- **Method**: POST
- **Request Format**:
```json
{
  "messages": [
    {"role": "user", "content": "Your natural language request about WordPress"}
  ]
}
```
- **Response Format**:
```json
{
  "success": true,
  "response": {
    "role": "assistant",
    "content": "Response from the MCP with WordPress operation results"
  }
}
```

## AI Providers

The server supports multiple AI providers:

- **Anthropic Claude** (default): Using Claude 3.5 Sonnet for natural language understanding
- **OpenAI**: Using GPT-4 as a fallback option

## Features

- Complete WordPress REST API integration
- Authentication with regular credentials or application passwords
- Natural language processing of WordPress API requests
- OpenAI integration for advanced language understanding
- API endpoints for all WordPress resources:
  - Posts
  - Pages
  - Media
  - Users
  - Categories
  - Tags
  - Comments
  - Menus
  - Custom Post Types
  - Settings
  - Plugins
- Support for custom/advanced WordPress REST API endpoints
- File uploads for media
- Error handling and security best practices

## Prerequisites

- Node.js (v14+)
- npm or yarn
- WordPress site with REST API enabled
- OpenAI API key (for advanced natural language processing)
- (Optional) WordPress plugins:
  - JWT Authentication for WP REST API (for token authentication)
  - WP API Menus (for menu management)
  - WP REST API - Custom Endpoints (for custom endpoints)
  - WP REST API - Settings (for settings management)
  - WP REST API - Plugin Extension (for plugin management)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd MCP-S
```

2. Install dependencies:
```bash
npm install
```

3. Create environment configuration:
```bash
cp .env.example .env
```

4. Edit the `.env` file with your WordPress site information.

5. Create an uploads directory:
```bash
mkdir uploads
```

## Usage

### Start the server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

The server exposes the following endpoints:

### Natural Language Processing

- `POST /api/wordpress/nlp` - Process natural language request for WordPress operations
- `GET /api/wordpress/nlp` - Process natural language request via query parameters

Example natural language requests:
- "Show me all published posts"
- "Create a new page titled 'About Us' with content 'This is our company'"
- "Get user with ID 5"
- "List all categories"
- "Update post 123 to change the title to 'New Title'"
- "Delete page 456"

### Authentication

All endpoints require authentication parameters:
- `site_url`: The WordPress site URL
- `username`: WordPress username
- Either `password` or `app_password`: Regular password or application password

These parameters can be passed as query parameters or in the request body.

### Posts

- `GET /api/wordpress/posts` - Get all posts
- `GET /api/wordpress/posts/:id` - Get a specific post
- `POST /api/wordpress/posts` - Create a new post
- `PUT /api/wordpress/posts/:id` - Update a post
- `DELETE /api/wordpress/posts/:id` - Delete a post

### Pages

- `GET /api/wordpress/pages` - Get all pages
- `GET /api/wordpress/pages/:id` - Get a specific page
- `POST /api/wordpress/pages` - Create a new page
- `PUT /api/wordpress/pages/:id` - Update a page
- `DELETE /api/wordpress/pages/:id` - Delete a page

### Media

- `GET /api/wordpress/media` - Get all media
- `GET /api/wordpress/media/:id` - Get a specific media item
- `POST /api/wordpress/media` - Upload a media file
- `DELETE /api/wordpress/media/:id` - Delete a media item

### Users

- `GET /api/wordpress/users` - Get all users
- `GET /api/wordpress/users/:id` - Get a specific user
- `POST /api/wordpress/users` - Create a new user
- `PUT /api/wordpress/users/:id` - Update a user
- `DELETE /api/wordpress/users/:id` - Delete a user

### Categories

- `GET /api/wordpress/categories` - Get all categories
- `GET /api/wordpress/categories/:id` - Get a specific category
- `POST /api/wordpress/categories` - Create a new category
- `PUT /api/wordpress/categories/:id` - Update a category
- `DELETE /api/wordpress/categories/:id` - Delete a category

### Tags

- `GET /api/wordpress/tags` - Get all tags
- `GET /api/wordpress/tags/:id` - Get a specific tag
- `POST /api/wordpress/tags` - Create a new tag
- `PUT /api/wordpress/tags/:id` - Update a tag
- `DELETE /api/wordpress/tags/:id` - Delete a tag

### Comments

- `GET /api/wordpress/comments` - Get all comments
- `GET /api/wordpress/comments/:id` - Get a specific comment
- `POST /api/wordpress/comments` - Create a new comment
- `PUT /api/wordpress/comments/:id` - Update a comment
- `DELETE /api/wordpress/comments/:id` - Delete a comment

### Menus (requires WP API Menus plugin)

- `GET /api/wordpress/menus` - Get all menus
- `GET /api/wordpress/menus/:id` - Get a specific menu

### Settings (requires WP REST API - Settings plugin)

- `GET /api/wordpress/settings` - Get all settings
- `PUT /api/wordpress/settings` - Update settings

### Plugins (requires WP REST API - Plugins Extension)

- `GET /api/wordpress/plugins` - Get all plugins
- `GET /api/wordpress/plugins/:plugin` - Get a specific plugin
- `PUT /api/wordpress/plugins/:plugin/activate` - Activate a plugin
- `PUT /api/wordpress/plugins/:plugin/deactivate` - Deactivate a plugin

### Custom Post Types

- `GET /api/wordpress/custom/:type` - Get all posts of a custom type
- `GET /api/wordpress/custom/:type/:id` - Get a specific post of a custom type
- `POST /api/wordpress/custom/:type` - Create a new post of a custom type
- `PUT /api/wordpress/custom/:type/:id` - Update a post of a custom type
- `DELETE /api/wordpress/custom/:type/:id` - Delete a post of a custom type

### Custom Endpoints

- `ALL /api/wordpress/custom/:endpoint` - Make a request to a custom endpoint

## Example Requests

### Using the MCP Endpoint

```bash
# Using POST with JSON body (MCP standard format)
curl -X POST "http://localhost:3000/api/mcp" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Show me all published posts"}
    ]
  }'
```

### Using the Natural Language API (Legacy)

```bash
# Using POST with JSON body
curl -X POST "http://localhost:3000/api/wordpress/nlp" \
  -H "Content-Type: application/json" \
  -d '{
    "site_url": "https://example.com",
    "username": "admin",
    "password": "password",
    "query": "Show me all published posts"
  }'

# Using GET with query parameters
curl -X GET "http://localhost:3000/api/wordpress/nlp?site_url=https://example.com&username=admin&password=password&query=List%20all%20categories"
```

### Using the REST API directly

#### Get all posts

```bash
curl -X GET "http://localhost:3000/api/wordpress/posts?site_url=https://example.com&username=admin&password=password"
```

#### Create a new post

```bash
curl -X POST "http://localhost:3000/api/wordpress/posts" \
  -H "Content-Type: application/json" \
  -d '{
    "site_url": "https://example.com",
    "username": "admin",
    "password": "password",
    "title": "Hello World",
    "content": "This is my first post!",
    "status": "publish"
  }'
```

#### Upload media

```bash
curl -X POST "http://localhost:3000/api/wordpress/media?site_url=https://example.com&username=admin&password=password" \
  -F "file=@/path/to/image.jpg" \
  -F "title=My Image"
```

## License

MIT# Mise à jour le Mar  4 mar 2025 23:25:08 CET


EX request :

curl -X POST "http://localhost:3000/api/mcp" \
  -H "Content-Type: application/json" \
  -d "{
    \"messages\": [
      {
        \"role\": \"user\",
        \"content\": \"Fais une requête GET sur /wp-json/wp/v2/pages/38 et montre-moi le contenu brut de la page\"
      }
    ],
    \"wordpress_credentials\": {
      \"site_url\": \"https://jess-jeff.fr\",
      \"username\": \"eyann\",
      \"app_password\": \"w9Mf 8iLp 5LI4 fKaX 36MP Bq9y\"
    }
  }"