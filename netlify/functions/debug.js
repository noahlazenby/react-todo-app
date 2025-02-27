// Debug function to help troubleshoot Netlify deployment issues
exports.handler = async function(event, context) {
  // Get environment variables (redact sensitive info)
  const env = Object.keys(process.env).reduce((acc, key) => {
    // Skip sensitive keys
    if (key.includes('KEY') || key.includes('SECRET') || key.includes('TOKEN') || key.includes('PASSWORD')) {
      acc[key] = '[REDACTED]';
    } else {
      acc[key] = process.env[key];
    }
    return acc;
  }, {});

  // Get file system info
  let files = [];
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Check if key directories exist
    const dirs = [
      '.',
      './routes',
      './controllers',
      './middleware',
      './utils',
      './config'
    ];
    
    dirs.forEach(dir => {
      try {
        const dirPath = path.resolve(__dirname, dir);
        if (fs.existsSync(dirPath)) {
          const dirFiles = fs.readdirSync(dirPath);
          files.push({
            directory: dir,
            exists: true,
            files: dirFiles
          });
        } else {
          files.push({
            directory: dir,
            exists: false
          });
        }
      } catch (err) {
        files.push({
          directory: dir,
          error: err.message
        });
      }
    });
  } catch (err) {
    files = { error: err.message };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Debug information for Netlify Functions",
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NETLIFY: process.env.NETLIFY,
        CONTEXT: process.env.CONTEXT,
        DEPLOY_URL: process.env.DEPLOY_URL,
        DEPLOY_PRIME_URL: process.env.DEPLOY_PRIME_URL,
        URL: process.env.URL
      },
      event: {
        path: event.path,
        httpMethod: event.httpMethod,
        headers: event.headers,
        queryStringParameters: event.queryStringParameters
      },
      files: files
    }, null, 2)
  };
}; 