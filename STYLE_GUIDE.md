# STYLE_GUIDE.md — Karasa Web 3D

> Style guide operasional untuk handover dari Fase 1 ke Fase 2.
> Sumber kebenaran spesifikasi: [`PRODUCT REQUIREMENT DOCUMENT.md`](./PRODUCT%20REQUIREMENT%20DOCUMENT.md) (PRD v2.0) + [`research/fase-1-aset-visual.md`](./research/fase-1-aset-visual.md) + revisi PRD Juli 2026 (R1–R6, lihat `PLANNING.md`).
> **Versi:** 0.2 (Fase 2 dalam implementasi). Update: tambahkan section saat fase berikutnya selesai.

---

## Tagline & Vokal Merek
- **Nama:** "Karasá" (aksen di huruf A terakhir — dieja `Ka-ra-sá`).
- **Tagline:** "Old but Gold, Classic but Fresh" — dua bagian, sama pentingnya.
- **Bahasa:** Indonesia untuk semua user-facing copy; Sundanese (`font-sundanese`) untuk aksara saja (fase berikutnya).
- **Nada:** hangat, heritage, tidak over-promosi; klaim jujur ("Handmade", "Tanpa Pengawet", "100% Lokal") di-display sebagai badge kecil, bukan headline.

## Sistem Tipografi (lihat `src/index.css`)

| Peran | Font | Sumber | Bundle via |
| :-- | :-- | :-- | :-- |
| **Display** (H1, H2) | **Fraunces** (variabel, 4 axis: wght, opsz, SOFT, WONK) | Google Fonts | `@fontsource-variable/fraunces` v5.2.9 |
| **Body** (paragraf, UI) | **Plus Jakarta Sans** 🇮🇩 (variabel, wght 200–800) | Google Fonts | `@fontsource-variable/plus-jakarta-sans` v5.2.8 |
| **Aksara Sunda** | **Noto Sans Sundanese** (aksara saja) | Google Fonts | `@fontsource-variable/noto-sans-sundanese` v5.2.8 |

**Variable font axis untuk Fraunces:**
- `wght` 100–900 — bobot tipografi
- `opsz` 9–144 — optical size (memilih typeface yang tepat per skala)
- `SOFT` 0–100 — kelembutan (tinggi = lebih hangat)
- `WONK` 0/1 — wonky (aktif = sentuhan handmade)

**Pemakaian default di `index.css`:**
```css
h1: opsz 144, wght 600, SOFT 30, WONK 1   /* H1 besar, ada karakter */
h2/h3: opsz 48, wght 500, SOFT 20, WONK 0 /* sub-bagian, lebih formal */
```

## Palet Warna (PRD §3.3, Sundanese Semiotics)

Warna-warna ini **hanya untuk komponen semiotik** (badge, ikon motif, aksen UI). Warna produk (makanan, label cup) boleh realistis.

| Nama | Hex | Penggunaan UI |
| :-- | :-- | :-- |
| **Bodas** | `#FFFFFF` | Latar utama, teks kontras tinggi, cahaya sorot |
| **Beureum** | `#FF0000` | CTA, indikator aktif, aksen Lereng, tagline accent |
| **Koneng** | `#FFFF00` | Stiker premium (badge Handmade), rim light 3D |
| **Hejo** | `#008000` | Aksen sekunder, elemen daun, indikator organik, scroll progress aktif |
| **Paul** | `#0000FF` | Gradien latar WebGL, dasar pola Mega Mendung, badge "100% Lokal" |
| **Hawuk** | `#808080` | Batas UI, teks sekunder, bayangan material, Pucuk Rebung non-aktif |
| **Hideung** (extended) | `#000000` | Outline, teks utama, siluet Kujang |
| **Kopi** (extended) | `#A52A2A` | Aksen kayu Sonokeling, gagang Kujang |

**Di Tailwind v4:** namespace `bg-bodas`, `text-beureum`, `border-koneng`, dll. Definisi di `src/index.css` @theme block.

## Material PBR (Fase 1) — `src/lib/three/materials.ts`

