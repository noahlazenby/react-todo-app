const fs = require('fs');
const path = require('path');

// Directories to copy from server to netlify/functions
const directories = [
  'routes',
  'controllers',
  'middleware',
  'utils',
  'config'
];

// Create base netlify/functions directory if it doesn't exist
const functionsDir = path.join(__dirname, '..', 'netlify', 'functions');
if (!fs.existsSync(functionsDir)) {
  fs.mkdirSync(functionsDir, { recursive: true });
}

// Copy each directory
directories.forEach(dir => {
  const sourceDir = path.join(__dirname, '..', 'server', dir);
  const targetDir = path.join(functionsDir, dir);
  
  // Skip if source directory doesn't exist
  if (!fs.existsSync(sourceDir)) {
    console.log(`Source directory ${sourceDir} does not exist. Skipping.`);
    return;
  }
  
  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Copy all files from source to target
  const files = fs.readdirSync(sourceDir);
  files.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);
    
    // Skip directories
    if (fs.statSync(sourcePath).isDirectory()) {
      console.log(`Skipping directory ${sourcePath}`);
      return;
    }
    
    // Copy file
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`Copied ${sourcePath} to ${targetPath}`);
  });
});

console.log('Server files copied to netlify/functions successfully!'); 