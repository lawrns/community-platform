# Environment Configuration

This document explains how environment variables are used in Scotty projects and how to configure them properly.

## Overview

Scotty uses environment variables for storing sensitive information (like API keys), configuration settings, and project-specific parameters. These variables are stored in a `.env` file in the root of your project and are automatically loaded when running Scotty commands.

## Required API Keys

Scotty requires the following API keys for full functionality:

1. **OpenAI API Key**: Used for AI-assisted code generation, task complexity analysis, and other AI features.
2. **Perplexity API Key**: Used for research-backed task expansion and knowledge-intensive operations.

## Setting Up Your Environment

1. Copy the template file from your Scotty installation:
   ```bash
   cp <scotty-installation-path>/templates/.env.example .env
   ```

2. Edit the `.env` file with your actual API keys and configuration settings:
   ```
   OPENAI_API_KEY=sk-...
   PERPLEXITY_API_KEY=pplx-...
   ```

3. Customize other settings as needed for your project.

## Environment Variables Reference

### AI Service API Keys

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | API key for OpenAI services |
| `PERPLEXITY_API_KEY` | Yes | API key for Perplexity AI research |
| `ANTHROPIC_API_KEY` | No | Optional API key for Claude models |

### Task Management Settings

| Variable | Required | Description |
|----------|----------|-------------|
| `DEFAULT_TASK_PRIORITY` | No | Default priority for new tasks (high, medium, low) |
| `DEFAULT_SUBTASK_COUNT` | No | Default number of subtasks when expanding tasks |

### Project Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `PROJECT_NAME` | No | Name of your project |
| `PROJECT_TYPE` | No | Type of project (web, mobile, data-science) |

### GitHub Integration

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN` | No | GitHub Personal Access Token for repository integration |
| `GITHUB_REPO` | No | GitHub repository URL |

### Deployment Settings

| Variable | Required | Description |
|----------|----------|-------------|
| `DEPLOYMENT_PROVIDER` | No | Deployment platform (netlify, vercel, aws, etc.) |
| `DEPLOYMENT_API_TOKEN` | No | API token for deployment provider |

### Notification Settings

| Variable | Required | Description |
|----------|----------|-------------|
| `SLACK_WEBHOOK_URL` | No | Slack webhook URL for notifications |
| `NOTIFICATION_EMAIL` | No | Email address for notifications |

### Advanced Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `MAX_COMPLEXITY_THRESHOLD` | No | Threshold for task complexity (1-10) |
| `DEFAULT_AI_MODEL` | No | Default AI model to use |
| `MEMORY_DB_CONNECTION` | No | Connection string for memory database |
| `DEBUG_MODE` | No | Enable debug mode (true/false) |

## Security Best Practices

1. **Never commit your `.env` file to version control**
   - Ensure `.env` is listed in your `.gitignore` file

2. **Rotate API keys periodically**
   - Update your API keys every few months for security

3. **Use appropriate permission scopes**
   - Only request the permissions needed for your project

4. **Consider using environment variable management tools**
   - For larger teams, consider tools like Doppler or AWS Parameter Store

## Setting Environment Variables in CI/CD

If you're using CI/CD pipelines, you'll need to configure environment variables there as well:

### GitHub Actions Example

```yaml
name: Build and Test

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    - name: Install dependencies
      run: npm ci
    - name: Run tests
      env:
        OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        PERPLEXITY_API_KEY: ${{ secrets.PERPLEXITY_API_KEY }}
      run: npm test
```

## Troubleshooting

If Scotty commands are not working properly, check the following:

1. Verify that your `.env` file is in the project root directory
2. Confirm that API keys are correct and not expired
3. Check that the variables are using the correct names as specified in this document
4. Ensure no trailing spaces or special characters in your API keys

## Managing Multiple Environments

For projects with multiple environments (development, staging, production), consider using multiple environment files:

- `.env.development`
- `.env.staging`
- `.env.production`

You can specify which environment file to use with the `--env` flag:

```bash
task-master analyze-complexity --env=staging
```