| Material | Tipe | Color | Roughness | Metalness | Catatan |
| :-- | :-- | :-- | :--: | :--: | :-- |
| `paperCup` | Standard | `#F4E9D5` | 0.85 | 0 | Body cup karton matte |
| `lidPlastic` | Physical | `#FFFFFF` | 0.15 | 0 + clearcoat 0.4 | Tutup PP semi-glossy |
| `labelDecal` | Standard | `#F0E4CC` | 0.7 | 0 | Dekal label matte |
| `ornamentGold` | Standard | `#C8A858` | 0.35 | 0.85 | Aksen emas scrollwork |
| `textInk` | Standard | `#1A0F08` | 0.6 | 0 | Tulisan "KARASÁ" hitam |
| `kerupuk` | Standard | `#F4C57A` | 0.55 | 0 | Kerupuk golden bumpy |
| `sausChilli` | Physical | `#C8102E` | 0.2 | 0 + clearcoat 1.0 | Saus Lakar Basah, kilap |
| `sausKuah` | Physical | `#E8A845` | 0.35 | 0 + clearcoat 0.6 | Saus Lakar Kuah, lebih kental |
| `sachetPlastic` | Physical | `#FFFFFF` | 0.2 | 0 + transmission 0.4 | Plastik sachet bening |
| `kayuSonokeling` | Standard | `#5C3A21` | 0.55 | 0 | Sendok kayu (untuk Fase 3) |
| `pedestalBatu` | Standard | `#2A2A2A` | 0.7 | 0.1 | Pedestal Dekton matte |
| `kujangSilhouette` | Standard | `#0F0F0F` | 0.5 | 0.6 | Siluet Kujang pedestal |

## Sistem Pencahayaan "Fajar Priangan" (Fase 1) — `src/components/three/LightingSetup.tsx`

Per PRD §3.2: directional warm gold dari timur + ambient indigo + rim light Koneng.

| Light | Position | Color | Intensity | Shadow |
| :-- | :-- | :-- | :--: | :--: |
| Sun (directional) | `[8, 6, 4]` | `#FFB37A` (2300K warm gold) | 2.2 | mapSize 1024² |
| Ambient | — | `#5A5A8A` (langit indigo Bandung) | 0.35 | — |
| Rim (directional) | `[-3, 2, -5]` | `#FFFF00` (Koneng) | 0.4 | — |
| Environment | — | Drei preset `dawn` (untuk PBR reflection) | 0.5 | — |

**Tone mapping:** `ACESFilmicToneMapping`, exposure 1.0 (match Blender image sequence di Fase 1.2).

## Pola Budaya — `public/svg/`

| File | Ukuran | Varian | Penggunaan |
| :-- | :-- | :-- | :-- |
| `mendung-horizontal.svg` | 800×200 | Gradient Paul→Bodas, 5 pita awan | Banner section, separator |
| `mendung-vertical.svg` | 200×800 | Gradient Paul→Bodas, 5 pita awan vertikal | Aksen scroll indicator, sidebar |
| `kujang-silhouette.svg` | 200×400 | `currentColor`, 5 mata hierarkis | Siluet UI divider, pedestal |
| `lereng-divider.svg` | 40×40 | Pattern repeat, `currentColor` | Divider diagonal, 3 varian stroke |
| `pucuk-rebung.svg` | 24×24 | `currentColor` (Hejo aktif, Hawuk non-aktif) | Scroll progress chevron |

**Penting:** `currentColor` dipakai agar warna bisa diikat via Tailwind/CSS class (mis. `text-beureum` membuat motif Lereng ikut merah). Untuk Fase 2, motif Mega Mendung akan dipakai sebagai **shader** untuk latar WebGL Canvas (animasi drift sesuai scroll).

## HUD 2D — `src/components/hud/`

| Komponen | Props | Fungsi |
| :-- | :-- | :-- |
| `BrandBadge` | `variant: 'handmade' \| 'tanpa-pengawet' \| 'lokal'` | Badge klaim semiotik, warna diikat ke palet Sunda |
| `SectionDivider` | `variant: 'thin' \| 'medium' \| 'thick'`, `color: string` | Divider motif Lereng, SVG inline (data URL) agar tidak ada request HTTP tambahan |

## Struktur File (Fase 1)

