import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

const PAGES = ['', '/privacy', '/terms', '/refunds', '/delete-account', '/support'];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((path) => ({
    url: `${SITE.url}${path}`,
    changeFrequency: path === '' ? 'weekly' : 'yearly',
    priority: path === '' ? 1 : 0.4,
  }));
}
