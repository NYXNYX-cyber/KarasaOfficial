# PLANNING.md — Karasa Web 3D

> Dokumen hidup untuk melacak perencanaan, riset, dan implementasi proyek **Karasa Web 3D**.
> Sumber kebenaran spesifikasi: [`PRODUCT REQUIREMENT DOCUMENT.md`](./PRODUCT%20REQUIREMENT%20DOCUMENT.md) (PRD v2.0).
> Pembagian fase mengikuti PRD §9 (Rencana Implementasi 8 Minggu).
> **Tidak ada kode implementasi yang ditulis sebelum fase ditandai ✅ di kolom Riset.**

---

## Ringkasan Status

| Fase | Judul | Minggu | Riset | Implementasi | Catatan |
| :--: | :-- | :--: | :--: | :--: | :-- |
| 1 | Desain & Aset Visual Nusantara | 1–2 | ✅ | ✅ | 3D Lakar Kuah, SVG budaya, 30 frame Lakar Kering selesai |
| 2 | Arsitektur Multi-Engine & Kompilasi R3F | 3–4 | ✅ | 🟡 | ImageSequencePlayer, ProductSwitcher, ScrollCamera dalam pengerjaan |
| 3 | Fitur Interaksi Gulir & Hotspot Data | 5–6 | ✅ | ⏳ | Riset di `research/fase-3-interaksi-scroll.md` |
| 4 | Integrasi Distribusi, Optimasi, & Peluncuran | 7–8 | ✅ | ⏳ | Riset di `research/fase-4-distribusi-peluncuran.md` |

**Legenda status:** ⏳ Tertunda · 🟡 Berjalan · ✅ Selesai · ❌ Diblokir

## Log Revisi PRD (Akhir Fase 1 → Awal Fase 2)

| # | Topik | PRD Asli | Revisi Juli 2026 | Justifikasi |
| :--: | :-- | :-- | :-- | :-- |
| R1 | **Image sequence frame count** | 60 frame (PRD §2.2 + §5.1) | **30 frame** (override: pakai frame penuh yang tersedia) | Cukup untuk scroll-driven snap 12°/step; override: 145 frame Lakar Kuah & 240 frame Lakar Kering digunakan apa adanya dari ezgif export |
| R2 | **Produk MVP** | 5 produk (Lakar Kuah, Lakar Basah, Opak Klasik, Opak Mini, Lakar Kering) | **2 produk aktif** (Lakar Kuah, Lakar Kering) | Permintaan owner brand; Lakar Basah di-archive, Opak varian ditunda |
| R2b | **Slot ke-3 produk** | n/a (PRD 5 produk fixed) | **Menu Baru section** (Tiktuk + Opak Klasik + Opak Mini sebagai teaser) | Owner request: ganti placeholder Tiktuk dengan menu upcoming products yang lebih informatif |
| R3 | **CTA channel** | WhatsApp + Shopee + Tokopedia (PRD §6.2) | **WhatsApp + Instagram** (email di footer) | Owner belum punya toko Shopee/Tokped; fokus WhatsApp Business + Instagram `@khas.nusantara15` |
| R4 | **Auto-rotate** | ScrollControls + auto-rotate idle | **Tidak auto-rotate** | "Tetap diam" sesuai preferensi owner — produk freeze saat user tidak interaksi |
| R5 | **Lakar Kuah & Basah kemasan** | Pouch (PRD §2.1) | **Paper cup 360 mL** | Verifikasi via `Karasa-image/IMG_*.png` — aktualnya paper cup dengan kerupuk + saus sachet |
| R6 | **Rendering engine** | Lakar Kuah & Basah 3D, Opak & Lakar Kering image sequence | **Lakar Kuah: 3D + image sequence (hybrid), Lakar Kering: image sequence** | Lakar Kuah punya kedua representasi; 3D di hero, image sequence di /produk/lakar-kuah |

Detail `R1–R6` selalu dirujuk saat ada keputusan teknis yang terkait.

---

