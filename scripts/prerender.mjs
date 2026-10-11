import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'vite';

const root = process.cwd();
const vite = await createServer({ configFile: path.join(root, 'vite.config.ts'), server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
function escapeHtml(value) { return String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll("'", '&#39;'); }
function metadataHtml(template, language, data) {
  const title = escapeHtml(data.title);
  const description = escapeHtml(data.description);
  const keywords = escapeHtml(data.keywords);
  const schema = JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'TechLand', description: data.description, inLanguage: language }).replaceAll('<', '\\u003c').replaceAll('>', '\\u003e').replaceAll('&', '\\u0026');
  return template.replace('<html lang="__LANG__" dir="__DIR__">', `<html lang="${language}" dir="${language === 'fa' ? 'rtl' : 'ltr'}">`)
    .replaceAll('__PAGE_TITLE__', title).replaceAll('__PAGE_DESCRIPTION__', description).replaceAll('__PAGE_KEYWORDS__', keywords).replace('__STRUCTURED_DATA__', schema);
}
try {
  const { render, LOCALIZED_PUBLIC_ROUTES, staticOutputPath, getSiteMetadata } = await vite.ssrLoadModule('/src/entry-server.tsx');
  const template = await readFile(path.join(root, 'dist/index.html'), 'utf8');
  const routeManifest = { routes: LOCALIZED_PUBLIC_ROUTES.map((routePath) => {
    const language = /^\/fa(?:\/|$)/.test(routePath) ? 'fa' : 'en';
    return { path: routePath, title: getSiteMetadata(routePath, language).title };
  }) };
  const manifestText = `${JSON.stringify(routeManifest, null, 2)}\n`;
  await writeFile(path.join(root, 'public/manus-routes.json'), manifestText, 'utf8');
  await writeFile(path.join(root, 'dist/manus-routes.json'), manifestText, 'utf8');
  for (const routePath of LOCALIZED_PUBLIC_ROUTES) {
    const language = /^\/fa(?:\/|$)/.test(routePath) ? 'fa' : 'en';
    const rendered = render(language, routePath);
    if (!rendered.includes(`data-route="${routePath}"`)) throw new Error(`Static render is missing route marker: ${routePath}`);
    const metadata = getSiteMetadata(routePath, language);
    const html = metadataHtml(template, language, metadata).replace('<div id="root"></div>', `<div id="root">${rendered}</div>`);
    if (html.includes('__PAGE_') || html.includes('__STRUCTURED_DATA__')) throw new Error(`Unresolved metadata placeholder in ${routePath}.`);
    const output = path.join(root, 'dist', staticOutputPath(routePath));
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, html, 'utf8');
    console.log(`Prerendered ${language} ${routePath} -> ${path.relative(root, output)}`);
  }
} finally {
  await vite.close();
}
