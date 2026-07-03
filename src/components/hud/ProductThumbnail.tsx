import type { ProductId } from '@/types/product'

interface ProductThumbnailProps {
  productId: ProductId
  className?: string
  /**
   * Untuk foto produk: `cover` (default) memotong gambar supaya container penuh,
   * `contain` menampilkan seluruh foto.
   */
  fit?: 'cover' | 'contain'
}

/**
 * Ilustrasi miniatur produk untuk katalog card dan elemen dekoratif lain.
 * - Lakar Kuah: foto produk JPG dari `public/img/`.
 * - Lakar Kering: foto produk PNG baru dari `public/img/lakarkering.png` (362×512).
 *
 * Tidak ada HTTP request tambahan selain foto.
 */
export function ProductThumbnail({
  productId,
  className = 'w-full h-full',
  fit = 'cover',
}: ProductThumbnailProps) {
  if (productId === 'lakar-kuah') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/img/lakar-kuah.jpg"
        alt="Foto produk Lakar Kuah"
        loading="lazy"
        decoding="async"
        className={`${className} object-${fit} drop-shadow-lg`}
      />
    )
  }

  // Lakar Kering — pakai foto PNG baru (362×512)
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/img/lakarkering.png"
      alt="Foto produk Lakar Kering"
      loading="lazy"
      decoding="async"
      className={`${className} object-${fit} drop-shadow-lg`}
    />
  )
}
