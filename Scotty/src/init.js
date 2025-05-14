#!/usr/bin/env node

/**
 * Scotty Project Initializer
 * 
 * This script initializes a new project with the Scotty project management framework.
 * It creates the directory structure and essential files based on templates.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

// Setup readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuration
const DEFAULT_PROJECT_TYPE = 'web';
const PROJECT_TYPES = ['web', 'mobile', 'data-science'];
const SCOTTY_DIR = path.join(__dirname, '..');
const TEMPLATES_DIR = path.join(SCOTTY_DIR, 'templates');

/**
 * Prompt the user for input with a default value
 */
function prompt(question, defaultValue) {
  return new Promise((resolve) => {
    rl.question(`${question} (${defaultValue}): `, (answer) => {
      resolve(answer || defaultValue);
    });
  });
}

/**
 * Create a directory if it doesn't exist
 */
function createDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

/**
 * Copy a file from the templates directory to the target directory
 */
function copyFile(templateFile, targetFile, replacements = {}) {
  let content = fs.readFileSync(templateFile, 'utf8');
  
  // Replace placeholders with actual values
  Object.entries(replacements).forEach(([key, value]) => {
    const regex = new RegExp(`\\[${key}\\]`, 'g');
    content = content.replace(regex, value);
  });
  
  fs.writeFileSync(targetFile, content);
  console.log(`Created file: ${targetFile}`);
}

/**
 * Create the initial task.json file
 */
function createTasksJson(projectDir, projectName) {
  const tasksDir = path.join(projectDir, 'tasks');
  createDirectory(tasksDir);
  
  const tasksFile = path.join(tasksDir, 'tasks.json');
  const templateFile = path.join(TEMPLATES_DIR, 'example_tasks.json');
  
  const now = new Date().toISOString();
  
  // Read the template file
  let tasksContent = fs.readFileSync(templateFile, 'utf8');
  
  // Replace placeholders
  tasksContent = tasksContent
    .replace(/"projectName": "Example Project"/g, `"projectName": "${projectName}"`)
    .replace(/"lastUpdated": "[^"]+"/g, `"lastUpdated": "${now}"`);
  
  // Write to the target file
  fs.writeFileSync(tasksFile, tasksContent);
  console.log(`Created tasks file: ${tasksFile}`);
}

/**
 * Create project structure for different project types
 */
function createProjectStructure(projectDir, projectType) {
  // Common directories for all project types
  createDirectory(path.join(projectDir, 'src'));
  createDirectory(path.join(projectDir, 'docs'));
  createDirectory(path.join(projectDir, 'tasks'));
  createDirectory(path.join(projectDir, '.scotty'));
  createDirectory(path.join(projectDir, '.scotty/handoffs'));
  createDirectory(path.join(projectDir, 'schemas'));
  
  // Project type specific directories
  if (projectType === 'web') {
    createDirectory(path.join(projectDir, 'src/components'));
    createDirectory(path.join(projectDir, 'src/services'));
    createDirectory(path.join(projectDir, 'src/utils'));
    createDirectory(path.join(projectDir, 'src/assets'));
    createDirectory(path.join(projectDir, 'src/pages'));
    createDirectory(path.join(projectDir, 'public'));
  } else if (projectType === 'mobile') {
    createDirectory(path.join(projectDir, 'src/screens'));
    createDirectory(path.join(projectDir, 'src/components'));
    createDirectory(path.join(projectDir, 'src/services'));
    createDirectory(path.join(projectDir, 'src/utils'));
    createDirectory(path.join(projectDir, 'src/assets'));
    createDirectory(path.join(projectDir, 'src/navigation'));
  } else if (projectType === 'data-science') {
    createDirectory(path.join(projectDir, 'src/data'));
    createDirectory(path.join(projectDir, 'src/models'));
    createDirectory(path.join(projectDir, 'src/visualizations'));
    createDirectory(path.join(projectDir, 'src/utils'));
    createDirectory(path.join(projectDir, 'notebooks'));
    createDirectory(path.join(projectDir, 'data/raw'));
    createDirectory(path.join(projectDir, 'data/processed'));
  }
}

/**
 * Copy template files with replacements
 */
