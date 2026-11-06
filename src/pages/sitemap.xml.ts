import type { APIRoute } from 'astro';
import { escapeXml } from '../lib/feeds';
import { sitemapPaths } from '../lib/site-paths';

export const GET: APIRoute = async ({ site }) => {
  const urls = (await sitemapPaths()).map(path => `  <url><loc>${escapeXml(new URL(path, site).href)}</loc></url>`);
  const xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...urls, '</urlset>', ''].join('\n');
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
