import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '..');
const DIST = path.join(ROOT, 'dist');
const BASE_URL = 'https://www.omniconverter.cyou';

const SITEMAP_FILES = [
  'sitemap-length.xml',
  'sitemap-area.xml',
  'sitemap-volume.xml',
  'sitemap-weight.xml',
  'sitemap-temperature.xml',
  'sitemap-speed.xml',
  'sitemap-time.xml',
  'sitemap-data.xml',
  'sitemap-energy.xml'
];

function collectUrlsFromSitemap(filepath) {
  const xml = fs.readFileSync(filepath, 'utf8');
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].trim());
  return urls.filter((u) => u.startsWith(BASE_URL));
}

function routePathFromUrl(url) {
  const withoutBase = url.slice(BASE_URL.length);
  return withoutBase === '' ? '/' : withoutBase;
}

function ensureDir(dirpath) {
  fs.mkdirSync(dirpath, { recursive: true });
}

function writeRouteHtml(routePath, htmlTemplate) {
  const normalized = routePath.replace(/^\/+|\/+$/g, '');
  const dir = normalized ? path.join(DIST, normalized) : DIST;
  ensureDir(dir);

  const pathBootstrap = `\n<script>window.__PRERENDER_PATH__=${JSON.stringify(routePath)};</script>\n`;
  const html = htmlTemplate.replace('<head>', `<head>${pathBootstrap}`);
  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
}

function copyStaticFiles() {
  const passthroughFiles = [
    'robots.txt',
    'sitemap.xml',
    ...SITEMAP_FILES
  ];
  passthroughFiles.forEach((file) => {
    fs.copyFileSync(path.join(ROOT, file), path.join(DIST, file));
  });
}

function main() {
  fs.rmSync(DIST, { recursive: true, force: true });
  ensureDir(DIST);

  const htmlTemplate = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const allUrls = new Set([`${BASE_URL}/`, `${BASE_URL}/length`]);

  for (const sitemapFile of SITEMAP_FILES) {
    const filePath = path.join(ROOT, sitemapFile);
    if (!fs.existsSync(filePath)) continue;
    for (const url of collectUrlsFromSitemap(filePath)) allUrls.add(url);
  }

  for (const url of allUrls) {
    writeRouteHtml(routePathFromUrl(url), htmlTemplate);
  }

  copyStaticFiles();
  console.log(`Prerendered ${allUrls.size} routes into ${DIST}`);
}

main();
