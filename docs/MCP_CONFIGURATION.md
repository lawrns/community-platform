# MCP Configuration Guide

## Overview

Model Control Protocol (MCP) is a system for integrating AI services into the community.io platform. This document outlines how to configure and use MCP for various AI-powered features.

## What is MCP?

MCP (Model Control Protocol) provides a standardized interface for interacting with various AI models and services. It allows the platform to:

1. Use different AI models for different tasks
2. Implement fallback mechanisms when primary models are unavailable
3. Manage API keys and rate limits
4. Track usage and costs
5. Implement caching for efficiency

## Required API Keys

The following API keys are required for full MCP functionality:

1. **OpenAI API Key** - Used for content moderation, embeddings, and semantic search
2. **Anthropic API Key** - Used for task analysis and generation
3. **Perplexity API Key** - Used for research-backed task expansion

## Environment Configuration

Add the following variables to your `.env` file:

```
# MCP Configuration
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
PERPLEXITY_API_KEY=your-perplexity-api-key

# MCP Service Configuration
MCP_DEFAULT_PROVIDER=anthropic
MCP_FALLBACK_PROVIDER=openai
MCP_RESEARCH_PROVIDER=perplexity
MCP_CACHE_ENABLED=true
MCP_CACHE_TTL=3600
```

## MCP Service Roles

MCP defines different service roles for specific tasks:

1. **main** - Primary AI service for task generation and analysis (default: Anthropic Claude)
2. **fallback** - Backup service when main is unavailable (default: OpenAI)
3. **research** - Service for research-intensive tasks (default: Perplexity)
4. **moderation** - Content moderation service (default: OpenAI Moderation API)
5. **embedding** - Vector embedding service (default: OpenAI Embeddings API)

## MCP Integration Points

### Task Management

The task-master CLI uses MCP for:

1. Parsing PRD documents into structured tasks
2. Analyzing task complexity
3. Expanding complex tasks into subtasks
4. Updating tasks based on implementation changes

Example usage:
```bash
# Uses the 'main' service role
task-master parse-prd --input=docs/PRD.md

# Uses the 'research' service role
task-master analyze-complexity --research

# Uses the 'main' service role with research context
task-master expand --id=5 --research
```

### Content Moderation

The platform uses MCP for automated content moderation:

```javascript
const { moderateContent } = require('./services/mcp');

// Check if content violates platform policies
const moderationResult = await moderateContent(userSubmittedContent);

if (moderationResult.flagged) {
  // Handle flagged content
  console.log('Content flagged for reasons:', moderationResult.categories);
}
```

### Semantic Search

Vector search functionality uses MCP for generating embeddings:

```javascript
const { generateEmbedding } = require('./services/mcp');

// Generate embedding for search query
const queryEmbedding = await generateEmbedding(searchQuery);

// Search database using the embedding
const results = await db.query(`
  SELECT *, (embedding <=> $1) AS distance
  FROM content
  ORDER BY distance
  LIMIT 10
`, [queryEmbedding]);
```

### Personalized Recommendations

The recommendation engine uses MCP for content analysis:

```javascript
const { analyzeContent } = require('./services/mcp');

// Analyze content to extract topics and entities
const contentAnalysis = await analyzeContent(articleContent);

// Use analysis for content categorization
const topics = contentAnalysis.topics;
const entities = contentAnalysis.entities;
```

## MCP Configuration File

For advanced configuration, create an `mcp-config.json` file:

```json
{
  "providers": {
    "anthropic": {
      "models": {
        "default": "claude-3-7-sonnet-20250219",
        "fallback": "claude-3.5-sonnet-20240620"
      },
      "parameters": {
        "temperature": 0.7,
        "max_tokens": 4000
      }
    },
    "openai": {
      "models": {
        "default": "gpt-4o",
        "fallback": "gpt-3.5-turbo"
      },
      "parameters": {
        "temperature": 0.7,
        "max_tokens": 2000
      }
    },
    "perplexity": {
      "models": {
        "default": "sonar-pro"
      },
      "parameters": {
        "temperature": 0.5,
        "max_tokens": 2000
      }
    }
  },
  "roles": {
    "main": {
      "provider": "anthropic",
      "model": "default"
    },
    "fallback": {
      "provider": "openai",
      "model": "default"
    },
    "research": {
      "provider": "perplexity",
      "model": "default"
    },
    "moderation": {
      "provider": "openai",
      "model": "text-moderation-latest"
    },
    "embedding": {
      "provider": "openai",
      "model": "text-embedding-3-small"
    }
  },
  "cache": {
    "enabled": true,
    "ttl": 3600,
    "maxSize": "100MB"
  },
  "rateLimits": {
    "anthropic": {
      "requestsPerMinute": 60
    },
    "openai": {
      "requestsPerMinute": 60
    },
    "perplexity": {
      "requestsPerMinute": 30
    }
  }
}
```

