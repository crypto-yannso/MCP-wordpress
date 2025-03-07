# Documentation de l'API MCP WordPress

## Endpoint MCP principal

**URL** : `/api/mcp`

**Méthode** : `POST`

**Format de requête** :
```json
{
  "messages": [
    {"role": "user", "content": "Votre instruction en langage naturel pour WordPress"}
  ]
}
```

**Format de réponse réussie** :
```json
{
  "success": true,
  "response": {
    "role": "assistant",
    "content": "Réponse avec les résultats de l'opération WordPress"
  }
}
```

**Format d'erreur** :
```json
{
  "error": "Type d'erreur",
  "response": {
    "role": "assistant",
    "content": "Description de l'erreur rencontrée"
  }
}
```

## Exemples d'instructions en langage naturel

Le MCP peut traiter de nombreuses instructions reliées à WordPress :

- "Montre-moi tous les articles publiés"
- "Crée un nouvel article intitulé 'Mon nouvel article' avec le contenu 'Voici le contenu...'"
- "Mets à jour l'article avec l'ID 123 pour changer son titre en 'Nouveau titre'"
- "Supprime l'article avec l'ID 456"
- "Liste toutes les catégories"
- "Crée une nouvelle page appelée 'À propos'"
- "Obtiens les détails de l'utilisateur avec l'ID 2"
- "Active le plugin 'akismet'"

## Exemple d'utilisation avec cURL

```bash
curl -X POST "http://localhost:3000/api/mcp" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Liste tous les articles publiés"}
    ]
  }'
```

## Exemple d'utilisation avec JavaScript

```javascript
async function queryWordPressMCP(query) {
  const response = await fetch('http://localhost:3000/api/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [
        { role: 'user', content: query }
      ]
    })
  });
  
  return await response.json();
}

// Exemple d'utilisation
queryWordPressMCP("Montre-moi les 5 derniers articles")
  .then(result => console.log(result))
  .catch(error => console.error('Erreur:', error));
```

## Codes d'erreur

- `400` : Requête invalide (format incorrect ou paramètres manquants)
- `401` : Authentification WordPress échouée
- `500` : Erreur serveur interne
- `404` : Ressource WordPress non trouvée

## Configuration

Le MCP utilise les variables d'environnement suivantes pour se connecter à WordPress :

- `WP_URL` : URL du site WordPress
- `WP_USERNAME` : Nom d'utilisateur WordPress
- `WP_PASSWORD` ou `WP_APP_PASSWORD` : Mot de passe normal ou mot de passe d'application

## Modèles d'IA disponibles

Le MCP peut utiliser différents fournisseurs d'IA pour le traitement du langage naturel :

- OpenAI (GPT-4)
- Anthropic (Claude)
- Traitement NLP local via node-nlp (pour les requêtes simples)

La sélection du modèle est définie par la variable d'environnement `AI_PROVIDER`.

## Historique des conversations

Le MCP n'a pas de gestion de l'historique des conversations intégrée. Chaque requête est traitée indépendamment. Si vous avez besoin de maintenir un contexte de conversation, vous devez le gérer côté client et envoyer l'historique complet dans le tableau `messages`.

## Limites et considérations

- Le MCP est conçu pour fonctionner avec un site WordPress configuré dans les variables d'environnement
- L'authentification WordPress doit être configurée correctement
- Les opérations sont limitées aux fonctionnalités disponibles via l'API REST WordPress
- Certaines opérations avancées peuvent nécessiter des plugins WordPress spécifiques

## API Legacy (pour compatibilité)

En plus de l'endpoint MCP, l'ancien endpoint de traitement du langage naturel est toujours disponible :

**URL** : `/api/wordpress/nlp`

**Méthodes** : `POST`, `GET`

**Format de requête POST** :
```json
{
  "site_url": "https://example.com",
  "username": "admin",
  "password": "password",
  "query": "Montre-moi tous les articles publiés"
}
```

**Format de requête GET** :
```
/api/wordpress/nlp?site_url=https://example.com&username=admin&password=password&query=Liste%20toutes%20les%20catégories
```