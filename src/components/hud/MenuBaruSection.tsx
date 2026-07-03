import { buildWhatsAppLink, WHATSAPP_TEMPLATES } from '@/lib/cta/whatsapp'
import { buildInstagramLink } from '@/lib/cta/instagram'
import { CONTACT } from '@/config/contact'

/**
 * MenuBaruSection — section "Menu Baru" dengan daftar produk yang AKAN datang.
 * Per R2b (Juli 2026): bukan produk individual (tidak punya page detail),
 * hanya teaser menu untuk membangun antisipasi.
 *
 *  - Tiktuk: produk spesifik yang sudah dinamai owner, info menyusul.
 *  - Opak Klasik & Opak Mini: varian opak dari PRD §2.1, tunda rilis.
 *  - Lainnya: placeholder untuk produk masa depan.
 */
interface MenuItem {
  id: string
  name: string
  description: string
  status: 'tbd' | 'planned'
  emoji: string
}

const MENU_ITEMS: readonly MenuItem[] = [
  {
    id: 'tiktuk',
    name: 'Tiktuk',
    description:
      'Produk baru yang akan datang. Detail menyusul dari owner — pantau Instagram kami untuk update pertama.',
    status: 'tbd',
    emoji: '◇',
  },
  {
    id: 'opak-klasik',
    name: 'Opak Klasik',
    description:
      'Opak original dengan ketebalan tradisional, cocok untuk camilan santai atau suguhan tamu.',
    status: 'planned',
    emoji: '◯',
  },
  {
    id: 'opak-mini',
    name: 'Opak Mini',
    description:
      'Versi mini opak yang renyah, pas untuk sekali gigit. Cocok untuk oleh-oleh dalam porsi kecil.',
    status: 'planned',
    emoji: '◌',
  },
] as const

export function MenuBaruSection() {
  const generalWaLink = buildWhatsAppLink(
    'produk Menu Baru',
    WHATSAPP_TEMPLATES.general,
  )

  return (
    <section
      id="menu-baru"
      className="relative z-10 px-4 py-20 sm:py-28 border-t border-emas-muda/20 bg-krem-tua/30"
    >
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block px-3 py-1 mb-4 text-xs uppercase tracking-[0.3em] text-emas-tua border border-emas-muda/60 rounded-full bg-krem-muda/60">
            Menu Baru
          </span>
          <h2 className="font-karasa text-4xl sm:text-6xl text-coklat">
            Akan Segera Hadir
          </h2>
          <p className="mt-4 font-karasa italic text-lg sm:text-xl text-coklat-muda">
            Warisan yang terus tumbuh
          </p>
          <p className="mt-3 text-sm sm:text-base text-coklat-sangat-muda max-w-2xl mx-auto">
            Daftar produk Karasa yang sedang kami persiapkan. Tertarik menjadi yang pertama
            tahu saat rilis? Hubungi kami lewat WhatsApp.
          </p>
        </div>

        {/* Menu grid */}
        <ol className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
          {MENU_ITEMS.map((item, idx) => (
            <MenuCard key={item.id} item={item} index={idx} />
          ))}
        </ol>

        {/* Single CTA: WhatsApp general */}
        <div className="mt-12 text-center">
          <a
            href={generalWaLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Tanya tentang produk Menu Baru via WhatsApp"
            className="
              inline-flex items-center justify-center gap-2
              px-6 py-3 rounded-full
              bg-emas text-coklat font-semibold text-sm sm:text-base
              shadow-md transition-all duration-200
              hover:bg-emas-tua hover:shadow-lg hover:-translate-y-0.5
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emas-tua
            "
          >
            <WhatsAppIcon className="w-4 h-4" />
            <span>Tanya Produk Menu Baru</span>
          </a>
          <p className="mt-3 text-xs text-coklat-sangat-muda">
            atau pantau Instagram{' '}
            <a
              href={buildInstagramLink('menu-baru')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emas-tua hover:text-emas-tua underline-offset-2 hover:underline"
            >
              @{CONTACT.instagramHandle}
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}

function MenuCard({ item, index }: { item: MenuItem; index: number }) {
  return (
    <li
      className="
        group relative paper-grain
        rounded-2xl border border-emas-muda/40
        bg-krem-muda/60 p-6 sm:p-7
        shadow-sm transition-all duration-300
        hover:shadow-xl hover:-translate-y-1 hover:border-emas-tua
      "
    >
      {/* Index number — subtle, top-left */}
      <span
        className="
          absolute top-4 right-4
          font-karasa text-2xl text-emas-muda/60
          tabular-nums
        "
        aria-hidden="true"
      >
        0{index + 1}
      </span>

      {/* Geometric symbol */}
      <div
        className="
          w-14 h-14 mb-5
          rounded-full border-2 border-emas-muda
          flex items-center justify-center
          text-emas-tua text-2xl
          group-hover:bg-emas-muda/10 transition-colors
        "
        aria-hidden="true"
      >
        {item.emoji}
      </div>

      {/* Name */}
      <h3 className="font-karasa text-2xl text-coklat leading-tight">{item.name}</h3>

      {/* Status badge */}
      <div className="mt-2">
        <span
          className={`
            inline-block px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] rounded-full
            ${
              item.status === 'tbd'
                ? 'border border-emas-tua/60 text-emas-tua bg-emas-muda/15'
                : 'border border-coklat-sangat-muda/40 text-coklat-sangat-muda bg-krem-tua/40'
            }
          `}
        >
          {item.status === 'tbd' ? 'TBD · Menyusul' : 'Rencana'}
        </span>
      </div>

      {/* Description */}
      <p className="mt-4 text-sm text-coklat-muda leading-relaxed">{item.description}</p>
    </li>
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