function copyTemplateFiles(projectDir, projectName, projectType, description) {
  // Common files for all project types
  const now = new Date().toISOString().split('T')[0];
  const replacements = {
    'Project Name': projectName,
    'Version Number': '0.1.0',
    'Date': now,
    'brief description': description
  };
  
  // Copy README.md
  copyFile(
    path.join(SCOTTY_DIR, 'README.md'),
    path.join(projectDir, 'README.md'),
    replacements
  );
  
  // Copy core documentation files
  copyFile(
    path.join(SCOTTY_DIR, 'docs/PRD.md'),
    path.join(projectDir, 'docs/PRD.md'),
    replacements
  );
  
  copyFile(
    path.join(SCOTTY_DIR, 'docs/ARCHITECTURE.md'),
    path.join(projectDir, 'docs/ARCHITECTURE.md'),
    replacements
  );
  
  copyFile(
    path.join(SCOTTY_DIR, 'docs/DEVELOPMENT.md'),
    path.join(projectDir, 'docs/DEVELOPMENT.md'),
    replacements
  );
  
  // Copy Scotty configuration files
  copyFile(
    path.join(SCOTTY_DIR, '.scotty/rules.md'),
    path.join(projectDir, '.scotty/rules.md'),
    replacements
  );
  
  copyFile(
    path.join(SCOTTY_DIR, '.scotty/context.md'),
    path.join(projectDir, '.scotty/context.md'),
    replacements
  );
  
  // Copy handoff protocols
  copyFile(
    path.join(SCOTTY_DIR, '.scotty/handoffs/README.md'),
    path.join(projectDir, '.scotty/handoffs/README.md'),
    replacements
  );
}

/**
 * Initialize Git repository
 */
function initGit(projectDir) {
  try {
    execSync('git init', { cwd: projectDir });
    
    // Create a basic .gitignore file
    const gitignoreContent = `
# Dependencies
node_modules/
.pnp/
.pnp.js

# Testing
/coverage/

# Production
/build/
/dist/

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor directories and files
.idea/
.vscode/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Data Science specific
*.pkl
*.h5
*.model
*.csv
*.xls
*.xlsx
/data/raw/
/data/processed/
notebooks/.ipynb_checkpoints/
`;
    
    fs.writeFileSync(path.join(projectDir, '.gitignore'), gitignoreContent);
    console.log('Initialized Git repository and created .gitignore');
  } catch (error) {
    console.error('Failed to initialize Git repository:', error.message);
  }
}

/**
 * The main function that runs the initialization process
 */
async function main() {
  console.log('Scotty Project Initializer');
  console.log('=========================');
  
  const projectName = await prompt('Project name', 'my-project');
  const projectDescription = await prompt('Project description', 'A project created with Scotty');
  
  console.log('\nAvailable project types:');
  PROJECT_TYPES.forEach((type, index) => {
    console.log(`${index + 1}. ${type}`);
  });
  
  const projectTypeInput = await prompt('Select project type (1-3)', '1');
  const projectType = PROJECT_TYPES[parseInt(projectTypeInput) - 1] || DEFAULT_PROJECT_TYPE;
  
  const projectPath = await prompt('Project directory', `./${projectName}`);
  
  // Create the project directory
  const projectDir = path.resolve(process.cwd(), projectPath);
  createDirectory(projectDir);
  
  // Create the project structure
  createProjectStructure(projectDir, projectType);
  
  // Copy template files
  copyTemplateFiles(projectDir, projectName, projectType, projectDescription);
  
  // Create initial tasks.json
  createTasksJson(projectDir, projectName);
  
  // Initialize Git
  const initGitRepo = await prompt('Initialize Git repository? (yes/no)', 'yes');
  if (initGitRepo.toLowerCase() === 'yes') {
    initGit(projectDir);
  }
  
  console.log(`\nProject initialized successfully at ${projectDir}`);
  console.log(`\nNext steps:`);
  console.log(`1. cd ${projectPath}`);
  console.log(`2. Install task-master CLI: npm install -g claude-task-master`);
  console.log(`3. Run 'task-master list' to see initial tasks`);
  
  rl.close();
}

// Run the main function
main().catch(error => {
  console.error('Error initializing project:', error);
  rl.close();
  process.exit(1);
});
