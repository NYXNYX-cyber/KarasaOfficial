import { CONTACT } from '@/config/contact'

/**
 * Bangun deep-link WhatsApp Business dengan pesan templat.
 * Format resmi: https://wa.me/<intl>?text=<urlencoded>
 * Nomor +62 815-6333-9275 → 6281563339275 (tanpa +, tanpa leading 0).
 *
 * Per R3: tidak ada checkout di aplikasi, CTA = WhatsApp.
 */
export function buildWhatsAppLink(productName: string, note?: string): string {
  const body =
    note ??
    `Halo Karasa, saya tertarik dengan ${productName} dari etalase web 3D Karasa. Apakah masih tersedia?`

  const params = new URLSearchParams({ text: body })
  return `https://wa.me/${CONTACT.whatsappPhone}?${params.toString()}`
}

export const WHATSAPP_TEMPLATES = {
  lakarKuah: 'Halo Karasa, saya tertarik dengan Lakar Kuah. Apakah masih tersedia?',
  lakarKering:
    'Halo Karasa, saya tertarik dengan Lakar Kering. Apakah masih tersedia?',
  tiktuk:
    'Halo Karasa, saya ingin tahu lebih lanjut tentang Tiktuk (produk yang akan datang).',
  general: 'Halo Karasa, saya ingin bertanya tentang produk Karasa.',
} as const
