import { PRODUCTS } from '@/lib/three/product-registry'
import type { Product } from '@/types/product'
import { ProductThumbnail } from './ProductThumbnail'

/**
 * KatalogSection — grid card untuk produk aktif Karasa.
 * Klik card → navigasi ke /produk/:id (product profile page).
 *
 * Per R2b (Juli 2026): hanya 2 produk aktif (Lakar Kuah, Lakar Kering).
 * Produk yang akan datang ada di MenuBaruSection.
 *
 * Layout:
 *  - Mobile: 1 kolom
 *  - Tablet (sm): 2 kolom (auto-fit)
 */
export function KatalogSection() {
  return (
    <section
      id="katalog"
      className="relative z-10 px-4 py-20 sm:py-28 border-t border-emas-muda/20"
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block px-3 py-1 mb-4 text-xs uppercase tracking-[0.3em] text-emas-tua border border-emas-muda/60 rounded-full bg-krem-muda/60">
            Katalog
          </span>
          <h2 className="font-karasa text-4xl sm:text-6xl text-coklat">
            Pilih Jajananmu
          </h2>
          <p className="mt-4 font-karasa italic text-lg sm:text-xl text-coklat-muda">
            Dua rasa, satu warisan
          </p>
          <p className="mt-3 text-sm sm:text-base text-coklat-sangat-muda max-w-2xl mx-auto">
            Klik salah satu untuk membuka profil produk — lihat sequence 360° interaktif
            geser-scroll atau info lengkap.
          </p>
        </div>

        {/* Grid — auto-fit 1 atau 2 kolom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

interface ProductCardProps {
  product: Product
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <a
      href={`/produk/${product.id}`}
      data-link
      aria-label={`Buka profil ${product.name}`}
      className="
        group relative paper-grain block
        rounded-2xl border border-emas-muda/40
        bg-krem-muda/60 overflow-hidden
        shadow-md transition-all duration-300
        hover:shadow-2xl hover:-translate-y-1 hover:border-emas-tua
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emas-tua
      "
    >
      {/* Thumbnail area */}
      <div
        className="
          relative aspect-[4/5] w-full
          flex items-center justify-center
          overflow-hidden
          bg-krem-tua
        "
      >
        <ProductThumbnail productId={product.id} fit="cover" />

        {/* Badge pojok kiri atas */}
        {product.badge && (
          <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-emas-tua border border-emas-muda/60 rounded-full bg-krem-muda/85 backdrop-blur-sm">
            {product.badge}
          </span>
        )}

        {/* Type chip pojok kanan atas */}
        <span className="absolute top-3 right-3 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-coklat-muda border border-emas-muda/40 rounded-full bg-krem-muda/70 backdrop-blur-sm">
          {typeLabel(product.type)}
        </span>

        {/* Hover overlay hint */}
        <div className="absolute inset-x-0 bottom-0 px-4 py-3 bg-gradient-to-t from-krem/95 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-xs uppercase tracking-[0.25em] text-coklat text-center font-semibold">
            Buka Profil →
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 sm:p-6">
        <h3 className="font-karasa text-2xl sm:text-3xl text-coklat leading-tight">
          {product.name}
        </h3>
        <p className="mt-2 font-karasa italic text-sm sm:text-base text-coklat-muda">
          {product.tagline}
        </p>
        <p className="mt-3 text-xs sm:text-sm text-coklat-sangat-muda line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        <div className="mt-5 flex items-center justify-between">
          <span
            className="
              inline-flex items-center gap-1.5
              text-xs font-semibold uppercase tracking-[0.2em]
              text-emas-tua group-hover:text-emas transition-colors
            "
          >
            Lihat Profil
            <svg
              className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </a>
  )
}

function typeLabel(t: Product['type']): string {
  switch (t) {
    case '3d':
      return '3D + Sequence'
    case 'image-sequence':
      return '360° View'
    case 'placeholder':
      return 'Coming Soon'
  }
}
