// Custom Netlify plugin to handle CSS for Next.js static exports
const fs = require('fs');
const path = require('path');
const glob = require('glob');

module.exports = {
  onPostBuild: async ({ constants, utils }) => {
    const { PUBLISH_DIR } = constants;
    
    console.log('Running Next.js CSS handling plugin...');
    
    // Create styles directory if it doesn't exist
    const stylesDir = path.join(PUBLISH_DIR, 'styles');
    if (!fs.existsSync(stylesDir)) {
      fs.mkdirSync(stylesDir, { recursive: true });
    }
    
    // Copy CSS files from .next/static/css to the output directory
    const nextCssDir = path.join(process.cwd(), '.next/static/css');
    if (fs.existsSync(nextCssDir)) {
      const cssFiles = fs.readdirSync(nextCssDir);
      
      cssFiles.forEach(file => {
        const sourcePath = path.join(nextCssDir, file);
        const targetPath = path.join(stylesDir, file);
        
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`Copied CSS file: ${file}`);
      });
    }
    
    // Generate a basic CSS file if none exists
    const mainCssPath = path.join(stylesDir, 'main.css');
    if (!fs.existsSync(mainCssPath)) {
      fs.writeFileSync(mainCssPath, `
        /* Fallback CSS */
        :root {
          --background: 0 0% 100%;
          --foreground: 222.2 47.4% 11.2%;
          --primary: 222.2 47.4% 11.2%;
          --primary-foreground: 210 40% 98%;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: hsl(var(--background));
          color: hsl(var(--foreground));
          margin: 0;
          padding: 0;
        }
      `);
      console.log('Created fallback CSS file');
    }
    
    // Find all HTML files and add CSS links
    const htmlFiles = glob.sync(path.join(PUBLISH_DIR, '**/*.html'));
    
    htmlFiles.forEach(htmlFile => {
      let htmlContent = fs.readFileSync(htmlFile, 'utf8');
      
      if (!htmlContent.includes('rel="stylesheet"')) {
        htmlContent = htmlContent.replace(
          '<head>',
          `<head>
  <link rel="stylesheet" href="/styles/main.css">`
        );
        fs.writeFileSync(htmlFile, htmlContent);
        console.log(`Added CSS link to ${path.relative(process.cwd(), htmlFile)}`);
      }
    });
    
    console.log('Next.js CSS handling plugin completed successfully!');
  }
};
