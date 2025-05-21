// A small script to check the rendered glass component classes
const http = require('http');

http.get('http://localhost:9200', (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    // Check what glass variant is being used
    const headerGlass = data.match(/Glass.*?class="([^"]*?)"/);
    const footerGlass = data.match(/class="relative backdrop-blur-md bg-glass[^"]*?"/);
    
    console.log('Header Glass found:', headerGlass ? 'Yes' : 'No');
    console.log('Header Glass class:', headerGlass ? headerGlass[0] : 'Not found');
    
    console.log('\nFooter Glass found:', footerGlass ? 'Yes' : 'No');
    console.log('Footer Glass class:', footerGlass ? footerGlass[0] : 'Not found');
    
    // Check if 'light' class is properly applied to html
    const htmlClass = data.match(/<html[^>]*class="([^"]*?)"/);
    console.log('\nHTML class:', htmlClass ? htmlClass[1] : 'Not found');
    
    // Look for light-specific styles
    const lightStylesFound = data.includes('light') && !data.includes('dark');
    console.log('Light-only styles found:', lightStylesFound ? 'Yes' : 'No');
  });
}).on('error', (err) => {
  console.log('Error: ' + err.message);
});