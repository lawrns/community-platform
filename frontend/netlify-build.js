const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Set environment variables for Netlify build
process.env.NEXT_PUBLIC_IS_NETLIFY = 'true';
process.env.NEXT_PUBLIC_STATIC_EXPORT = 'true';

console.log('Starting Netlify build process...');

try {
  // Run the Next.js build
  console.log('Building Next.js application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Ensure _redirects file exists in the output directory
  const redirectsSource = path.join(__dirname, 'public', '_redirects');
  const redirectsDestination = path.join(__dirname, 'out', '_redirects');
  
  if (fs.existsSync(redirectsSource)) {
    fs.copyFileSync(redirectsSource, redirectsDestination);
    console.log('Copied _redirects file to output directory');
  } else {
    console.log('Creating _redirects file in output directory');
    fs.writeFileSync(redirectsDestination, '/* /index.html 200');
  }
  
  // Ensure 404.html exists in the output directory
  const notFoundSource = path.join(__dirname, 'public', '404.html');
  const notFoundDestination = path.join(__dirname, 'out', '404.html');
  
  if (fs.existsSync(notFoundSource)) {
    fs.copyFileSync(notFoundSource, notFoundDestination);
    console.log('Copied 404.html file to output directory');
  }
  
  console.log('Netlify build completed successfully!');
} catch (error) {
  console.error('Error during Netlify build:', error);
  process.exit(1);
}
