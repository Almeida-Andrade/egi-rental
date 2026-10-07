import type { MetadataRoute } from 'next'
import { buscarCatalogo } from '@/lib/dados/catalogo'
import { URL_SITE } from '@/lib/site'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalogo = await buscarCatalogo()
  const fixas: MetadataRoute.Sitemap = [
    { url: URL_SITE, changeFrequency: 'monthly', priority: 1 },
    { url: `${URL_SITE}/containers`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${URL_SITE}/sob-medida`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${URL_SITE}/sob-medida/montar`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${URL_SITE}/contato`, changeFrequency: 'yearly', priority: 0.6 },
  ]
  return [
    ...fixas,
    ...catalogo.map((m) => ({
      url: `${URL_SITE}/containers/${m.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