```
src/
├── main.tsx                      # Entry, mount <App/>, import font CSS
├── App.tsx                       # Hero + KarasaScene showcase
├── index.css                     # @import tailwind + @theme brand colors + base layer
├── components/
│   ├── three/
│   │   ├── KarasaScene.tsx       # Root <Canvas>, showcase Lakar Kuah & Basah side-by-side
│   │   ├── LakarKuah.tsx         # Paper cup + kerupuk + saus kuah (X-Ray)
│   │   ├── LakarBasah.tsx        # Paper cup + chilli oil + baso/siomay (X-Ray)
│   │   ├── PedestalKujang.tsx    # Pedestal batu sintered + siluet Kujang extruded
│   │   ├── LightingSetup.tsx     # Fajar Priangan: sun + ambient + rim + Environment
│   │   ├── AdaptiveQuality.tsx   # PerformanceMonitor wrapper, 3-tier quality
│   │   └── quality-context.ts    # React context untuk high/mid/low
│   └── hud/
│       ├── BrandBadge.tsx        # Badge "Handmade" / "Tanpa Pengawet" / "100% Lokal"
│       └── SectionDivider.tsx    # Divider Lereng + ScrollProgress Pucuk Rebung
└── lib/
    └── three/
        └── materials.ts          # PBR material definitions (lihat tabel di atas)
```

## Aset 2D Eksternal

| File | Status | Sumber |
| :-- | :-- | :-- |
| `public/favicon.svg` | ✅ Selesai (monogram "K" Paul bg + Koneng aksen) | Internal |
| `public/svg/mendung-horizontal.svg` | ✅ Selesai (5 pita awan, gradient Paul→Bodas) | Redraw dari riset |
| `public/svg/mendung-vertical.svg` | ✅ Selesai (varian vertikal) | Redraw dari riset |
| `public/svg/kujang-silhouette.svg` | ✅ Selesai (3 lob + 5 mata hierarkis) | Redraw dari anatomi (freesvg.org/kujang sebagai referensi) |
| `public/svg/lereng-divider.svg` | ✅ Selesai (pattern 40×40) | Internal |
| `public/svg/pucuk-rebung.svg` | ✅ Selesai (24×24) | Internal |
| `public/_redirects` | ✅ Selesai (`/* /index.html 200`) | PRD §7.2 |

## Kontrak ke Fase 2

Fase 1 deliverable siap diintegrasikan ke Fase 2:

1. **3D model Lakar Kuah & Basah** tersedia sebagai `<LakarKuah xRayMode={...} />` dan `<LakarBasah xRayMode={...} />`. Komponen ini independent dan bisa di-mount di section mana pun.
2. **Pedestal Kujang** tersedia sebagai `<PedestalKujang position={[x,y,z]} radius={1.0} />`.
3. **Material library** di `src/lib/three/materials.ts` bisa di-import di komponen lain.
4. **Lighting & quality** sudah jadi pattern di `LightingSetup.tsx` + `AdaptiveQuality.tsx`. Fase 2 tinggal import.
5. **Pola budaya SVG** ada di `public/svg/` dan siap dipakai sebagai background, mask, atau shader input.

## Yang **Belum** Dikerjakan di Fase 1 (untuk Fase 2 & 3)

- [ ] **1.2 Image Sequence (60 frame WebP)** — user akan menyediakan foto Lakar Basah/Kuah/Opak/Lakar Kering dari berbagai sudut. Setelah ada, generate frame via Blender atau rotasi foto.
- [ ] **2.1 GLB Draco** — tidak dipakai karena Lakar Kuah & Basah model prosedural. Image sequence (Opak, Lakar Kering) akan jadi Canvas 2D engine, bukan GLB.
- [ ] **2.3 ImageSequencePlayer fix** — komponen React untuk scroll-driven frame sequence Canvas 2D.
- [ ] **3.1 ScrollControls** Drei untuk transisi spline antar produk.
- [ ] **3.2 ScrollTrigger GSAP** untuk sync dengan ImageSequencePlayer.
- [ ] **3.3 Hotspot Html Drei** untuk info produk interaktif.
- [ ] **4.x CTA deep-link, KTX2, Bulk Redirects, Lighthouse audit.**

## Batasan yang Harus Dipertahankan

- **Jangan swap paper cup → pouch** untuk Lakar Basah/Kuah. Foto produk di Karasa-image/ sudah mengkonfirmasi keduanya paper cup, berbeda hanya warna saus.
- **Jangan hardcode warna di luar palet Sunda** untuk komponen semiotik. Produk boleh warna realistis.
- **Jangan pakai `useState` di `useFrame`** — mutasi langsung ke `meshRef.current` (PRD §8.1).
- **Triangle budget** tetap dijaga di bawah 30K per produk (paper cup prosedural saat ini ~5K).
- **Font Latin + Sunda**: Plus Jakarta Sans untuk Latin, Noto Sans Sundanese untuk aksara saja (paired via `unicode-range`).
