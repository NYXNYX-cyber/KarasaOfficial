# AGENTS.md

## Status Repositori
- **Fase 1 selesai, Fase 2 dalam implementasi.** Source code lengkap di `src/`, build artifacts di `dist/`. Stack aktual: Vite 5 + React 19 + R3F 9.6 + Drei 10.7 + three 0.170 + Tailwind v4 + GSAP 3.15.
- PRD adalah sumber kebenaran spesifikasi, **tetapi telah direvisi Juli 2026** (lihat "Log Revisi PRD" di `PLANNING.md`): R1 (60→30 frame), R2 (5→3 produk), R3 (CTA Shopee/Tokped → WA/IG), R4 (no auto-rotate), R5 (paper cup), R6 (hybrid rendering tetap).
- Baca PRD + PLANNING.md + STYLE_GUIDE.md sebelum mengusulkan perubahan apa pun. Jangan mengarang spesifikasi yang bertentangan.

## Konteks Merek & Bahasa
- Merek: **Karasa** — jajanan tradisional Sunda (opak, lakar, citruk, emping) dari Rancaekek, Bandung, Jawa Barat.
- Semua copy yang menghadap pengguna, microcopy, dan referensi budaya harus menghormati konteks Sunda / Jawa Barat. Motif budaya (Mega Mendung, Kujang, Pucuk Rebung, Lereng) dan palet warna Sunda didefinisikan di PRD §3 — jangan mengganti dengan palet atau motif generik.
- PRD ditulis dalam bahasa Indonesia. Dahulukan kata-kata persis dari PRD untuk istilah produk dan merek (mis. "Lakar Kuah", "Lakar Kering", "Citruk") daripada menerjemahkan secara bebas. **Catatan:** Produk ketiga sering disebut "Tiktuk" secara internal karena miskomunikasi awal, tapi **nama resminya adalah "Citruk"** (jajanan Sunda dari beras ketan, sesuai PRD §2.1).
- **Produk MVP aktif (R2):** Lakar Kuah Keju (3D + image sequence), Lakar Kuah (image sequence), Lakar Kering (image sequence). Lakar Basah di-archive (`src/components/three/_archive/`).
- **Menu Baru (R2b):** Citruk (TBD), Opak Klasik, Opak Mini — teaser, bukan produk individual.

## Stack Aktual (sudah dipasang)
- Vite 5 + React 19 + React Three Fiber 9.6.1 + Drei 10.7 + three 0.170 + Tailwind v4 + GSAP 3.15 + Framer Motion 11.18.
- Font self-host: `@fontsource-variable/{fraunces, plus-jakarta-sans, noto-sans-sundanese, playfair-display}`.
- Host: Cloudflare Pages (serverless). Routing SPA: `public/_redirects` berisi `/* /index.html 200` (PRD §7.2).

## Aturan Rendering Hybrid (jangan dilanggar, R6)
Produk menentukan metode rendering. Jangan menukar keduanya:
- **WebGL 3D (R3F)**: Lakar Kuah Keju (dengan X-Ray Mode) — di-render di hero beranda.
- **Image sequence (PRD §5.1, scroll-driven)**: Lakar Kuah Keju (145→30 frame), Lakar Kuah (240→30 frame) & Lakar Kering (240→30 frame) — di-render di `/produk/:id`.
- **Menu Baru (R2b)**: daftar produk upcoming (Tiktuk, Opak Klasik, Opak Mini) — teaser statis, bukan produk individual.
- Pemisahan ini adalah keputusan performa GPU seluler (PRD §2, §8.2). Jangan membuat model 3D untuk Lakar Kering, dan jangan me-render rotasi produk 3D sebagai image sequence.