## MCP Service Implementation

The MCP service is implemented as a Node.js module that handles:

1. Provider selection based on role
2. API key management
3. Request formatting for different providers
4. Response parsing
5. Error handling and fallbacks
6. Caching of responses
7. Rate limiting

Basic implementation example:

```javascript
// services/mcp.js
const axios = require('axios');
const NodeCache = require('node-cache');

// Initialize cache
const cache = new NodeCache({ stdTTL: process.env.MCP_CACHE_TTL || 3600 });

// Load configuration
const config = require('../mcp-config.json');

// Get provider for role
function getProviderForRole(role) {
  const roleConfig = config.roles[role];
  if (!roleConfig) {
    throw new Error(`Unknown MCP role: ${role}`);
  }
  return {
    provider: roleConfig.provider,
    model: config.providers[roleConfig.provider].models[roleConfig.model]
  };
}

// Make AI service call
async function callService(role, prompt, options = {}) {
  // Generate cache key
  const cacheKey = `${role}:${JSON.stringify(prompt)}:${JSON.stringify(options)}`;
  
  // Check cache
  if (config.cache.enabled) {
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }
  }
  
  // Get provider configuration
  const { provider, model } = getProviderForRole(role);
  
  // Get API key
  const apiKey = process.env[`${provider.toUpperCase()}_API_KEY`];
  if (!apiKey) {
    throw new Error(`API key not found for provider: ${provider}`);
  }
  
  try {
    // Make API call (implementation varies by provider)
    let result;
    if (provider === 'anthropic') {
      result = await callAnthropic(model, prompt, apiKey, options);
    } else if (provider === 'openai') {
      result = await callOpenAI(model, prompt, apiKey, options);
    } else if (provider === 'perplexity') {
      result = await callPerplexity(model, prompt, apiKey, options);
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }
    
    // Cache result
    if (config.cache.enabled) {
      cache.set(cacheKey, result);
    }
    
    return result;
  } catch (error) {
    // Handle error and try fallback if available
    console.error(`Error calling ${provider} for role ${role}:`, error);
    
    if (role === 'main') {
      console.log('Trying fallback service...');
      return callService('fallback', prompt, options);
    }
    
    throw error;
  }
}

// Export MCP functions
module.exports = {
  generateTasks: (prd) => callService('main', { role: 'task_generator', content: prd }),
  analyzeComplexity: (task) => callService('main', { role: 'complexity_analyzer', content: task }),
  expandTask: (task, research = false) => {
    const role = research ? 'research' : 'main';
    return callService(role, { role: 'task_expander', content: task });
  },
  moderateContent: (content) => callService('moderation', { content }),
  generateEmbedding: (text) => callService('embedding', { text }),
  // Additional MCP functions...
};
```

## Monitoring MCP Usage

To monitor MCP usage and costs:

1. Enable logging for all MCP calls
2. Track token usage by provider and model
3. Set up alerts for approaching rate limits or budget thresholds

Example logging:
```javascript
// Log MCP call
function logMcpCall(role, provider, model, promptTokens, completionTokens) {
  console.log(`MCP Call: ${role} - ${provider}/${model} - Tokens: ${promptTokens}/${completionTokens}`);
  
  // Store in database for analytics
  db.query(`
    INSERT INTO mcp_logs (timestamp, role, provider, model, prompt_tokens, completion_tokens)
    VALUES (NOW(), $1, $2, $3, $4, $5)
  `, [role, provider, model, promptTokens, completionTokens]);
}
```

## Troubleshooting MCP Issues

Common issues and solutions:

1. **Missing API Keys**
   - Ensure all required API keys are set in the `.env` file
   - Verify API keys are valid and have sufficient credits

2. **Rate Limiting**
   - Implement exponential backoff for retry logic
   - Consider upgrading API plans for higher rate limits
   - Distribute load across multiple providers

3. **Model Unavailability**
   - Configure appropriate fallbacks for each role
   - Monitor service status pages for outages
   - Implement graceful degradation for AI-powered features

4. **High Latency**
   - Optimize prompts to reduce token usage
   - Implement caching for common requests
   - Consider using smaller, faster models for non-critical tasks
