const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = fs.realpathSync(path.join(__dirname, '..'));
const host = '127.0.0.1';
const port = 8765;
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

const server = http.createServer(async (request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
  } catch {
    response.writeHead(400).end();
    return;
  }

  const relativePath = pathname === '/' ? 'index.html' : pathname.slice(1);
  const contentType = contentTypes[path.extname(relativePath).toLowerCase()];
  if (!contentType || (!['index.html','settings.html'].includes(relativePath) && !relativePath.startsWith('assets/'))) {
    response.writeHead(404).end();
    return;
  }

  try {
    const file = await fs.promises.realpath(path.resolve(root, relativePath));
    const resolvedPath = path.relative(root, file).split(path.sep).join('/');
    if (!['index.html','settings.html'].includes(resolvedPath) && !resolvedPath.startsWith('assets/')) {
      response.writeHead(404).end();
      return;
    }
    const info = await fs.promises.stat(file);
    if (!info.isFile()) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, { 'Content-Type': contentType, 'Content-Length': info.size });
    if (request.method === 'HEAD') {
      response.end();
      return;
    }
    const stream = fs.createReadStream(file);
    stream.on('error', () => response.destroy());
    response.on('close', () => stream.destroy());
    stream.pipe(response);
  } catch {
    response.writeHead(404).end();
  }
});

server.listen(port, host, () => console.log(`Riwaq preview: http://${host}:${port}/`));
