From Idea to Profit with OnSpace

## Sitemap

- Generate or refresh the sitemap index and all category sitemap files:
  - `node scripts/generate-sitemap.mjs`
- Output files:
  - `sitemap.xml` (sitemap index)
  - `sitemap-length.xml`, `sitemap-area.xml`, `sitemap-volume.xml`, `sitemap-weight.xml`, `sitemap-temperature.xml`, `sitemap-speed.xml`, `sitemap-time.xml`, `sitemap-data.xml`, `sitemap-energy.xml`
- Each category sitemap uses full URLs and includes `<lastmod>`, `<changefreq>`, and `<priority>` for every URL.
- `length` URLs are generated dynamically from `LENGTH_UNITS` in `index.html`.

## Static generation / prerendering

- Generate real HTML pages for every URL in the sitemaps:
  - `node scripts/prerender-pages.mjs`
- Output directory:
  - `dist/`
- Every route is emitted as a physical `index.html` file (for example, `dist/length/meter/to/foot/index.html`) so navigation uses real page loads.
