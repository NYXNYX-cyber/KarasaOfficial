import { lazy, Suspense } from 'react'

import { KarasaScene } from '@/components/three/KarasaScene'
import { BrandBadge } from '@/components/hud/BrandBadge'
import { Sparkle, ScatterSparkles } from '@/components/hud/Sparkle'
import { KatalogSection } from '@/components/hud/KatalogSection'
import { MenuBaruSection } from '@/components/hud/MenuBaruSection'
import { getProduct } from '@/lib/three/product-registry'
import { useRouter } from '@/lib/router'
import { CONTACT } from '@/config/contact'
import { buildWhatsAppLink, WHATSAPP_TEMPLATES } from '@/lib/cta/whatsapp'
import type { ProductId } from '@/types/product'

// Lazy-load product profile (image sequence + scroll logic) — tidak di-bundle
// ke home page. Bundle terpisah di-load hanya saat user navigasi ke /produk/:id.
const ProductProfile = lazy(() =>
  import('@/components/pages/ProductProfile').then((m) => ({ default: m.ProductProfile })),
)

const PRODUCT_IDS: readonly ProductId[] = ['lakar-kuah', 'lakar-kering']

function ProfileFallback() {
  return (
    <main className="min-h-svh flex items-center justify-center bg-krem">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-emas-muda border-t-emas-tua animate-spin" />
        <p className="text-sm text-coklat-sangat-muda uppercase tracking-[0.3em]">
          Memuat profil…
        </p>
      </div>
    </main>
  )
}

export function App() {
  const { path } = useRouter()
  const productMatch = path.match(/^\/produk\/([\w-]+)$/)
  if (productMatch) {
    const id = productMatch[1]
    if ((PRODUCT_IDS as readonly string[]).includes(id)) {
      return (
        <Suspense fallback={<ProfileFallback />}>
          <ProductProfile productId={id as ProductId} />
        </Suspense>
      )
    }
  }
  return <HomePage />
}

/**
 * HomePage — hero Three.js + katalog + cerita + footer.
 */
