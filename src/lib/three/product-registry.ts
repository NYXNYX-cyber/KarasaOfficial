import type { Product, ProductId } from '@/types/product'
import { buildWhatsAppLink, WHATSAPP_TEMPLATES } from '@/lib/cta/whatsapp'
import { buildInstagramLink } from '@/lib/cta/instagram'

/**
 * Single source of truth untuk produk Karasa MVP.
 * Per R2 (Juli 2026): 2 produk aktif — Lakar Kuah (3D + image sequence),
 * Lakar Kering (image sequence).
 * Per R2b (Juli 2026): slot ke-3 diganti "Menu Baru" (lihat `MenuBaruSection.tsx`)
 * — daftar produk yang akan datang, di-render sebagai menu grid (bukan produk individual).
 *
 * Penambahan produk baru: tambah entry di array ini, tidak perlu refactor scene.
 */
export const PRODUCTS: readonly Product[] = [
  {
    id: 'lakar-kuah',
    name: 'Lakar Kuah',
    type: '3d',
    tagline: '',
    description:
      'Perpaduan lakar kenyal dengan kuah kaldu gurih, menciptakan sajian hangat yang praktis, mengenyangkan, siap menemani kamu kapanpun dan dimanapun!',
    longDescription:
      'Perpaduan lakar kenyal dengan kuah kaldu gurih, menciptakan sajian hangat yang praktis, mengenyangkan, siap menemani kamu kapanpun dan dimanapun!',
    badge: 'Hero · 3D + 30 Frame',
    ctaLinks: {
      whatsapp: buildWhatsAppLink('Lakar Kuah', WHATSAPP_TEMPLATES.lakarKuah),
      instagram: buildInstagramLink('lakar-kuah'),
    },
    /** Image sequence 30 frame WebP untuk profile page (/produk/lakar-kuah). */
    frameConfig: {
      basePath: '/seq/lakar-kuah/frame_',
      count: 30,
      ext: 'webp',
      width: 540,
      height: 960,
      startIndex: 0,
    },
    pedestalPosition: [0, 0, 0],
  },
  {
    id: 'lakar-kering',
    name: 'Lakar Kering',
    type: 'image-sequence',
    tagline: '',
    description:
      'Camilan renyah dan rasa gurih yang autentik. Praktis dibawa dan cocok dinikmati di setiap momen.',
    longDescription:
      'Camilan renyah dan rasa gurih yang autentik. Praktis dibawa dan cocok dinikmati di setiap momen.',
    badge: 'Coming Soon · 30 Frame',
    ctaLinks: {
      whatsapp: buildWhatsAppLink('Lakar Kering', WHATSAPP_TEMPLATES.lakarKering),
      instagram: buildInstagramLink('lakar-kering'),
    },
    frameConfig: {
      basePath: '/seq/lakar-kering/frame_',
      count: 30,
      ext: 'webp',
      width: 540,
      height: 960,
      startIndex: 0,
    },
    pedestalPosition: [0, 0, 0],
  },
] as const

export function getProduct(id: ProductId): Product {
  const product = PRODUCTS.find((p) => p.id === id)
  if (!product) throw new Error(`[Karasa] Product not found: ${id}`)
  return product
}

export function getProductIndex(id: ProductId): number {
  return PRODUCTS.findIndex((p) => p.id === id)
}

export type { Product, ProductId } from '@/types/product'
