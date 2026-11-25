const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const production = process.argv.includes('--production');
const root = production ? path.join(__dirname, 'dist') : __dirname;
const port = Number(process.env.PORT || (production ? 4174 : 4173));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
http.createServer((req, res) => {
  let file;
  try { file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname)); }
  catch { res.writeHead(400).end(); return; }
  if (file === root) file = path.join(root, 'index.html');
  const relative = path.relative(root, file);
  if (relative.startsWith('..') || path.isAbsolute(relative) || relative.split(path.sep).some(part => part.startsWith('.') || part === 'node_modules') || !types[path.extname(file)]) {
    res.writeHead(404).end('Not found'); return;
  }
  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) { res.writeHead(404).end('Not found'); return; }
    const headers = { 'Content-Type': types[path.extname(file)], 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' };
    let start = 0, end = stat.size - 1, status = 200;
    if (req.headers.range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if (!match || (!match[1] && !match[2])) { res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` }).end(); return; }
      start = match[1] ? Number(match[1]) : Math.max(0, stat.size - Number(match[2]));
      end = match[1] && match[2] ? Math.min(Number(match[2]), end) : end;
      if (start > end || start >= stat.size) { res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` }).end(); return; }
      status = 206;
      headers['Content-Range'] = `bytes ${start}-${end}/${stat.size}`;
    }
    headers['Content-Length'] = end - start + 1;
    res.writeHead(status, headers);
    if (req.method === 'HEAD') res.end();
    else fs.createReadStream(file, { start, end }).pipe(res);
  });
}).listen(port, '127.0.0.1', () => console.log(`Local preview: http://localhost:${port}`));