function HomePage() {
  const heroProduct = getProduct('lakar-kuah')
  const heroWhatsApp = buildWhatsAppLink(heroProduct.name, WHATSAPP_TEMPLATES.lakarKuah)

  return (
    <main className="relative min-h-svh overflow-x-clip bg-krem text-coklat">
      {/* ==== Layer dekorasi pinggir ==== */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-20 z-0 hidden lg:block"
        style={{
          backgroundImage: "url('/svg/vine-strip-vertical.svg')",
          backgroundRepeat: 'repeat-y',
          backgroundSize: '80px 800px',
          opacity: 0.5,
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-20 z-0 hidden lg:block"
        style={{
          backgroundImage: "url('/svg/vine-strip-vertical.svg')",
          backgroundRepeat: 'repeat-y',
          backgroundSize: '80px 800px',
          opacity: 0.5,
          transform: 'scaleX(-1)',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-10 -left-10 w-[480px] h-[480px] opacity-90 z-0"
        style={{
          backgroundImage: "url('/svg/corner-ornament.svg')",
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          backgroundPosition: 'bottom left',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-10 -right-10 w-[380px] h-[380px] opacity-85 z-0"
        style={{
          backgroundImage: "url('/svg/corner-ornament-tr.svg')",
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          backgroundPosition: 'top right',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-[18%] right-0 w-[420px] h-[420px] opacity-95 z-0 hidden md:block"
        style={{
          backgroundImage: "url('/svg/mendung-ornament.svg')",
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          backgroundPosition: 'right center',
        }}
        aria-hidden="true"
      />

      <ScatterSparkles count={10} />

      {/* ==== HERO: Typography + Three.js (Lakar Kuah 3D) ==== */}
      <section className="relative z-10 px-4 pt-12 pb-12 sm:pt-20 sm:pb-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-8 w-48 sm:w-56 text-emas animate-fade-in">
            <img src="/svg/line-decorative.svg" alt="" className="w-full h-auto" />
          </div>

          <div className="relative inline-block">
            <Sparkle size={18} className="absolute -top-3 -left-6 animate-sparkle text-emas" />
            <Sparkle
              size={14}
              className="absolute -top-1 -right-5 animate-sparkle text-emas"
              style={{ animationDelay: '0.6s' }}
            />

            <h1
              className="font-karasa text-[5rem] sm:text-[8rem] leading-none text-coklat animate-fade-up"
              style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}
            >
              KARASÁ
            </h1>
          </div>

          <div
            className="mx-auto mt-6 w-72 sm:w-96 text-emas animate-fade-up"
            style={{ animationDelay: '0.25s', animationFillMode: 'backwards' }}
          >
            <img src="/svg/flourish-ornament.svg" alt="" className="w-full h-auto" />
          </div>

          <p
            className="mt-6 font-karasa text-lg sm:text-2xl tracking-[0.4em] uppercase text-coklat-muda animate-fade-up"
            style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}
          >
            Khas&nbsp;Nusantara
          </p>

          <p
            className="mt-6 font-karasa italic text-xl sm:text-2xl text-coklat animate-fade-up"
            style={{ animationDelay: '0.55s', animationFillMode: 'backwards' }}
          >
            &ldquo;Old but Gold, Classic but Fresh&rdquo;
          </p>

          <p
            className="mt-4 font-sundanese text-base text-coklat-sangat-muda animate-fade-up"
            style={{ animationDelay: '0.7s', animationFillMode: 'backwards' }}
          >
            ᮊᮛᮞ · terasa · memiliki rasa
          </p>

          <div
            className="mt-8 flex flex-wrap justify-center gap-2 animate-fade-up"
            style={{ animationDelay: '0.85s', animationFillMode: 'backwards' }}
          >
            <BrandBadge variant="handmade" />
            <BrandBadge variant="tanpa-pengawet" />
            <BrandBadge variant="lokal" />
          </div>
        </div>

        {/* ==== Three.js Section: Lakar Kuah statis ==== */}
        <div
          className="relative mt-12 sm:mt-16 max-w-5xl mx-auto px-2 sm:px-6 animate-fade-up"
          style={{ animationDelay: '1.0s', animationFillMode: 'backwards' }}
        >
          <div className="relative paper-grain rounded-2xl border border-emas-muda/40 bg-krem-muda/40 p-2 sm:p-4 shadow-xl">
            <KarasaScene />

            <Sparkle size={12} className="absolute top-2 left-2 animate-sparkle text-emas-tua" />
            <Sparkle
              size={10}
              className="absolute top-2 right-2 animate-sparkle text-emas-tua"
              style={{ animationDelay: '0.5s' }}
            />
            <Sparkle
              size={10}
              className="absolute bottom-2 left-2 animate-sparkle text-emas-tua"
              style={{ animationDelay: '1.0s' }}
            />
            <Sparkle
              size={12}
              className="absolute bottom-2 right-2 animate-sparkle text-emas-tua"
              style={{ animationDelay: '1.5s' }}
            />
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-coklat-sangat-muda">
              {heroProduct.name} · Drag untuk memutar
            </p>
            <p className="mt-1 text-xs text-coklat-sangat-muda italic">
              <a
                href="#katalog"
                className="hover:text-emas-tua transition-colors underline-offset-2 hover:underline"
              >
                Lihat produk lain di katalog di bawah
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ==== KATALOG: 2 product card (klik → /produk/:id) ==== */}
      <KatalogSection />

      {/* ==== MENU BARU: teaser produk yang akan datang (R2b) ==== */}
      <MenuBaruSection />

      {/* ==== Cerita — closing CTA + story ==== */}
      <section
        id="cerita"
        className="relative z-10 overflow-hidden border-y border-emas-muda/30 bg-krem-tua/40 py-20 sm:py-28"
      >
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <span className="inline-block px-3 py-1 mb-4 text-xs uppercase tracking-[0.3em] text-emas-tua border border-emas-muda/60 rounded-full bg-krem-muda/60">
            Cerita Kami
          </span>

          <h2 className="font-karasa text-4xl sm:text-6xl text-coklat">Old but Gold</h2>

          <p className="mt-6 text-lg text-coklat-muda leading-relaxed">
            Warisan rasa Sunda yang telah melintasi generasi — opak, lakar, citruk, emping —
            dikemas ulang untuk Gen Z tanpa menghilangkan cita rasa asli.
          </p>

          <p className="mt-4 text-base text-coklat-sangat-muda italic">
            &ldquo;Classic but Fresh&rdquo;
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 items-center justify-center">
            <a
              href={heroWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex items-center justify-center gap-2
                px-6 py-3 rounded-full
                bg-emas text-coklat font-semibold text-sm sm:text-base
                shadow-md transition-all duration-200
                hover:bg-emas-tua hover:shadow-lg hover:-translate-y-0.5
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emas-tua
              "
            >
              Hubungi via WhatsApp
            </a>
            <a
              href={CONTACT.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
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
              Lihat di Instagram
            </a>
          </div>
        </div>
      </section>

      {/* ==== Footer ==== */}
      <footer className="relative z-10 border-t border-emas-muda/20 px-4 py-10 sm:py-12">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <p className="font-karasa text-2xl text-coklat">Karasa</p>
              <p className="mt-1 text-sm text-coklat-sangat-muda">
                © 2026 · {CONTACT.location}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <FooterLink
                href={`https://wa.me/${CONTACT.whatsappPhone}`}
                label={`WhatsApp ${CONTACT.whatsappDisplay}`}
                variant="whatsapp"
              />
              <FooterLink
                href={CONTACT.instagramUrl}
                label="Lihat Instagram"
                variant="instagram"
              />
              <FooterLink
                href={`mailto:${CONTACT.email}`}
                label={`Email ${CONTACT.email}`}
                variant="email"
              />
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

function FooterLink({
  href,
  label,
  variant,
}: {
  href: string
  label: string
  variant: 'whatsapp' | 'instagram' | 'email'
}) {
  const icon = {
    whatsapp: (
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    ),
    instagram: (
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    ),
    email: (
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    ),
  }[variant]

  return (
    <a
      href={href}
      target={variant === 'email' ? undefined : '_blank'}
      rel={variant === 'email' ? undefined : 'noopener noreferrer'}
      aria-label={label}
      className="
        inline-flex items-center justify-center
        w-10 h-10 rounded-full
        border border-emas-muda/60
        text-coklat-muda
        bg-krem-muda/40
        transition-all duration-200
        hover:bg-emas-muda hover:text-krem
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emas-tua
      "
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        {icon}
      </svg>
    </a>
  )
}
