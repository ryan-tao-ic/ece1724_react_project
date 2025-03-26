// This file is a custom server for Next.js that explicitly handles PORT

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');
const fs = require('fs');

// Use port from environment or default to 8080
const port = parseInt(process.env.PORT || '8080', 10);

// Create Next.js app instance
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: process.cwd() });
const handle = app.getRequestHandler();

// First create the HTTP server to bind to the port immediately
const server = createServer((req, res) => {
  // Initially respond with a simple message until Next.js is ready
  if (!app.ready) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Server starting, please wait...');
    return;
  }

  // Once Next.js is ready, use its request handler
  const parsedUrl = parse(req.url, true);
  handle(req, res, parsedUrl);
});

// Start listening immediately to satisfy Cloud Run's health check
server.listen(port, '0.0.0.0', (err) => {
  if (err) {
    console.error('Failed to start server:', err);
    return;
  }
  console.log(`> Server listening on http://0.0.0.0:${port}`);
});

// Then prepare the Next.js app in the background
console.log('Initializing Next.js application...');
app.prepare()
  .then(() => {
    console.log('Next.js initialization complete');
    app.ready = true;
  })
  .catch((err) => {
    console.error('Error initializing Next.js:', err);
    process.exit(1);
  }); 