## Menu Baru (R2b)
- Section terpisah dari katalog aktif, di-render setelah KatalogSection di beranda.
- Bukan produk individual (tidak punya `ProductId`, tidak punya page `/produk/:id`).
- Item: **Citruk** (TBD · Design menyusul), Opak Klasik (Rencana), Opak Mini (Rencana).
- CTA: WhatsApp general (templat `WHATSAPP_TEMPLATES.general`) + link Instagram.
- Tambah produk ke Menu Baru: edit `MENU_ITEMS` di `src/components/hud/MenuBaruSection.tsx`.

## Batasan Performa Keras (PRD §8)
- **Jangan pernah menggunakan `useState` di dalam loop `useFrame`.** Mutasi `meshRef.current` secara langsung. Eksplisit dilarang, menyebabkan badai render ulang DOM pada perangkat seluler.
- Lazy-load tekstur: render pada 512 px terlebih dahulu, ganti ke 1024–2048 px hanya setelah pengguna mulai melakukan rotasi manual.
- Bungkus aplikasi dengan `<PerformanceMonitor>` dari Drei; otomatis turunkan bayangan, pixel ratio, dan post-processing (bloom, DoF) ketika FPS turun di bawah 45.
- Target first-paint: < 2,5 d pada 4G. **Preload 5 frame pertama image sequence secara sinkron** (16.7% dari 30, R1), muat sisanya via `requestIdleCallback`. **Lazy mount `<ImageSequencePlayer>`** — komponen tidak di-mount sampai scroll offset melewati threshold halaman sebelumnya.
- Aset 3D prosedural (R3F, bukan GLB) — tidak ada Draco yang dibutuhkan di MVP karena tidak pakai Blender.
- Image sequence sudah di-render dari web tool (ezgif) — JPG 720×1280, 30 frame per produk di `public/seq/[product]/frame_000.jpg` … `frame_029.jpg`.

## Kontrol Kamera (PRD §5.2 + R4)
- `OrbitControls` harus memiliki `minPolarAngle` / `maxPolarAngle` yang dikunci agar kamera tidak dapat menukik ke bawah pedestal Kujang.
- **`autoRotate={false}`** (R4) — produk tetap diam, tidak ada idle auto-rotate. User-driven via drag atau scroll-driven untuk image sequence.
- Transisi kamera antar-produk menggunakan `<ScrollControls>` Drei di sepanjang spline (`CatmullRomCurve3`) — jangan hard-cut antar produk.
- **Pola 4 anchor points:** Hero → Lakar Kering → Tiktuk → Cerita (closing).

## Model Distribusi — tanpa checkout di aplikasi (R3)
- Tidak ada payment gateway, tidak ada keranjang, tidak ada checkout.
- **CTA: WhatsApp + Instagram saja** (Shopee/Tokped ditunda — owner belum punya toko).
  - WhatsApp Business: +62 815-6333-9275 → `https://wa.me/6281563339275?text=<encoded>` dengan pesan templat per produk.
  - Instagram: `https://instagram.com/khas.nusantara15`.
  - Email: `khas.nusantara15@gmail.com` (di footer saja, bukan CTA).
- Jangan mengusulkan penambahan alur keranjang atau checkout — ini adalah batasan serverless yang disengaja, bukan kelalaian.
- Nomor WA & handle IG hard-code di `src/config/contact.ts`, bukan inline.

## Aset
- `Karasa-image/` menyimpan foto referensi produk merek. Perlakukan sebagai baseline kemasan/tampilan, bukan stok gratis — jangan regenerasi, ubah warna, atau restyle produk di dalamnya.
- `public/seq/[product]/` menyimpan 30 frame image sequence JPG siap-pakai.
- `public/svg/` menyimpan 12 file SVG budaya (Mega Mendung, Kujang, Lereng, Pucuk Rebung, corner ornaments, vine strip, flourish, line).
- Pengalihan domain: `*.pages.dev` → domain kustom (mis. `karasakhasnusantara.com`) melalui Cloudflare Bulk Redirects dengan opsi Preserve query string + Subpath matching + Preserve path suffix (PRD §7.3).
