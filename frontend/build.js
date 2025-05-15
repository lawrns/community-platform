// Custom build script for Next.js static export
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🚀 Starting custom build process for Next.js static export');

// Clean the out directory if it exists
const outDir = path.join(__dirname, 'out');
if (fs.existsSync(outDir)) {
  console.log('🧹 Cleaning out directory...');
  execSync(`rm -rf ${outDir}`, { stdio: 'inherit' });
}

// Generate Tailwind CSS
console.log('🎨 Generating Tailwind CSS...');
execSync('npx tailwindcss -i ./app/globals.css -o ./styles/tailwind-output.css', { stdio: 'inherit' });

// Run the Next.js build with explicit output directory
console.log('📦 Building Next.js application...');
execSync('next build', { stdio: 'inherit' });

// Create a standalone export
console.log('📤 Creating static export...');
execSync('next export -o out', { stdio: 'inherit' });

// Ensure CSS is properly included
console.log('🎨 Ensuring CSS is properly included...');

// Copy the generated Tailwind CSS to the output directory
const tailwindCssPath = path.join(__dirname, 'styles/tailwind-output.css');
const tailwindCssTargetDir = path.join(outDir, 'styles');

if (fs.existsSync(tailwindCssPath)) {
  if (!fs.existsSync(tailwindCssTargetDir)) {
    fs.mkdirSync(tailwindCssTargetDir, { recursive: true });
  }
  
  fs.copyFileSync(
    tailwindCssPath, 
    path.join(tailwindCssTargetDir, 'tailwind-output.css')
  );
  console.log('Copied Tailwind CSS file');
}

// Copy any CSS files from .next/static/css to out/_next/static/css
const cssSourceDir = path.join(__dirname, '.next/static/css');
const cssTargetDir = path.join(outDir, '_next/static/css');

if (fs.existsSync(cssSourceDir)) {
  if (!fs.existsSync(cssTargetDir)) {
    fs.mkdirSync(cssTargetDir, { recursive: true });
  }
  
  const cssFiles = fs.readdirSync(cssSourceDir);
  cssFiles.forEach(file => {
    const sourcePath = path.join(cssSourceDir, file);
    const targetPath = path.join(cssTargetDir, file);
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`Copied CSS file: ${file}`);
  });
}

// Find all HTML files in the output directory
const htmlFiles = glob.sync(path.join(outDir, '**/*.html'));

// Add CSS links to all HTML files
console.log('📝 Adding CSS links to HTML files...');
htmlFiles.forEach(htmlFile => {
  let htmlContent = fs.readFileSync(htmlFile, 'utf8');
  
  // Check if CSS links are missing and add them if needed
  if (!htmlContent.includes('rel="stylesheet"')) {
    htmlContent = htmlContent.replace(
      '<head>',
      `<head>\n  <link rel="stylesheet" href="/_next/static/css/app.css">\n  <link rel="stylesheet" href="/styles/tailwind-output.css">`
    );
    fs.writeFileSync(htmlFile, htmlContent);
    console.log(`Added CSS links to ${path.relative(__dirname, htmlFile)}`);
  }
});

// Create a simple CSS file if none exists
if (!fs.existsSync(path.join(outDir, '_next/static/css/app.css'))) {
  if (!fs.existsSync(path.join(outDir, '_next/static/css'))) {
    fs.mkdirSync(path.join(outDir, '_next/static/css'), { recursive: true });
  }
  
  // Create a minimal CSS file with the essential styles
  fs.writeFileSync(path.join(outDir, '_next/static/css/app.css'), `
    /* Fallback CSS */
    :root {
      --background: 0 0% 100%;
      --foreground: 222.2 47.4% 11.2%;
      --primary: 222.2 47.4% 11.2%;
      --primary-foreground: 210 40% 98%;
      --secondary: 210 40% 96.1%;
      --secondary-foreground: 222.2 47.4% 11.2%;
      --muted: 210 40% 96.1%;
      --muted-foreground: 215.4 16.3% 46.9%;
      --accent: 210 40% 96.1%;
      --accent-foreground: 222.2 47.4% 11.2%;
      --border: 214.3 31.8% 91.4%;
      --input: 214.3 31.8% 91.4%;
      --ring: 222.2 47.4% 11.2%;
    }
    
    .dark {
      --background: 224 71% 4%;
      --foreground: 213 31% 91%;
      --primary: 210 40% 98%;
      --primary-foreground: 222.2 47.4% 1.2%;
      --secondary: 222.2 47.4% 11.2%;
      --secondary-foreground: 210 40% 98%;
      --muted: 223 47% 11%;
      --muted-foreground: 215.4 16.3% 56.9%;
      --accent: 216 34% 17%;
      --accent-foreground: 210 40% 98%;
      --border: 216 34% 17%;
      --input: 216 34% 17%;
      --ring: 213 31% 91%;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: hsl(var(--background));
      color: hsl(var(--foreground));
    }
    
    a {
      color: inherit;
      text-decoration: none;
    }
    
    button, input, select, textarea {
      font-family: inherit;
    }
  `);
  
  console.log('Created fallback CSS file');
}

console.log('✅ Build completed successfully!');

