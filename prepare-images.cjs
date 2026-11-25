// Preserve the supplied originals and produce browser-compatible, smaller assets.
const fs = require('node:fs/promises');
const sharp = require('sharp');
const convert = require('heic-convert');

(async () => {
  for (const file of await fs.readdir('images')) {
    if (!file.endsWith('.jpg')) continue;
    let buffer = await fs.readFile(`images/${file}`);
    if (buffer.subarray(4, 12).toString().includes('ftyp')) {
      buffer = Buffer.from(await convert({ buffer, format: 'JPEG', quality: 0.95 }));
    }
    const output = `images/${file.replace(/\.jpg$/, '.webp')}`;
    await sharp(buffer).rotate().resize({ width: 1800, withoutEnlargement: true }).webp({ quality: 84 }).toFile(output);
    console.log(output);
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
