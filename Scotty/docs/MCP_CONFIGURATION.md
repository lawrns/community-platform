# MCP Configuration Guide

This document explains how to configure and use the Model Control Protocol (MCP) integration with task-master in the Scotty framework.

## Overview

Scotty's task management system uses task-master's MCP integration to enable AI-assisted task management, complexity analysis, and research-backed task expansion. This integration requires configuration of API keys in your `.env` file.

## Required API Keys

Task-master requires the following API keys for MCP functionality:

1. **OpenAI API Key**: Used for AI-assisted task management, complexity analysis, and task expansion
2. **Perplexity API Key**: Used for research-backed expansions and knowledge-intensive operations

## Configuration Steps

1. Create a `.env` file in your project root:
   ```bash
   cp templates/.env.example .env
   ```

2. Add your API keys to the `.env` file:
   ```
   OPENAI_API_KEY=sk-...
   PERPLEXITY_API_KEY=pplx-...
   ```

3. Ensure your `.env` file is listed in `.gitignore` to prevent committing sensitive keys

## Using MCP-Enabled Features

Once your API keys are configured, you can use these task-master commands that leverage MCP:

### Complexity Analysis with Research

```bash
task-master analyze-complexity --research
```

This command uses AI to:
- Analyze the complexity of each task
- Research technical considerations and implementation approaches
- Generate a complexity report with scores and insights
- Store results in `tasks/task-complexity-report.json`

### Task Expansion with Research

```bash
task-master expand --id=<id> --research
```

This command uses AI to:
- Break down complex tasks into logical subtasks
- Conduct research on implementation approaches
- Recommend optimal strategies based on research findings
- Consider dependencies and technical constraints

### PRD Parsing

```bash
task-master parse-prd --input=<prd-file>
```

This command uses AI to:
- Analyze a Product Requirements Document
- Extract key features and requirements
- Generate structured tasks with proper dependencies
- Create an initial tasks.json file

## Advanced MCP Configuration

For more advanced control over the MCP integration:

### Selecting AI Models

You can specify which AI model to use for different operations:

```
DEFAULT_AI_MODEL=gpt-4o
COMPLEXITY_ANALYSIS_MODEL=gpt-4o
TASK_EXPANSION_MODEL=claude-3-opus
```

### Customizing Prompts

You can customize the prompts used for AI operations:

```bash
task-master expand --id=<id> --prompt="Consider the SOLID principles and prioritize maintainability"
```

### Temperature Setting

Control the creativity/determinism balance:

```
AI_TEMPERATURE=0.2  # More deterministic
AI_TEMPERATURE=0.7  # More creative
```

## Troubleshooting MCP Integration

Common issues and solutions:

1. **API Key Authentication Errors**
   - Verify your API keys are correct and active
   - Check for trailing spaces or special characters

2. **Rate Limiting**
   - Implement exponential backoff in batch operations
   - Consider upgrading your API plan for higher rate limits

3. **Timeout Issues**
   - For research-intensive operations, increase the timeout settings:
     ```
     MCP_REQUEST_TIMEOUT=120000  # milliseconds
     ```

4. **Model Availability**
   - If a specified model is unavailable, configure fallbacks:
     ```
     FALLBACK_AI_MODEL=gpt-3.5-turbo
     ```

## Best Practices

1. **API Key Rotation**
   - Rotate your API keys regularly for security
   - Update your `.env` file when keys are rotated

2. **Cost Management**
   - Use `--research` flag selectively for high-complexity tasks
   - Monitor API usage to control costs

3. **Output Verification**
   - Always review AI-generated task breakdowns
   - Adjust and refine as needed before implementation
