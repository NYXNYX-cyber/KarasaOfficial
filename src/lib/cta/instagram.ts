import { CONTACT } from '@/config/contact'

/**
 * Deep-link Instagram.
 * Per R3: CTA sekunder, utama WhatsApp.
 * UTM parameter untuk tracking via Instagram analytics.
 */
export function buildInstagramLink(productId?: string): string {
  const base = CONTACT.instagramUrl
  if (!productId) return base

  const params = new URLSearchParams({
    utm_source: 'karasa-web',
    utm_medium: 'cta',
    utm_campaign: productId,
  })
  return `${base}?${params.toString()}`
}

export const INSTAGRAM_TEMPLATES = {
  product: (id: string) => buildInstagramLink(id),
  profile: () => CONTACT.instagramUrl,
} as const
