import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '..');
const INDEX_PATH = path.join(ROOT, 'index.html');
const SITEMAP_PATH = path.join(ROOT, 'sitemap.xml');
const BASE_URL = 'https://www.omniconverter.cyou';

const indexContent = fs.readFileSync(INDEX_PATH, 'utf8');

const unitsSectionMatch = indexContent.match(/const\s+LENGTH_UNITS\s*=\s*\[(.*?)\n\];/s);
if (!unitsSectionMatch) {
  throw new Error('Could not find LENGTH_UNITS in index.html');
}

const unitsSection = unitsSectionMatch[1];
const unitKeyRegex = /key:\s*'([^']+)'/g;
const unitKeys = [];
let match;
while ((match = unitKeyRegex.exec(unitsSection)) !== null) {
  unitKeys.push(match[1]);
}

const uniqueUnitKeys = [...new Set(unitKeys)];

const urls = new Set([
  `${BASE_URL}/`,
  `${BASE_URL}/length`,
]);

for (const from of uniqueUnitKeys) {
  urls.add(`${BASE_URL}/length/${from.replace(/_/g, '-')}`);
}

for (const from of uniqueUnitKeys) {
  for (const to of uniqueUnitKeys) {
    if (from === to) continue;
    urls.add(`${BASE_URL}/length/${from.replace(/_/g, '-')}/to/${to.replace(/_/g, '-')}`);
  }
}

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...[...urls].map((url) => `  <url><loc>${url}</loc></url>`),
  '</urlset>',
  '',
].join('\n');

fs.writeFileSync(SITEMAP_PATH, xml, 'utf8');
console.log(`Generated ${SITEMAP_PATH} with ${urls.size} URLs.`);
