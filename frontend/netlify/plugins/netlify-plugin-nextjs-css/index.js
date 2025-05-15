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

    // Copy the Tailwind CSS file from the source directory
    const tailwindCssPath = path.join(process.cwd(), 'styles/tailwind-output.css');
    if (fs.existsSync(tailwindCssPath)) {
      fs.copyFileSync(
        tailwindCssPath,
        path.join(stylesDir, 'tailwind-output.css')
      );
      console.log('Copied Tailwind CSS file');
    } else {
      console.log('Warning: Tailwind CSS file not found at', tailwindCssPath);
    }

    // Copy CSS files from .next/static/css to the output directory
    const nextCssDir = path.join(process.cwd(), '.next/static/css');
    if (fs.existsSync(nextCssDir)) {
      const cssFiles = fs.readdirSync(nextCssDir);

      // Create the target directory if it doesn't exist
      const cssTargetDir = path.join(PUBLISH_DIR, '_next/static/css');
      if (!fs.existsSync(cssTargetDir)) {
        fs.mkdirSync(cssTargetDir, { recursive: true });
      }

      cssFiles.forEach(file => {
        const sourcePath = path.join(nextCssDir, file);
        const targetPath = path.join(cssTargetDir, file);

        fs.copyFileSync(sourcePath, targetPath);
        console.log(`Copied CSS file: ${file}`);
      });
    } else {
      console.log('Warning: Next.js CSS directory not found at', nextCssDir);
    }

    // Generate a fallback CSS file
    const fallbackCssPath = path.join(stylesDir, 'fallback.css');
    fs.writeFileSync(fallbackCssPath, `
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
        --radius: 0.5rem;
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

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background-color: hsl(var(--background));
        color: hsl(var(--foreground));
        margin: 0;
        padding: 0;
      }
    `);
    console.log('Created fallback CSS file');

    // Find all HTML files and add CSS links if missing
    const htmlFiles = glob.sync(path.join(PUBLISH_DIR, '**/*.html'));

    htmlFiles.forEach(htmlFile => {
      let htmlContent = fs.readFileSync(htmlFile, 'utf8');

      // Check if CSS links are missing
      if (!htmlContent.includes('rel="stylesheet"')) {
        htmlContent = htmlContent.replace(
          '<head>',
          `<head>
  <link rel="stylesheet" href="/styles/fallback.css">
  <link rel="stylesheet" href="/styles/tailwind-output.css">
  <link rel="stylesheet" href="/_next/static/css/app.css">`
        );
        fs.writeFileSync(htmlFile, htmlContent);
        console.log(`Added CSS links to ${path.relative(process.cwd(), htmlFile)}`);
      }
    });

    console.log('Next.js CSS handling plugin completed successfully!');
  }
};
