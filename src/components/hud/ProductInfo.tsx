import type { Product } from '@/types/product'

interface ProductInfoProps {
  product: Product
}

/**
 * ProductInfo — overlay info produk (nama, tagline, deskripsi).
 * Ditampilkan di section scroll per produk (di luar Canvas).
 */
export function ProductInfo({ product }: ProductInfoProps) {
  return (
    <div className="px-4 sm:px-6 max-w-2xl mx-auto text-center">
      {product.badge && (
        <span className="inline-block px-3 py-1 mb-4 text-xs uppercase tracking-[0.3em] text-emas-tua border border-emas-muda/60 rounded-full bg-krem-muda/60">
          {product.badge}
        </span>
      )}

      <h2 className="font-karasa-display text-4xl sm:text-6xl text-coklat leading-tight">
        {product.name}
      </h2>

      <p className="mt-3 font-karasa-display italic text-lg sm:text-xl text-coklat-muda">
        {product.tagline}
      </p>

      <p className="mt-6 text-base sm:text-lg text-coklat-muda leading-relaxed">
        {product.description}
      </p>

      {product.longDescription && (
        <p className="mt-3 text-sm sm:text-base text-coklat-sangat-muda leading-relaxed">
          {product.longDescription}
        </p>
      )}
    </div>
  )
}
