// Custom build script for Next.js static export
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting custom build process for Next.js static export');

// Clean the out directory if it exists
const outDir = path.join(__dirname, 'out');
if (fs.existsSync(outDir)) {
  console.log('🧹 Cleaning out directory...');
  execSync(`rm -rf ${outDir}`, { stdio: 'inherit' });
}

// Run the Next.js build with explicit output directory
console.log('📦 Building Next.js application...');
execSync('next build', { stdio: 'inherit' });

// Create a standalone export
console.log('📤 Creating static export...');
execSync('next export -o out', { stdio: 'inherit' });

// Ensure CSS is properly included
console.log('🎨 Ensuring CSS is properly included...');

// Copy the CSS files from .next/static/css to out/_next/static/css
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

// Ensure index.html exists and has proper CSS links
const indexPath = path.join(outDir, 'index.html');
if (fs.existsSync(indexPath)) {
  let indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Check if CSS link is missing and add it if needed
  if (!indexContent.includes('rel="stylesheet"')) {
    indexContent = indexContent.replace(
      '<head>',
      '<head>\n  <link rel="stylesheet" href="/_next/static/css/app.css">'
    );
    fs.writeFileSync(indexPath, indexContent);
    console.log('Added CSS link to index.html');
  }
}

console.log('✅ Build completed successfully!');

