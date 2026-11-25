const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = __dirname;
const out = path.resolve(root, 'dist');
if (path.dirname(out) !== root || path.basename(out) !== 'dist') throw new Error('Invalid output directory');
const config = require('./site.config.json');
const origin = new URL(process.env.SITE_URL || config.url).origin;
const preview = process.env.VERCEL_ENV === 'preview';
const pages = ['index.html', 'about.html', 'gallery.html', 'contact.html'];
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'assets'), { recursive: true });
const assets = new Map();
for (const file of ['styles.css', 'refinements.css', 'script.js']) {
  const content = fs.readFileSync(path.join(root, file));
  const hash = crypto.createHash('sha256').update(content).digest('hex').slice(0, 12);
  const output = `assets/${path.basename(file, path.extname(file))}.${hash}${path.extname(file)}`;
  // CSS image URLs resolve relative to the hashed stylesheet's assets directory.
  fs.writeFileSync(path.join(out, output), file.endsWith('.css') ? content.toString().replaceAll("url('images/", "url('../images/") : content);
  assets.set(file, output);
}
for (const directory of ['images', 'videos']) {
  fs.mkdirSync(path.join(out, directory));
  for (const name of fs.readdirSync(path.join(root, directory))) {
    if (directory === 'images' && !name.endsWith('.webp')) continue;
    if (directory === 'videos' && !name.endsWith('.mp4')) continue;
    fs.copyFileSync(path.join(root, directory, name), path.join(out, directory, name));
  }
}
const organization = {
  '@context': 'https://schema.org', '@type': 'EducationalOrganization',
  '@id': `${origin}/#organization`, name: 'PETTOP LONDON', url: origin + '/',
  description: 'Sensory-oriented English teacher training for preschool educators in Sri Lanka.',
  telephone: config.phone,
  address: { '@type': 'PostalAddress', streetAddress: config.streetAddress, addressLocality: 'Nugegoda', addressRegion: 'Colombo', addressCountry: 'LK' },
  areaServed: { '@type': 'Country', name: 'Sri Lanka' }
};
for (const file of pages) {
  let html = fs.readFileSync(path.join(root, file), 'utf8');
  for (const [source, output] of assets) html = html.replaceAll(`"${source}"`, `"${output}"`);
  const url = origin + (file === 'index.html' ? '/' : '/' + file);
  const metadata = `  <link rel="canonical" href="${escape(url)}">\n  <meta name="robots" content="${preview ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}">\n  <meta property="og:url" content="${escape(url)}">\n  <meta property="og:image" content="${origin}/images/hero-image.webp">\n  <meta name="twitter:image" content="${origin}/images/hero-image.webp">\n  <script type="application/ld+json">${JSON.stringify(organization).replaceAll('<', '\\u003c')}</script>\n`;
  html = html.replace('</head>', metadata + '</head>');
  fs.writeFileSync(path.join(out, file), html);
}
fs.copyFileSync(path.join(root, 'favicon.svg'), path.join(out, 'favicon.svg'));
fs.copyFileSync(path.join(root, '404.html'), path.join(out, '404.html'));
const urls = pages.map(file => origin + (file === 'index.html' ? '/' : '/' + file));
fs.writeFileSync(path.join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<url><loc>${escape(url)}</loc></url>`).join('')}</urlset>\n`);
fs.writeFileSync(path.join(out, 'robots.txt'), `User-agent: *\n${preview ? 'Disallow: /' : `Allow: /\nSitemap: ${origin}/sitemap.xml`}\n`);
console.log(`Built ${pages.length} pages in dist for ${origin}${preview ? ' (preview: noindex)' : ''}.`);
