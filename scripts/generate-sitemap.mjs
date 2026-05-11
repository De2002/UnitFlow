import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '..');
const INDEX_PATH = path.join(ROOT, 'index.html');
const SITEMAP_INDEX_PATH = path.join(ROOT, 'sitemap.xml');
const BASE_URL = 'https://www.omniconverter.cyou';

const CATEGORY_CONFIG = [
  { slug: 'length', unitsConstName: 'LENGTH_UNITS', categoryPriority: '0.9', conversionPriority: '0.8' },
  { slug: 'area', unitsConstName: 'AREA_UNITS', categoryPriority: '0.7', conversionPriority: '0.7' },
  { slug: 'volume', categoryPriority: '0.7' },
  { slug: 'weight', categoryPriority: '0.7' },
  { slug: 'temperature', categoryPriority: '0.7' },
  { slug: 'speed', categoryPriority: '0.7' },
  { slug: 'time', categoryPriority: '0.7' },
  { slug: 'data', categoryPriority: '0.7' },
  { slug: 'energy', categoryPriority: '0.7' },
];

const indexContent = fs.readFileSync(INDEX_PATH, 'utf8');
const lastmod = new Date().toISOString().slice(0, 10);

function getUnitKeys(unitsConstName) {
  if (!unitsConstName) return [];

  const sectionMatch = indexContent.match(new RegExp(`const\\s+${unitsConstName}\\s*=\\s*\\[(.*?)\\n\\];`, 's'));
  if (!sectionMatch) {
    throw new Error(`Could not find ${unitsConstName} in index.html`);
  }

  const unitKeyRegex = /key:\s*'([^']+)'/g;
  const unitKeys = [];

  let match;
  while ((match = unitKeyRegex.exec(sectionMatch[1])) !== null) {
    unitKeys.push(match[1]);
  }

  return [...new Set(unitKeys)];
}

function toXmlUrlTag({ loc, lastmod: itemLastmod, changefreq, priority }) {
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    `    <lastmod>${itemLastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
}

function buildCategoryUrls(category) {
  const urls = [
    {
      loc: `${BASE_URL}/${category.slug}`,
      lastmod,
      changefreq: 'weekly',
      priority: category.categoryPriority,
    },
  ];

  const unitKeys = getUnitKeys(category.unitsConstName);
  if (!unitKeys.length) return urls;

  for (const from of unitKeys) {
    const fromSlug = from.replace(/_/g, '-');
    urls.push({
      loc: `${BASE_URL}/${category.slug}/${fromSlug}`,
      lastmod,
      changefreq: 'weekly',
      priority: category.conversionPriority,
    });
  }

  for (const from of unitKeys) {
    for (const to of unitKeys) {
      if (from === to) continue;
      urls.push({
        loc: `${BASE_URL}/${category.slug}/${from.replace(/_/g, '-')}/to/${to.replace(/_/g, '-')}`,
        lastmod,
        changefreq: 'weekly',
        priority: category.conversionPriority,
      });
    }
  }

  return urls;
}

const sitemapFiles = [];
for (const category of CATEGORY_CONFIG) {
  const sitemapFilename = `sitemap-${category.slug}.xml`;
  const sitemapPath = path.join(ROOT, sitemapFilename);
  const urls = buildCategoryUrls(category);

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(toXmlUrlTag),
    '</urlset>',
    '',
  ].join('\n');

  fs.writeFileSync(sitemapPath, xml, 'utf8');
  sitemapFiles.push({ loc: `${BASE_URL}/${sitemapFilename}`, lastmod });
  console.log(`Generated ${sitemapFilename} with ${urls.length} URLs.`);
}

const sitemapIndexXml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...sitemapFiles.map((sitemap) => [
    '  <sitemap>',
    `    <loc>${sitemap.loc}</loc>`,
    `    <lastmod>${sitemap.lastmod}</lastmod>`,
    '  </sitemap>',
  ].join('\n')),
  '</sitemapindex>',
  '',
].join('\n');

fs.writeFileSync(SITEMAP_INDEX_PATH, sitemapIndexXml, 'utf8');
console.log(`Generated sitemap index at ${SITEMAP_INDEX_PATH} with ${sitemapFiles.length} category sitemaps.`);