## Konvensi Penulisan
- Setiap fase punya blok: **Tujuan**, **Deliverable Spesifik**, **Riset & Keputusan Desain**, **Risiko**, **Status**.
- Hasil riset mentah per fase disimpan di `research/fase-N-*.md` dan dirangkum di sini setelahnya.
- Update dilakukan di akhir setiap fase implementasi. Ceklis `[ ]` → `[x]` saat item tuntas.

---

## Fase 1 — Desain & Aset Visual Nusantara (Minggu 1–2)

### Tujuan
Membangun semua aset visual mentah (3D & image sequence) dengan tetap menghormati konteks budaya Sunda dan target performa seluler.

### Deliverable Spesifik (dari PRD §9.1)
- [x] 1.1 Model 3D kemasan untuk **Lakar Kuah** (R3F prosedural, bukan Blender) — paper cup 360 mL sesuai foto produk. **Lakar Basah** di-archive (tidak di MVP, lihat R2).
- [x] 1.2 Pra-render **30 frame** rotasi 360° untuk **Lakar Kering** (JPG 720×1280, total 904 KB di `public/seq/lakar-kering/`). **Tiktuk** masih placeholder (lihat R2).
- [x] 1.3 Pola **SVG Mega Mendung** dan **Kujang** + aset 2D HUD (badge "Handmade", "Tanpa Pengawet", ikon motif Lereng/Pucuk Rebung).

### Riset & Keputusan Desain ✅
Ringkasan dari `research/fase-1-aset-visual.md` (535 baris):
- **Pipeline 3D (Lakar Basah & Kuah):** Triangle budget **10–30K per produk**, total scene < 100K. Material unik ≤ 5, draw call < 50. Ekspor `.glb` dengan Draco dari Blender, target ukuran < 1 MB per produk.
- **Tingkat tekstur:** 512 px untuk mobile-first → 1024 px saat interaksi manual → 2048 px hanya untuk hero statis. **Power-of-two wajib** (mipmap).
- **Pipeline Image Sequence:** 60 frame × **1024×1024 WebP** (quality 80–90) per produk. Total estimasi **6–12 MB per produk**. Penamaan `000.webp` … `059.webp` (zero-padded 3 digit). Gunakan add-on **Turntable Camera** Blender.
- **SVG Budaya:**
  - **Mega Mendung** (Cirebon, 5–7 lapis awan bertingkat) — di-redraw dengan style geometris Karasa, gradient `#0000FF` (Paul) → `#FFFFFF` (Bodas).
  - **Kujang** (senjata Sunda, bilah melengkung dengan 1–9 mata hierarkis) — referensi Public Domain `freesvg.org/kujang` (ID 160931), di-redraw sebagai silhouette 200×400.
  - **Lereng** & **Pucuk Rebung** — gambar ulang geometris sederhana.
