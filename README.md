From Idea to Profit with OnSpace

## Sitemap

- Generate or refresh the sitemap index and all category sitemap files:
  - `node scripts/generate-sitemap.mjs`
- Output files:
  - `sitemap.xml` (sitemap index)
  - `sitemap-length.xml`, `sitemap-area.xml`, `sitemap-volume.xml`, `sitemap-weight.xml`, `sitemap-temperature.xml`, `sitemap-speed.xml`, `sitemap-time.xml`, `sitemap-data.xml`, `sitemap-energy.xml`
- Each category sitemap uses full URLs and includes `<lastmod>`, `<changefreq>`, and `<priority>` for every URL.
- `length` URLs are generated dynamically from `LENGTH_UNITS` in `index.html`.
