import { useEffect } from 'react'

import { BuyCTA } from '@/components/hud/BuyCTA'
import { ProductInfo } from '@/components/hud/ProductInfo'
import { ScrollDrivenImageSequence } from '@/components/three/ScrollDrivenImageSequence'
import { getProduct } from '@/lib/three/product-registry'
import { useRouter } from '@/lib/router'
import type { ProductId } from '@/types/product'

interface ProductProfileProps {
  productId: ProductId
}

/**
 * ProductProfile — halaman detail produk di route /produk/:id.
 *
 * Layout sesuai revisi Juli 2026 (scroll-driven storytelling):
 *
 *  ┌────────────────────────────────────────────┐
 *  │  Nav (back + breadcrumb)                   │
 *  ├────────────────────────────────────────────┤
 *  │  Image sequence section (220-360vh)        │
 *  │  ┌──────────────────────────┐ sticky       │
 *  │  │   Image sequence         │ full-viewport│
 *  │  │   (scroll → frame)       │              │
 *  │  └──────────────────────────┘              │
 *  │  ── setelah scroll area ──                │
 *  │  Divider motif Sunda                      │
 *  │  ProductInfo (badge, nama, tagline, desc)  │
 *  │  BuyCTA                                   │
 *  ├────────────────────────────────────────────┤
 *  │  Footer                                   │
 *  └────────────────────────────────────────────┘
 *
 * Page scroll satu-satunya — wheel event tidak di-capture di area manapun.
 */
export function ProductProfile({ productId }: ProductProfileProps) {
  const { navigate, path } = useRouter()
  const product = getProduct(productId)

  useEffect(() => {
    const prev = document.title
    document.title = `${product.name} — Karasa`
    return () => {
      document.title = prev
    }
  }, [product.name])

  const onBack = () => {
    const scrollToKatalog = () => {
      // Double rAF + fallback: tunggu HomePage mount + layout commit
      const tryScroll = (attempt = 0) => {
        const el = document.getElementById('katalog')
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          return
        }
        if (attempt < 10) {
          requestAnimationFrame(() => tryScroll(attempt + 1))
        }
      }
      requestAnimationFrame(() => tryScroll())
    }

    if (path === '/') {
      scrollToKatalog()
      return
    }
    // Patch window.scrollTo agar navigate() tidak scroll ke top duluan
    const originalScrollTo = window.scrollTo
    window.scrollTo = (() => undefined) as typeof window.scrollTo
    navigate('/')
    window.scrollTo = originalScrollTo
    scrollToKatalog()
  }

  return (
    <main className="relative bg-krem text-coklat">
      {/* ==== Dekorasi pinggir minimal ==== */}
      <div
        className="pointer-events-none fixed inset-y-0 left-0 w-20 z-0 hidden lg:block"
        style={{
          backgroundImage: "url('/svg/vine-strip-vertical.svg')",
          backgroundRepeat: 'repeat-y',
          backgroundSize: '80px 800px',
          opacity: 0.4,
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed inset-y-0 right-0 w-20 z-0 hidden lg:block"
        style={{
          backgroundImage: "url('/svg/vine-strip-vertical.svg')",
          backgroundRepeat: 'repeat-y',
          backgroundSize: '80px 800px',
          opacity: 0.4,
          transform: 'scaleX(-1)',
        }}
        aria-hidden="true"
      />

      {/* ==== Top nav: back + breadcrumb ==== */}
      <nav className="sticky top-0 z-20 px-4 sm:px-6 py-3 sm:py-4 border-b border-emas-muda/20 bg-krem/85 backdrop-blur-md">
        <div className="mx-auto max-w-5xl flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Kembali ke katalog"
            className="
              inline-flex items-center gap-2
              px-3 py-2 rounded-full
              text-sm text-coklat-muda
              bg-krem-muda/60 border border-emas-muda/40
              transition-all duration-200
              hover:bg-emas-muda hover:text-krem
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emas-tua
            "
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M19 12H5M11 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">Katalog</span>
          </button>

          <ol className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-coklat-sangat-muda">
            <li>
              <a href="/" data-link className="hover:text-emas-tua transition-colors">
                Beranda
              </a>
            </li>
            <li aria-hidden="true">›</li>
            <li>
              <button
                type="button"
                onClick={onBack}
                className="hover:text-emas-tua transition-colors cursor-pointer"
              >
                Katalog
              </button>
            </li>
            <li aria-hidden="true">›</li>
            <li className="text-emas-tua">{product.name}</li>
          </ol>
        </div>
      </nav>

      {/* ==== Section 1: Image sequence — scroll-driven, full experience di ATAS ==== */}
      <section className="relative z-10">
        {product.frameConfig ? (
          <ScrollDrivenImageSequence
            config={product.frameConfig}
            productName={product.name}
          />
        ) : (
          <PlaceholderSection productName={product.name} />
        )}
      </section>

      {/* ==== Section 2: Info + CTA — di BAWAH setelah image sequence berakhir ==== */}
      <section className="relative z-10 px-4 sm:px-6 py-16 sm:py-24 bg-gradient-to-b from-krem to-krem-tua/40">
        <div className="mx-auto max-w-2xl">
          {/* Divider motif Sunda */}
          <div className="mb-10 sm:mb-12 flex items-center justify-center gap-3" aria-hidden="true">
            <span className="h-px w-16 bg-emas-muda/60" />
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-emas-tua" fill="currentColor">
              <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
            </svg>
            <span className="h-px w-16 bg-emas-muda/60" />
          </div>

          <div className="text-center">
            <ProductInfo product={product} />
          </div>

          <div className="mt-10 sm:mt-12">
            {product.type !== 'placeholder' ? (
              <BuyCTA product={product} variant="stacked" />
            ) : (
              <div className="mx-auto max-w-md rounded-xl border border-emas-muda/30 bg-krem-muda/60 p-5 text-center">
                <p className="text-sm text-coklat-muda italic">
                  Pantau Instagram kami untuk update pertama produk ini.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ==== Footer ==== */}
      <footer className="relative z-10 border-t border-emas-muda/20 px-4 py-8">
        <div className="mx-auto max-w-5xl text-center text-xs text-coklat-sangat-muda">
          <p>
            © 2026 Karasa ·{' '}
            <a href="/" data-link className="hover:text-emas-tua transition-colors underline-offset-2 hover:underline">
              Kembali ke beranda
            </a>
          </p>
        </div>
      </footer>
    </main>
  )
}

/** Placeholder section untuk produk tanpa image sequence (Tiktuk). */
function PlaceholderSection({ productName }: { productName: string }) {
  return (
    <div className="min-h-[70svh] flex flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-md aspect-[9/16] rounded-xl bg-gradient-to-br from-krem-tua to-emas-muda/30 border border-emas-muda/40 flex flex-col items-center justify-center gap-4">
        <svg
          viewBox="0 0 120 120"
          className="w-24 h-24 text-emas-tua animate-pulse"
          aria-hidden="true"
        >
          <circle
            cx="60"
            cy="60"
            r="48"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="6 4"
          />
          <text
            x="60"
            y="80"
            textAnchor="middle"
            fontSize="64"
            fontFamily="serif"
            fontWeight="600"
            fill="currentColor"
          >
            ?
          </text>
        </svg>
        <p className="font-karasa italic text-lg text-coklat-muda text-center px-6">
          {productName} — Akan Segera Hadir
        </p>
      </div>
    </div>
  )
}
