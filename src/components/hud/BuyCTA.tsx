import type { Product } from '@/types/product'

interface BuyCTAProps {
  product: Product
  /** Variant: 'horizontal' (default, untuk 2 tombol sejajar) atau 'stacked' (vertikal) */
  variant?: 'horizontal' | 'stacked'
}

/**
 * BuyCTA — 2 tombol CTA (per R3):
 *  - WhatsApp (primary, gold) — deep-link dengan pesan templat
 *  - Instagram (secondary, outline) — deep-link ke profile @khas.nusantara15
 *
 * Tidak ada Shopee/Tokped (owner belum punya toko).
 * Email TIDAK masuk CTA, hanya di footer.
 */
export function BuyCTA({ product, variant = 'horizontal' }: BuyCTAProps) {
  const containerClass =
    variant === 'stacked'
      ? 'flex flex-col gap-3 items-stretch w-full max-w-xs mx-auto'
      : 'flex flex-col sm:flex-row gap-3 items-center justify-center'

  return (
    <div className={containerClass}>
      {/* WhatsApp — primary, gold */}
      <a
        href={product.ctaLinks.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Beli ${product.name} via WhatsApp`}
        className="
          inline-flex items-center justify-center gap-2
          px-6 py-3 rounded-full
          bg-emas text-coklat
          font-semibold text-sm sm:text-base
          shadow-md
          transition-all duration-200
          hover:bg-emas-tua hover:shadow-lg hover:-translate-y-0.5
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emas-tua
        "
      >
        <WhatsAppIcon className="w-4 h-4" />
        <span>Beli via WhatsApp</span>
      </a>

      {/* Instagram — secondary, outline */}
      <a
        href={product.ctaLinks.instagram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Lihat ${product.name} di Instagram`}
        className="
          inline-flex items-center justify-center gap-2
          px-6 py-3 rounded-full
          border border-emas-muda text-coklat bg-krem-muda/40
          font-medium text-sm sm:text-base
          transition-all duration-200
          hover:bg-krem-muda hover:border-emas-tua
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emas-tua
        "
      >
        <InstagramIcon className="w-4 h-4" />
        <span>Lihat di Instagram</span>
      </a>
    </div>
  )
}

function WhatsAppIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

function InstagramIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}
