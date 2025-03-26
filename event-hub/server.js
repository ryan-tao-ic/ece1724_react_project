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

app.prepare().then(() => {
  console.log(`Starting server on port ${port}...`);
  
  createServer((req, res) => {
    // Be sure to pass `true` as the second argument to `url.parse`.
    // This tells it to parse the query portion of the URL.
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, '0.0.0.0', (err) => {
    if (err) throw err;
    console.log(`> Ready on http://0.0.0.0:${port}`);
  });
}); 