- **HUD 2D:** Cukup **SVG inline** untuk badge & ikon (tajam di semua DPI, warna diikat ke palet Sunda via `currentColor`).
- **Konsistensi lintas produk:** Palet 6 warna Sunda (PRD §3.3) untuk komponen **semiotic**; warna produk realistis diizinkan. Pencahayaan "Fajar Priangan" = `directionalLight` warm gold (#FFB347, intensitas 1.2–1.5, dari +X) + `ambientLight` indigo (#3B3273, intensitas 0.3).

### Kontrak Output ke Fase 2
| Item | Spesifikasi | Validasi |
| :-- | :-- | :-- |
| GLB Draco Lakar Basah | < 30K tri, < 1 MB, ≤ 5 material, 2 atlas 512 px | [gltf-viewer.donmccurdy.com](https://gltf-viewer.donmccurdy.com/) |
| GLB Draco Lakar Kuah | < 30K tri, < 1.2 MB, ≤ 5 material, 3 atlas 512 px | Sama |
| WebP 60 frame per produk | < 12 MB, 1024×1024 | `ls -lh public/images/<product>/` |
| SVG Mega Mendung | 800×200, 5 pita awan, gradient Paul→Bodas | Inspect browser |
| SVG Kujang siluet | 200×400, fill Hawuk/Hideung | Inspect, proporsi 1:2 |
| Badge SVG (3 varian) | 200×60, inline, dengan `<title>` a11y | Lighthouse a11y ≥ 95 |

### Risiko
- Akurasi pencahayaan image sequence di Blender vs R3F shader harus **persis sama** (pakai HDRI `kiara_1_dawn` Poly Haven CC0, atau procedural sky dengan sun elevation 3–5°).
- Triangle budget bisa meledak jika modeler tidak disiplin — hard limit 30K per model.
- Konversi 60 frame PNG → WebP menambah waktu build 10–30 menit; batch parallel via GNU parallel.

### Status
- Riset: ✅
- Implementasi: ✅ (1.1, 1.2, 1.3 selesai dengan revisi PRD R1, R2, R5)

### Update Implementasi (Juli 2026)
- **Pendekatan diubah dari Blender ke R3F prosedural** (tidak ada 3D artist). Model paper cup Lakar Kuah dibangun dengan `CylinderGeometry` + `IcosahedronGeometry` (kerupuk) + `BoxGeometry` (sachet). Triangle budget aktual ~5K per produk (jauh di bawah 30K).
- **PRD direvisi untuk Lakar Kuah:** **paper cup 360 mL** (bukan pouch seperti PRD §2.1). Verifikasi via `Karasa-image/IMG_*.png`. Lakar Basah di-archive (lihat R2).
- **Stack terkunci:** Vite 5 + React 19 + R3F 9.6.1 + Drei 10.7 + three 0.170 + Tailwind v4 + `@fontsource-variable/{fraunces,plus-jakarta-sans,noto-sans-sundanese,playfair-display}`.
- **Pencahayaan "Fajar Priangan"** diimplementasi di `src/components/three/LightingSetup.tsx` (sun + ambient + rim + Environment preset `dawn`).
- **Adaptive quality (3-tier)** di `src/components/three/AdaptiveQuality.tsx` + `quality-context.ts` — jalan via Drei `PerformanceMonitor`.
- **Image sequence 30 frame** (override PRD §2.2 60 frame, lihat R1) untuk Lakar Kering. Sampling 240→30 dari `Karasa-image/Produk2/imagesequence/`, disimpan di `public/seq/lakar-kering/frame_000.jpg` … `frame_029.jpg`. Total 904 KB.
- **SVG budaya & HUD 2D** ada di `public/svg/` (12 file, 32 KB total) + `src/components/hud/`. Font Nusantara self-host via `@fontsource-variable`.
- **Dekorasi pinggir Nusantara** di `App.tsx`: vine strip vertikal, corner ornament (kiri-bawah besar, kanan-atas mirror), border Lereng, scatter sparkles — semua `pointer-events-none` & `aria-hidden="true"`.
- **Build output:** HTML 1.18 KB, CSS 30 KB (gz 7.85 KB), JS initial 17 KB (gz 5.49 KB) + r3f 422 KB + three 687 KB. Font total ~175 KB woff2.
- **Catatan:** `_redirects` (PRD §7.2) sudah diset. `wrangler.toml` belum karena deployment belum final.

Detail lengkap di [`STYLE_GUIDE.md`](./STYLE_GUIDE.md).

---

## Fase 2 — Arsitektur Multi-Engine & Kompilasi R3F (Minggu 3–4)

### Tujuan
Menyiapkan fondasi teknis: pipeline aset ke web, integrasi WebGL 3D + Canvas 2D, setup lighting PBR, dan bug-fix snippet PRD. **Scope direvisi per R2 (3 produk, bukan 5).**

### Deliverable Spesifik (Fase 2 Aktual)
- [x] 2.1 `types/product.ts` + `lib/three/product-registry.ts` (3 produk: lakar-kuah / lakar-kering / tiktuk)
- [x] 2.2 `lib/cta/{whatsapp,instagram}.ts` — deep-link dengan templat pesan per produk
- [x] 2.3 `lib/image-sequence/{browser-detect,loader}.ts` — WebP/JPG support, preload + idle callback
- [x] 2.4 `components/three/ImageSequencePlayer.tsx` — Canvas 2D, **bug-fixed** (useRef array, defensive Math.round, race-safe first-frame, scroll-driven)
- [x] 2.5 `components/three/ScrollCamera.tsx` — `CatmullRomCurve3` 4 anchor points, smooth lerp
- [x] 2.6 `components/three/ProductSwitcher.tsx` — lazy orchestration 3D ↔ ImageSeq ↔ Placeholder, NO auto-rotate
- [x] 2.7 `components/three/TiktukPlaceholder.tsx` — section "Akan Segera Hadir" untuk produk TBD
- [x] 2.8 `components/three/KarasaScene.tsx` update — `<ScrollControls pages={4}>`, OrbitControls `autoRotate={false}`
- [x] 2.9 `components/hud/{ProductInfo,BuyCTA,LoadingProgress}.tsx` — overlay info, CTA 2 tombol, frame counter
- [x] 2.10 Archive `LakarBasah.tsx` → `src/components/three/_archive/LakarBasah.tsx`
- [x] 2.11 `App.tsx` update — Hero + 3 produk + Cerita, footer 3-icon (WA + IG + Email)
- [x] 2.12 `index.css` shimmer animation untuk loading skeleton
- [x] 2.13 `tsc -b --noEmit` clean + `vite build` sukses

### Riset & Keputusan Desain ✅
Ringkasan dari `research/fase-2-engine-r3f.md` (978 baris):
- **Stack terkunci (Juli 2026):** React 19 + R3F 9.6.x (Sunset X) + Drei 10.x + three 0.170+ + Vite 5/6 + GSAP 3.12 + Tailwind 3.4. **JANGAN pakai** R3F v10 alpha (WebGPURenderer masih experimental).
- **Pipeline GLB → Draco:** `gltfjsx --transform --resolution 1024 --format webp --simplify --ratio 0.75 --keepmeshes --keepmaterials`. Flag `--keepmeshes/--keepmaterials` **wajib** untuk Lakar Basah (material clearcoat vs non-clearcoat tidak boleh di-join). Output: satu `.glb` < 1 MB per produk.
- **Decoder Draco:** Self-host di `public/draco-gltf/` (jangan dari `gstatic.com`). Preload via `<link rel="prefetch">`. Setup sekali via `useGLTF.setDecoderPath('/draco-gltf')`.
- **Material PBR Lakar Basah:** 6 material `MeshPhysicalMaterial`:
  - `PouchBody` — color #FFFAF0, roughness 0.55, metalness 0
  - `StickerWet` (stiker saus) — color #C8102E, **roughness 0.18, clearcoat 1.0, clearcoatRoughness 0.08** ← kilap saus minyak cabai
  - `Mika` (jendela) — transmission 0.85, roughness 0.05, ior 1.45, `depthWrite: false`
  - `SausChilli` — color #FF0000, roughness 0.3, X-Ray opacity 0.6
  - `Baso`, `Siomay`, `Bumbu` — `MeshStandardMaterial` warm gold (#FFB347), roughness 0.7
- **Pencahayaan "Fajar Priangan":**
  - `<directionalLight position={[8,6,4]} color="#FFB37A" intensity={2.2} castShadow shadow-mapSize=[1024,1024]/>` (matahari ~2300K dari timur)
  - `<ambientLight color="#5A5A8A" intensity={0.35}/>` (langit indigo Bandung)
  - `<directionalLight position={[-3,2,-5]} color="#FFFF00" intensity={0.4}/>` (rim light Koneng per PRD §3.3)
  - `<Environment preset="dawn" environmentIntensity={0.5}/>` (refleksi PBR tanpa beban bundle)
  - Tone mapping: `ACESFilmicToneMapping`, exposure 1.0
- **`<PerformanceMonitor>` Drei:** `bounds: refreshrate > 90 ? [55,90] : [40,55]`, `flipflops: 3`, `step: 0.15`. Propagasi 3 level kualitas (`high`/`mid`/`low`) via React Context → dpr, shadow map, texture size.
- **🐛 Bug ditemukan di snippet PRD §5.1** (wajib diperbaiki sebelum implementasi):
  1. `useRef<HTMLImageElement>()` harusnya `useRef<HTMLImageElement[]>([])` — `.push()` di PRD akan throw runtime error.
  2. `images.current.onload = …` di array — gantung; harus per-image handler.
  3. `frame` float di onUpdate — tambahkan `Math.round` defensif (meskipun `snap: "frame"` sudah handle).
  4. Race condition: frame 0 harus digambar **sebelum** ScrollTrigger aktif — pakai `img.onload` per frame atau `Promise.all`.
- **Preload image sequence (PRD §8.2):** 10 frame pertama **sinkron** (boleh block ~500ms), sisanya via `requestIdleCallback`. Polyfill `requestIdleCallback` untuk Safari < 16.4. **`<link rel="preload" as="image">`** di `<head>` untuk 10 frame pertama.
- **OffscreenCanvas:** JANGAN dipakai default di mobile mid-range. Pakai hanya jika FPS monitor menunjukkan main thread usage > 80%.
- **Struktur folder proyek** dirancang lengkap: `src/components/{three,canvas,hud,layout}`, `src/lib/{three,utils,config}`, `public/{models,draco-gltf,images,svg,hdri}`.

### Kontrak Output ke Fase 3
- `LakarKuah.tsx` (3D siap-pakai) + `KarasaScene.tsx` (root Canvas dengan ScrollControls).
- `ImageSequencePlayer.tsx` (Canvas 2D, bug-fixed).
- `ProductSwitcher.tsx` — orchestrator lazy, NO auto-rotate.
- `ScrollCamera.tsx` — CatmullRomCurve3 spline path.
- `ProductRegistry` (single source of truth untuk 3 produk) + `useProduct()` hook.
- `BuyCTA` (2 tombol: WhatsApp + Instagram) + `ProductInfo` (nama + deskripsi, no harga).
- `public/_redirects` (PRD §7.2: `/* /index.html 200`).
- `public/seq/lakar-kering/frame_000.jpg` … `frame_029.jpg` (30 frame, 720×1280 JPG, 904 KB total).
- `src/config/contact.ts` (nomor WhatsApp + Instagram handle hard-code, bukan inline).

### Risiko
- **Aturan keras PRD §8.1:** `useState` di dalam `useFrame` **dilarang** — mutasi langsung `meshRef.current`. (Riset Fase 2 menegaskan ini.)
- Draco decoder CDN default ke `gstatic.com` — self-host untuk konsistensi & GDPR.
- Pinning 300svh di image sequence + ScrollControls spline = **konflik scroll** (lihat Fase 3).
- 30 frame image sequence (override PRD 60) mungkin terasa patah di low-end device saat scrub cepat. Mitigasi: `Math.round` defensif + `dpr=[1,1.5]` di quality preset mid.

### Status
- Riset: ✅
- Implementasi: 🟡 (komponen utama selesai, integrasi & verifikasi build dalam proses)

---

## Fase 3 — Fitur Interaksi Gulir & Hotspot Data (Minggu 5–6)

### Tujuan
Mengikat perilaku kamera dan frame sequence ke gulir pengguna, plus overlay informasi produk berbasis `<Html>` Drei. Aksesibilitas built-in sejak awal.

### Deliverable Spesifik (dari PRD §9.3)
- [ ] 3.1 Integrasi `<ScrollControls>` Drei untuk transisi kamera 3D antar produk (spline, bukan hard-cut).
- [ ] 3.2 Sinkronisasi GSAP `ScrollTrigger` dengan `ImageSequencePlayer` (scrub, pin, snap ke frame).
- [ ] 3.3 Hotspot informasi melayang (overlay `<Html>` Drei) di area stiker/klip kemasan.

### Riset & Keputusan Desain ✅
Ringkasan dari `research/fase-3-interaksi-scroll.md` (546 baris):
- **`<ScrollControls>` Drei** untuk kamera spline Lakar Basah → Lakar Kuah: `useScroll().offset` 0–1 → `THREE.CatmullRomCurve3.getPointAt(t)` di `useFrame`. Props: `pages={3} damping={0.15} maxSpeed={0.6} horizontal={false} infinite={false}`.
- **`<OrbitControls>` ↔ `<ScrollControls>` saling menggantikan, bukan ditumpuk.** Pola: `controls.enabled = !isScrolling` di `useFrame`. Saat kamera "parkir" di titik fokus, `OrbitControls` re-enabled dengan `minPolarAngle={Math.PI/3}` (60°) dan `maxPolarAngle={Math.PI/2.05}` (~88°) — **kunci** agar tidak menembus pedestal Kujang (PRD §5.2).
- **🐛 Konflik inti GSAP + drei ScrollControls:** `pin: true` di ScrollTrigger tidak main baik dengan damping ScrollControls (GSAP forum #40114, drei issue #1316). **Solusi terapan untuk Karasa:** **Strategi A — pisah seksi.** Letakkan `ImageSequencePlayer` (PRD §5.1) untuk Opak/Lakar Kering di section terpisah, di luar `<ScrollControls>`. Jangan nested.
- **Konfigurasi ScrollTrigger optimal:** `frame: 59, snap: 'frame', ease: 'none' (wajib), scrub: 0.5, pin: true, start: 'top top', end: '+=300svh'`. Catatan: pertimbangkan `scrub: true` (lebih responsif) bila PRD §5.1 `0.5` terasa berat.
- **`<Html>` Drei hotspot:** Pola `position={[x,y,z]}` + `occlude={[modelRef]}` + `onOcclude` callback. Default mode (tanpa `transform`) cukup untuk badge HTML. Z-fighting dihindari.
- **Animasi hotspot:** Bungkus dengan Framer Motion `motion.div` (`AnimatePresence` + spring `stiffness: 280, damping: 22`).
- **Click handler + focus kamera:** Pakai `useBounds` Drei atau `gsap.to(camera.position, …)` di event handler. `e.stopPropagation()` wajib agar tidak konflik dengan OrbitControls.
- **Aksesibilitas (wajib, bukan nice-to-have):**
  - Tambahkan paket `@react-three/a11y` ke stack (~16 KB gzip). Bukan dependency PRD §4.1, tapi value-nya tinggi.
  - `<A11yAnnouncer />` sibling dengan `<Canvas>`, `<A11y role="button" description="...">` di setiap hotspot, `<A11yUserPreferences />` untuk baca `prefers-reduced-motion`.
  - Fallback `prefers-reduced-motion: reduce` → `damping=0`, `snap=false`, animasi Framer Motion `duration: 0`.
- **Hotspot di image sequence:** `<Html>` Drei TIDAK berlaku untuk Canvas 2D. Untuk Opak/Lakar Kering, pakai **overlay HTML biasa** dengan lookup table koordinat per frame. Keterbatasan teknis yang harus di-design-around.
- **Pattern use case:**
  - Scroll 0.0–0.1: kamera di spline titik 0, OrbitControls enabled.
  - 0.1–0.9: OrbitControls disabled, kamera ditulis ke spline, hotspot fade cross.
  - 0.9–1.0: kamera parkir, OrbitControls re-enabled, hotspot interaktif.

### Kontrak Output ke Fase 4
- `ScrollCamera.tsx` (Drei spline) + `CameraRig.tsx` (toggle OrbitControls).
- `Hotspot.tsx` (komponen generik, position + occlude + a11y).
- `useProduct()` context / hook untuk state `productId` aktif (Lakar Basah / Kuah / Opak Klasik / Mini / Lakar Kering) — dipakai oleh CTA.

### Risiko
- Pinning canvas 300svh di image sequence + `<ScrollControls>` damping = **konflik scroll** — mitigasi: pisah section (Strategi A).
- Z-fighting & transform blur pada `<Html>` dengan `transform` mode (mitigasi: tanpa `transform` untuk badge).
- Image sequence tidak bisa pakai `<Html>` — perlu lookup table manual.

### Status
- Riset: ✅
- Implementasi: ⏳

---

## Fase 4 — Integrasi Distribusi, Optimasi, & Peluncuran (Minggu 7–8)

### Tujuan
Menyambungkan front-end ke kanal distribusi nyata (Shopee, Tokopedia, WhatsApp), mengoptimalkan paket aset, dan men-deploy ke Cloudflare Pages dengan domain kustom.

### Deliverable Spesifik (dari PRD §9.4)
- [ ] 4.1 Tombol CTA deep-link ke Shopee, Tokopedia, dan WhatsApp Business (+62 815-6333-9275) dengan templat pesan dinamis per produk.
- [ ] 4.2 Kompresi **KTX2** untuk tekstur 3D, optimasi WebP untuk image sequence, audit performa target **60 FPS**.
- [ ] 4.3 Konfigurasi routing SPA + integrasi domain kustom via Cloudflare Bulk Redirects.

### Riset & Keputusan Desain ✅
Ringkasan dari `research/fase-4-distribusi-peluncuran.md` (722 baris):
- **Deep-link WhatsApp:** Format resmi `https://wa.me/<intl>?text=<urlencoded>`. Nomor `+62 815-6333-9275` → `6281563339275` (tanpa `+`, tanpa spasi, tanpa leading 0). Templat pesan:
  ```
  Halo Karasa, saya tertarik dengan *{productName}* dari etalase web 3D Karasa.
  ```
- **Deep-link Shopee:** `shope.ee/an_redir?origin_link=<encoded>&affiliate_id=<id>&sub_id=web3d-{productId}`. URL disimpan sebagai **env constants** (`VITE_SHOPEE_*`), bukan hard-code.
- **Deep-link Tokopedia:** `https://www.tokopedia.com/{shop}/{product-slug}/p/{id}`. Tidak ada short-link publik setingkat `shope.ee`.
- **Semua CTA:** `target="_blank" rel="noopener noreferrer"` + `aria-label="Beli {productName} di {channel}"` + tracking event GTM.
- **Kompresi KTX2 (tekstur 3D):**
  - Tool: **`ktx create` CLI** dari Khronos KTX-Software (bukan `toktx` legacy yang sering error).
  - Diffuse/normal: `--encode etc1s --clevel 4 --qlevel 128 --genmipmap`.
  - Stiker premium (Lakar Basah): `--encode uastc --zcmp 15 --genmipmap`.
  - Loader: `KTX2Loader` three.js + `setTranscoderPath('/basis/')` (self-host 4 file transcoder di `public/basis/`).
  - Drei: `useKTX2(url)` setelah `useLoader.setKTX2Loader(ktx2)` di `onCreated`.
  - Strategi dua resolusi: preload 512 px, swap ke 2K setelah `pointerdown` pertama.
- **Optimasi WebP image sequence:** `cwebp -q 80 -m 6 -metadata none -af` per frame, target **≤ 60 KB per frame @ 1024 px** = total ≤ 3,6 MB per produk. First batch 10 frame sinkron, sisanya `requestIdleCallback`. **Tambahkan content-hash** di nama file + manifest JSON untuk cache optimal.
- **SPA Routing Pages:** **Pilih `public/_redirects` saja** (`/* /index.html 200`). `wrangler.toml [assets] not_found_handling = "single-page-application"` adalah Workers (bukan legacy Pages) — tidak relevan. PRD §7.1 dan §7.2 redundan, pilih §7.2.
- **Bulk Redirects `*.pages.dev → karasakhasnusantara.com`:** 4 opsi **wajib ON**:
  1. Preserve query string
  2. Subpath matching
  3. Preserve path suffix (default true)
  4. Include subdomains (untuk preview branch)
  Status **301** (permanent) untuk SEO.
- **Audit performa 60 FPS / < 2,5 d:**
  - Lighthouse mobile default: 4× CPU + "Slow 4G" (1,6 Mbps down, 750 Kbps up, 150 ms latency) — preset yang dipakai.
  - Target Web Vitals: FCP < 1,8 d, **LCP < 2,5 d**, TBT < 200 ms, CLS < 0,1, INP < 200 ms, Performance ≥ 90.
  - Optimasi lanjutan: code splitting per produk via `React.lazy` + `Suspense`, lazy GLB prefetch via `requestIdleCallback` + Cache API, OffscreenCanvas fallback, `vite.config.ts` `manualChunks` per produk.
- **Performance budget:**
  | Aset | Budget |
  | :-- | :-- |
  | HTML | < 30 KB gz |
  | CSS (Tailwind purged) | < 25 KB gz |
  | JS initial bundle | < 200 KB gz |
  | GLB Draco per produk | < 800 KB gz |
  | KTX2 per tekstur | < 500 KB (2K) |
  | Image sequence 60 frame | < 4 MB |
  | Total first-load | < 1,5 MB (target LCP < 2,5 d pada 4G) |

### Daftar Periksa Pra-Peluncuran
- [ ] `ProductContext` / `useProduct()` menyimpan `productId` aktif.
- [ ] `CTABar` membaca `productId` dan memilih URL dari env constants.
- [ ] Nomor WhatsApp hard-code `6281563339275` di `src/config/contact.ts` (bukan inline).
- [ ] Fungsi `buildWhatsAppURL(productName)` menghasilkan URL dengan `text=` ter-encode.
- [ ] Tracking: GTM event `cta_click` dengan property `{ product, channel, url_host }`.
- [ ] Semua tekstur 3D KTX2; transcoder di `public/basis/`.
- [ ] `useKTX2` atau `KTX2Loader` dipakai (bukan `TextureLoader`).
- [ ] 60 frame WebP `q=80 m=6` per produk, total < 4 MB.
- [ ] First 10 frame preloaded sinkron; sisanya `requestIdleCallback`.
- [ ] `public/_redirects` berisi `/* /index.html 200`.
- [ ] Custom domain `karasakhasnusantara.com` attached di Cloudflare Pages.
- [ ] Bulk Redirects list dibuat, keempat opsi ON, status 301, test `curl -I`.
- [ ] Lighthouse run di production URL — Performance ≥ 90, LCP < 2,5 d.
- [ ] Manual smoke test di device mid-tier (Samsung A33, Redmi Note 11) — verify 60 FPS.

### Risiko
- Deep-link WhatsApp harus **auto-include nama produk** di body pesan — pakai `useProduct()` dari Fase 3.
- Bulk Redirect tanpa semua 4 opsi aktif = sub-halaman patah (PRD §7.3).
- Image sequence 60 frame dengan kontras warna tinggi bisa melebihi 80 KB/frame; perlu quality 75 untuk frame tertentu.

### Status
- Riset: ✅
- Implementasi: ⏳

---

## Catatan Lintas Fase
- **Stack baku (PRD §4.1 + riset):** Vite 5/6 + React 19 + R3F 9.6.x + Drei 10.x + three 0.170+ + GSAP 3.12 + Tailwind 3.4 + Framer Motion. **Tambahan:** `@react-three/a11y` (Fase 3, direkomendasikan).
- **Hosting:** Cloudflare Pages (serverless, tanpa backend).
- **Distribusi:** Tanpa checkout di aplikasi — hanya deep-link eksternal (PRD §6.2).
- **Standar performa:** 60 FPS, LCP < 2,5 d pada 4G, fallback adaptif via `<PerformanceMonitor>` saat FPS < 45.
- **Standar kualitas riset:** Setiap keputusan di PLANNING.md harus bisa dirunut ke `research/fase-N-*.md` + URL library docs atau sumber web yang diverifikasi via `context7`/`firecrawl` MCP.

---

## Cara Berkontribusi ke PLANNING.md
1. Sebelum implementasi sebuah fase, pastikan **Riset = ✅**. Jika belum, jangan menulis kode — tambah task riset dulu.
2. Setelah deliverable fase tuntas, ubah `[ ]` → `[x]` dan naikkan status Implementasi ke ✅.
3. Risiko baru yang muncul saat eksekusi ditambahkan di bagian "Risiko" fase terkait.
4. Keputusan yang menyimpang dari PRD harus didokumentasikan di "Riset & Keputusan Desain" beserta justifikasi.
