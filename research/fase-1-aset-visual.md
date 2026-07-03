# Riset Fase 1 — Desain & Aset Visual Nusantara

> **Proyek:** Karasa Web 3D (PRD v2.0) · **Fase:** 1 — Desain & Aset Visual Nusantara (Minggu 1–2)
> **Status:** ⏳ Riset selesai, menunggu implementasi.
> **Sumber:** Dokumentasi diverifikasi via `context7` MCP (Three.js, @react-three/drei, React Three Fiber), riset web via `firecrawl` MCP.

---

## Ringkasan Eksekutif

- **3D (Lakar Basah & Kuah):** Model low-poly (target **10–30K triangle per produk**, total scene < 100K) diekspor dari Blender via `File > Export > glTF 2.0` dengan Draco compression diaktifkan. Tekstur **awal 512 px** (mobile-first) dengan path upgrade ke **1024 px** saat pengguna mulai rotasi manual, **2048 px** hanya untuk hero shot statis. Pipeline pasca-Blender: `glTF-Transform` (donmccurdy) untuk quantize + KTX2/Basis Universal pada Fase 2.
- **Image Sequence (Opak & Lakar Kering):** 60 frame × 1024×1024 px per produk dalam **WebP lossless atau quality 80–90**. Total estimasi 60 frame @ 1024 px ≈ **6–12 MB per produk** (kisaran industri 20–80 frame < 20 MB per view). Preload 10 frame pertama sinkron, sisanya via `requestIdleCallback`.
- **SVG Budaya:** Mega Mendung (Cirebon, awan bertingkat 5–7 lapis, gradien biru→abu) dan Kujang (senjata Sunda, bilah melengkung 20–25 cm dengan 1–9 mata/lubang hierarkis) akan di-redraw ulang sebagai aset milik Karasa; referensi visual dipakai dari `freesvg.org` (Kujang SVG ID 160931, Public Domain) dan pola publik Mega Mendung untuk studi anatomi. Pucuk Rebung & Lereng digambar ulang secara geometris sederhana.
- **HUD 2D:** Cukup **SVG inline** untuk badge klaim ("Handmade", "Tanpa Pengawet") dan ikon kecil (Lereng, Pucuk Rebung). Tidak perlu raster — tajam di semua DPI, warna bisa diikat ke palet Sunda.
- **Konsistensi lintas produk:** Palet 6 warna Sunda (PRD §3.3) dipakai sebagai **warna semiotik** saja; warna produk (label, makanan) boleh realistis. Pencahayaan "Fajar Priangan" = `directionalLight` warm gold (~#FFB347, intensitas 1.2–1.5, dari +X) + `ambientLight` indigo (~#3B3273, intensitas 0.3). Material PBR mengikuti PRD §3.2 (Dekton matte roughness ~0.7, kayu Sonokeling roughness ~0.5, tanah liat roughness ~0.85).

---

## Pipeline 3D (Lakar Basah & Kuah)

### Tujuan
Model 3D kemasan dengan hitungan poligon rendah untuk **mobile mid-range 60 FPS** (PRD §8), diekspor ke GLB terkompresi Draco agar termuat < 2,5 d pada 4G (PRD §4.2).

### Spesifikasi Teknis (terverifikasi)

| Parameter | Nilai | Sumber |
| :-- | :-- | :-- |
| Triangle count per produk | **10.000–30.000** (hero) | [Blippar WebAR Guide 2026](https://www.blippar.com/webar-performance-optimisation-the-complete-developer-guide/) — "individual hero objects sitting between 10,000 and 50,000 triangles" |
| Total scene triangle budget | **< 100.000** | Sama — "under 100,000 triangles for your total scene" |
| Low-poly maksimum platform ini | **200.000** (hard cap) | [Zakeke best practices](https://zakeke.zendesk.com/hc/en-us/articles/14682779731356-Best-practices-for-maximizing-performance-in-Zakeke-s-3D-Product-Configurator) — "not exceeding 200,000 tris" |
| Material unik per scene | **3–5** | [Blippar](https://www.blippar.com/webar-performance-optimisation-the-complete-developer-guide/) — "no more than three to five unique materials" |
| Draw call per frame (target) | **< 50** | [Blippar](https://www.blippar.com/webar-performance-optimisation-the-complete-developer-guide/) |
| Tekstur awal | **512 × 512 px** (mobile-first) | [Zakeke](https://zakeke.zendesk.com/hc/en-us/articles/14682779731356-Best-practices-for-maximizing-performance-in-Zakeke-s-3D-Product-Configurator) — "For mobile devices, textures should not exceed 512x512 pixels" |
| Tekstur upgrade | **1024 × 1024** | PRD §8.1: "1024 px – 2048 px baru dimuat setelah pengguna mulai rotasi manual" |
| Tekstur hero (statis) | **2048 × 2048** maks | [Blippar](https://www.blippar.com/webar-performance-optimisation-the-complete-developer-guide/) — "2048×2048 is acceptable for hero assets on known high-end device targets" |
| Power-of-two | **Wajib 512/1024/2048** | [Blippar](https://www.blippar.com/webar-performance-optimisation-the-complete-developer-guide/) — "Non-power-of-two textures disable mipmapping" |
| Kompresi tekstur | **KTX2 / Basis Universal** (Fase 2) | [Three.js forum](https://discourse.threejs.org/t/when-to-use-basis-texture/29987) — "Textures in a glTF file can be compressed into .ktx2 GPU textures using Basis Universal compression" |
| Kompresi geometri | **Draco** (Fase 2) | [Jonas Sandstedt](https://jonassandstedt.se/blog/how-to-export-and-compress-a-gltf-file-with-draco-3d-using-blender/) — built-in di Blender glTF exporter; [Unity docs](https://docs.unity.com/en-us/asset-transformer-sdk/2025.7/manual/sdktips/export-guidelines) "Draco compression can reduce GLB file sizes by 70–90%" |
| Ukuran target GLB (Draco) | **< 1 MB per produk** | Total scene < 5 MB ([Blippar framework](https://www.blippar.com/webar-performance-optimisation-the-complete-developer-guide/) "Standard (product viz, 3D overlay) 2–5MB") |

### Alur Produksi (Blender → Web)

1. **Modelling di Blender** — gunakan add-on **LoopTools** untuk bevel rapi, **Decimate Modifier** (jika ada high-poly mesh). Topologi harus **manifold** (tidak ada non-manifold edges) untuk ekspor Draco yang bersih.
2. **UV unwrap** — pack ke atlas **≤ 4 atlas** untuk Lakar Basah, **≤ 5 atlas** untuk Lakar Kuah (label pouch, jendela mika, tutup klip, saus, bumbu). Gabungan atlas mengurangi material unik dan draw call.
3. **Bake ambient occlusion + roughness/metallic** ke tekstur 2048 px master (format PNG lossless), lalu generate **turunan 1024 px dan 512 px** via `gltf-transform resize` (Fase 2).
4. **Ekspor** — `File > Export > glTF 2.0 (.glb)`, dengan opsi:
   - ☑ Compression (Draco)
   - ☑ Tangents (jika pakai normal map)
   - ☐ Animation (tidak perlu)
   - ☑ Materials: "Export with original PBR"
   - Format output: **.glb** (single binary, lebih ringkas dari .gltf + .bin)
5. **Verifikasi** di [gltf-viewer.donmccurdy.com](https://gltf-viewer.donmccurdy.com/).
6. **Optimasi lanjut (Fase 2)** — jalankan `gltf-transform optimize input.glb output.glb` dengan `--texture-compress webp --texture-size 1024` untuk menurunkan ukuran final.

### Lakar Basah — Catatan Material PBR

PRD §2.1 menentukan: "material PBR dengan *roughness map* yang rendah di area stiker untuk memunculkan pantulan mengilap basah khas saus minyak cabai."

- **Material pouch body:** `roughness` 0.45–0.55, `metalness` 0.0 (plastik matte-glossy).
- **Material stiker (area basah saus):** `roughness` **0.15–0.25**, `metalness` 0.0 + `clearcoat` 0.8, `clearcoatRoughness` 0.1 — efek kilap saus minyak cabai.
- **Material saus (isi pouch di X-Ray Mode):** `MeshPhysicalMaterial` dengan `transmission` 0.0, `roughness` 0.2, `color` #FF0000 (Beureum) dengan redup — `opacity` 0.6 di X-Ray Mode (PRD §2.1).
- **Material jendela mika (pouch depan):** `transmission` 0.85, `roughness` 0.05, `ior` 1.45 — refer ke Three.js [MeshPhysicalMaterial](https://threejs.org/docs/pages/MeshPhysicalMaterial.html).
- **Material komponen dalam (baso, siomay):** warna krem keemasan (#FFB347), `roughness` 0.7.

### Lakar Kuah — Catatan X-Ray Mode

PRD §2.1: "Penurunan nilai opasitas material kemasan secara halus untuk memunculkan isi komponen."

- Implementasi animasi: `meshRef.current.material.opacity = lerp(1, 0.35, t)` di dalam `useFrame` (mutasi langsung, **tanpa useState** — PRD §8.1).
- Material pouch body saat X-Ray: `transparent: true`, `opacity: 0.35`, `depthWrite: false` agar komponen dalam tidak ke-clip.
- Komponen dalam (baso, siomay, bumbu kering) mengambang dengan offset posisi Y berdasarkan `Math.sin(state.clock.elapsedTime * 0.3) * 0.02` — di-mutasi via `meshRef.current.position.y`.

### Kode Loader R3F (referensi untuk Fase 2)

Diverifikasi via `context7` untuk [pmndrs/drei](https://context7.com/pmndrs/drei/llms.txt):

```jsx
import { Canvas } from '@react-three/fiber'
import { useGLTF, PerformanceMonitor, OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'

useGLTF.preload('/models/lakar-basah.glb', '/draco-gltf')  // Draco decoder path

function LakarBasah({ position }) {
  const { scene } = useGLTF('/models/lakar-basah.glb')
  return <primitive object={scene} position={position} />
}

function Scene() {
  return (
    <Canvas>
      <PerformanceMonitor
        onDecline={(fps) => console.warn('FPS dropped to', fps)}  // disable shadows, post-fx on <45 FPS
        bounds={(refreshrate) => refreshrate > 90 ? [55, 65] : [40, 50]}
      />
      <Suspense fallback={null}>
        <LakarBasah position={[0, 0, 0]} />
        <OrbitControls
          minPolarAngle={Math.PI * 0.25}   // kunci tidak mendongak menembus pedestal
          maxPolarAngle={Math.PI * 0.55}   // PRD §5.2
          enableDamping
          enablePan={false}
        />
      </Suspense>
    </Canvas>
  )
}
```

### Folder Output yang Disarankan

```
public/
├── models/
│   ├── lakar-basah.glb         # < 1 MB, Draco compressed
│   ├── lakar-kuah.glb          # < 1 MB, Draco compressed
│   ├── lakar-basah@2k.glb      # opsional, swap saat high-res mode
│   └── lakar-kuah@2k.glb
└── draco-gltf/                 # Draco WASM decoder (WASM < 200 KB)
    ├── draco_decoder.wasm
    ├── draco_wasm_wrapper.js
    └── draco_decoder.js
```

---

## Pipeline Image Sequence (Opak & Lakar Kering)

### Tujuan
60 frame rotasi 360° per produk, dirender di Blender, untuk diputar via Canvas 2D di React dengan GSAP ScrollTrigger (PRD §5.1). Frame sequence dipilih (bukan 3D) untuk **detail tekstur tinggi tanpa membebani GPU** (PRD §2.2).

### Spesifikasi Frame

| Parameter | Nilai | Sumber |
| :-- | :-- | :-- |
| Jumlah frame | **60** (6° per frame) | PRD §2.2 eksplisit menyebut 60 frame |
| Resolusi per frame | **1024 × 1024 px** | PRD §5.1: `<canvas width="1024" height="1024">` |
| Format output | **WebP** quality 85–90 (lossless untuk stiker) | [WebRotate 360](https://www.webrotate360.com/blog/2024/how-many-images-do-i-need-for-a-360-product-view.aspx) — "WEBP can reduce file sizes by up to 40% compared to JPG"; [Google WebP](https://developers.google.com/speed/webp) |
| Format fallback dev | **PNG** (selama preview, sebelum encode WebP) | [Blender Stack Exchange](https://blender.stackexchange.com/questions/148231/what-image-format-encodes-the-fastest-or-at-least-faster-png-is-too-slow) |
| Total file size 60 frame @ 1024 px | **6–12 MB per produk** (kisaran) | Ekstrapolasi: WebP 1024 px lossless ~ 100–200 KB/frame × 60 = 6–12 MB; [WebRotate 360](https://www.webrotate360.com/blog/2024/how-many-images-do-i-need-for-a-360-product-view.aspx) acuan "20–80 images, < 20 MB combined" |
| Canvas di React | `width=1024 height=1024` (per PRD §5.1) | PRD §5.1 snippet |
| Padding | **+5%** di setiap sisi untuk kompensasi rotasi | Standar industri |

### Alur Produksi (Blender → WebP)

#### Opsi A — Manual (1 frame = 1 render)
1. Setup **turntable**:
   - Tambahkan `Empty` di pusat produk sebagai parent.
   - `Camera` di-parent ke Empty, offset pada sumbu Z.
   - `Empty` diberi keyframe rotasi Z dari `0°` ke `360°` selama **61 frame** (agar kembali ke posisi awal, modulo 60).
   - Atur output: `Frame Rate 60 fps`, `Frame Start 1`, `End 61`, `Step 1` (render tiap frame).
2. **Pilih engine:** Eevee untuk preview cepat + Cycles untuk final (kualitas PBR lebih stabil).
3. Output Properties → `File Format: PNG`, `Color: RGBA` (transparan), `Compression: 15` (lossless trade-off).
4. Render → `Image Sequence` (bukan video).
5. **Konversi ke WebP** via ImageMagick atau `cwebp`:
   ```bash
   for f in frames/*.png; do
     cwebp -q 85 -near_lossless 60 "$f" -o "${f%.png}.webp"
   done
   ```
   Bendera `-near_lossless 60` mempertahankan ketajaman stiker dan label.

#### Opsi B — Add-on (lebih cepat)
Gunakan **[Turntable Camera](https://extensions.blender.org/add-ons/turntable-camera/)** (v0.1.2, Blender 5.0-ready, Feb 2026) — parameter kunci:
- `Steps: 60`
- `Range to Scene: ☑`
- `Hold Frames: 1`
- `Elevation Interpolation: Stepped`
- `Elevation Steps: 1` (kamera tetap di ekuator, hanya Y rotation)
- `Distance: 1.5` × bounding-box diagonal

#### Setup Kamera untuk Konsistensi
- **Single rotation axis** (Y/vertikal) saja untuk animasi user-driven.
- **Height kamera** konstan — eye-level terhadap tengah produk.
- **Lighting** distandarisasi (lihat bagian **Konsistensi Lintas Produk** di bawah).
- **Background** selalu `#FFFFFF` (Bodas) atau `#0000FF` (Paul) — akan di-key out di Canvas via `clearRect` + parent container color.

### Struktur Folder Output

```
public/
├── images/
│   ├── opak-klasik/
│   │   ├── 000.webp   # frame 0  (0°)
│   │   ├── 001.webp   # frame 1  (6°)
│   │   ├── ...
│   │   ├── 059.webp   # frame 59 (354°)
│   │   └── manifest.json   # opsional: array URL untuk pre-cache
│   ├── opak-mini/
│   │   ├── 000.webp ... 059.webp
│   └── lakar-kering/
│       ├── 000.webp ... 059.webp
```

Penamaan **zero-padded 3 digit** sesuai referensi implementasi di PRD §5.1:
```ts
String(i).padStart(3, '0')
```

### Strategi Preload (terverifikasi PRD §8.2)

```ts
// 10 frame pertama SINKRON, sisanya requestIdleCallback
const SYNC_FRAMES = 10;
const images = useRef<HTMLImageElement[]>([]);

useEffect(() => {
  // Preload 10 frame pertama (sinkron, blocking — boleh ~500ms)
  for (let i = 0; i < SYNC_FRAMES; i++) {
    const img = new Image();
    img.src = `/images/${productId}/${String(i).padStart(3, '0')}.webp`;
    images.current[i] = img;
  }

  // Sisanya di idle
  let frame = SYNC_FRAMES;
  const loadNext = (deadline: IdleDeadline) => {
    while (frame < 60 && deadline.timeRemaining() > 5) {
      const img = new Image();
      img.src = `/images/${productId}/${String(frame).padStart(3, '0')}.webp`;
      images.current[frame] = img;
      frame++;
    }
    if (frame < 60) requestIdleCallback(loadNext);
  };
  requestIdleCallback(loadNext);
}, [productId]);
```

Jika browser tidak mendukung `requestIdleCallback`, fallback ke `setTimeout(..., 16)` (1 frame animation delay).

---

## Pola SVG Budaya (Mega Mendung, Kujang, Lereng, Pucuk Rebung)

### Mega Mendung (awan bertingkat Cirebon)

**Sumber & karakteristik:**

- **Asal:** Cirebon, pesisir Jawa Barat, akulturasi budaya Tionghoa abad ke-16. ["Mega" = awan, "Mendung" = mendung/overcast](https://www.facebook.com/groups/582714786695908/posts/1157040032596711/).
- **Ciri visual:** ["layered cloud patterns, arranged neatly. Each line creates a sense of depth"](https://vocal.media/art/batik-megamendung-pattern) — **5–7 pita awan** tersusun dari kecil (atas) ke besar (bawah), seringan warna **biru tua → biru muda → abu-abu** untuk efek kedalaman.
- **Simbolisme:** Ketenangan, kesabaran, kemampuan tetap tenang dalam adversity.
- **Arah:** di Cirebon ada dua arah — horizontal dan vertikal (horizontal = ketenangan, vertikal = pertumbuhan).
- **Penggunaan Karasa (PRD §3.1):** "peta tekstur dinamis pada latar belakang kanvas serta animasi shader transisi."

**Strategi implementasi SVG:**

1. **Bukan menyalin pola batik** — akan dilakukan **re-interpretasi** dengan bentuk awan yang lebih geometris (bukan batik tulis), supaya pas dengan bahasa visual Karasa (modern minimalis).
2. **Struktur SVG yang akan dibuat:**
   ```
   <svg viewBox="0 0 800 200">
     <defs>
       <linearGradient id="mendungGrad" x1="0" y1="0" x2="0" y2="1">
         <stop offset="0%"   stop-color="#0000FF" stop-opacity="0.9"/>  <!-- Paul -->
         <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.1"/>  <!-- Bodas -->
       </linearGradient>
     </defs>
     <!-- 5 pita awan bertingkat, dari kecil (atas) ke besar (bawah) -->
     <path d="..." fill="url(#mendungGrad)"/>
     ...
   </svg>
   ```
3. **Format deliverable:**
   - `mendung-horizontal.svg` — 800×200, untuk banner separator & latar belakang section.
   - `mendung-vertical.svg` — 200×800, untuk aksen scroll indicator.
   - `mendung-mask.svg` — versi monochrome `#0000FF` untuk di-mask ke tekstur 3D.
4. **Animasi:** `transform: translateX(-25%)` di CSS, loop via `animation: drift 20s linear infinite` — atau via GSAP untuk sinkronisasi dengan scroll (PRD §3.1 menyebut "animasi shader transisi").
5. **Referensi bentuk** (bukan copy): polanya bisa di-generate via **algorithmic SVG** — lihat [vectorstock mega mendung](https://www.vectorstock.com/royalty-free-vectors/mega-mendung-vectors) dan [vecteezy batik cloud](https://www.vecteezy.com/free-vector/batik-cloud) untuk studi anatomi. **Jangan langsung embed** SVG berhak cipta dari vendor.

### Kujang (senjata pusaka Sunda)

**Sumber & karakteristik:**

- **Asal:** Pasundan, abad ke-8/9 M, awalnya alat pertanian. [Bilahnya melengkung](https://grokipedia.com/page/Kujang_(weapon)) seperti tanduk rusa atau trisula.
- **Ukuran tipikal:** 20–25 cm (kisaran 15–40 cm).
- **Bentuk bilah:** "distinctive curved profile, often evoking the shape of a deer's antler or a forked horn, with a broad base that narrows toward a sharp, pointed tip". Memiliki **serration** (`eluk`) di tepi belakang.
- **Lubang hierarkis (`mata`):** 1–9 lubang, dengan signifikansi sosial — **9 untuk raja/brahmana, 5 untuk bupati, 3 untuk kepala desa, 1 untuk penjaga**.
- **Material:** besi, baja, atau pamor (pattern-welded).
- **Simbolisme:** ketajaman, keberanian, keadilan, warisan leluhur; filosofi *Panca Niti* (lima tahap pemahaman).
- **Penggunaan Karasa (PRD §3.1):** "tumpuan pedestal 3D objek produk dan siluet pembatas antarmuka visual."

**Strategi implementasi SVG:**

1. **Basis referensi (Public Domain):** [freesvg.org/kujang (SVG ID 160931, Public Domain, 0.01 MB)](https://freesvg.org/kujang) — dapat dipakai sebagai **referensi anatomi**, tapi akan di-redraw dengan style geometris yang lebih bersih untuk konsistensi merek.
2. **Struktur SVG yang akan dibuat:**
   ```
   <svg viewBox="0 0 200 400">
     <!-- 3 lob utama: tengah (papatuk) + 2 sayap (silih) -->
     <path d="M100,20 L120,80 L150,100 L130,160 L100,200 L70,160 L50,100 L80,80 Z"
           fill="#000000"/>
     <!-- 5 mata (mata) hierarkis — variasi opsional: 5 untuk kabupaten/regent, 9 untuk pusaka agung -->
     <circle cx="100" cy="100" r="6" fill="#FFFF00"/>  <!-- Koneng -->
     <circle cx="100" cy="130" r="6" fill="#FFFF00"/>
     <circle cx="100" cy="160" r="6" fill="#FFFF00"/>
     <circle cx="85"  cy="130" r="6" fill="#FFFF00"/>
     <circle cx="115" cy="130" r="6" fill="#FFFF00"/>
   </svg>
   ```
3. **Format deliverable:**
   - `kujang-silhouette.svg` — 200×400, monochrome `#000000` atau `#808080` (Hawuk), untuk siluet UI divider & pedestal.
   - `kujang-outline.svg` — 200×400, stroke-only, untuk placeholder loading.
4. **Aplikasi 3D:** sebagai **pedestal/decoration** di bawah model 3D (PRD §3.1) — akan di-ekspor ke GLB terpisah atau di-bake ke dalam material pedestal yang sama. Pertimbangkan **flat plane dengan alpha-map** agar jumlah triangle tetap minimum.

### Lereng (motif lereng/garis diagonal)

**Karakteristik:** Garis-garis diagonal yang merepresentasikan **keselarasan hidup** (PRD §3.1). Dalam seni Sunda, motif Lereng adalah garis zig-zag atau diagonal yang mengartikan harmoni antara manusia, alam, dan Tuhan.

**Strategi implementasi:**
- File `lereng-divider.svg` — pattern 40×40 px yang bisa diulang (`background-image: url(lereng-divider.svg); background-repeat: repeat;`).
- 3 varian: tipis (1 px stroke), sedang (2 px), tebal (4 px).
- Warna: gunakan `#FF0000` (Beureum) untuk强调 atau `#808080` (Hawuk) untuk netral.

### Pucuk Rebung (pucuk bambu)

**Karakteristik:** Bentuk segitiga runcing seperti pucuk bambu, **lambang pertumbuhan dan harapan baru** (PRD §3.1). Dipakai sebagai indikator scroll progress dan pembatas grid menu.

**Strategi implementasi:**
- File `pucuk-rebung.svg` — 24×24 px ikon, 4 varietas (kiri-kanan, kanan-kiri, atas, bawah).
- Dapat dipakai sebagai **bullet points** list atau **scroll progress** chevron.
- Warna: `#008000` (Hejo) untuk aktif, `#808080` (Hawuk) untuk non-aktif.

### Tools & Library Pendukung

- **Apache Batik SVG Toolkit** (Java) — untuk rasterisasi SVG ke PNG jika butuh fallback raster. Lihat [github.com/apache/xmlgraphics-batik](https://github.com/apache/xmlgraphics-batik). Tidak wajib untuk runtime web, hanya untuk build tools.
- **Inkscape** (open source) — untuk manual redraw & eksport final SVG.
- **Figma** (komersial) — untuk kolaborasi desain visual dengan klien.
- **React/Inline SVG** — tidak butuh library tambahan; cukup `<svg>` JSX dengan `currentColor` agar warna bisa diikat via Tailwind `text-*` (PRD §4.1: Tailwind CSS).

### Pedoman Lisensi

- Hindari menyalin SVG berhak cipta (Shutterstock, Adobe Stock). Gunakan [freesvg.org](https://freesvg.org/) (Public Domain/CC0) atau gambar ulang dari nol.
- Semua SVG yang akan dipakai di Karasa Web **sebaiknya dibuat khusus** (custom) untuk menghindari masalah legal di kemudian hari dan untuk konsistensi visual.

---

## Aset HUD 2D

### Pedoman Umum (PRD §6.1)

> "Penempatan teks melayang (*floating 3D/2D badges*) yang menonjolkan klaim 'Handmade', 'Tanpa Pengawet'."

### Spesifikasi

| Aset | Format | Ukuran | Warna | Lokasi |
| :-- | :-- | :-- | :-- | :-- |
| Badge "Handmade" | SVG inline | 200×60 px | bg `#FFFF00` (Koneng), teks `#FF0000` (Beureum) | floating card pojok kiri-atas setiap produk |
| Badge "Tanpa Pengawet" | SVG inline | 200×60 px | bg `#008000` (Hejo), teks `#FFFFFF` (Bodas) | floating card pojok kanan-atas |
| Badge "100% Lokal" | SVG inline | 200×60 px | bg `#0000FF` (Paul), teks `#FFFFFF` | floating card pojok bawah |
| Ikon Lereng divider | SVG inline | 40×40 px (repeat) | stroke `#FF0000` atau `#808080` | antara section deskripsi & visualizer |
| Ikon Pucuk Rebung | SVG inline | 24×24 px | fill `#008000` aktif / `#808080` non-aktif | scroll progress bar, nav menu bullet |
| Ikon Kujang mini | SVG inline | 32×32 px | fill `#000000` | placeholder loading, 404 fallback |

### Mengapa SVG Inline (bukan raster)?

- **Skalabilitas:** tajam di semua DPI seluler (Retina, AMOLED).
- **Ukuran:** file < 1 KB per ikon vs 5–50 KB PNG.
- **Manipulasi runtime:** warna bisa diikat ke CSS custom property (`--brand-yellow: #FFFF00`) dan dianimasikan via Framer Motion.
- **Aksesibilitas:** `<title>` dan `<desc>` di dalam SVG untuk screen reader.

### Rekomendasi Pola Kode

```jsx
// components/BrandBadge.tsx
type BrandBadgeProps = {
  label: string
  bgHex: `#${string}`
  textHex: `#${string}`
}

export const BrandBadge = ({ label, bgHex, textHex }: BrandBadgeProps) => (
  <div
    className="inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-md backdrop-blur-sm"
    style={{ backgroundColor: bgHex, color: textHex }}
  >
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
      {/* ikon tangan untuk "Handmade" / ikon daun untuk "Tanpa Pengawet" */}
      <path d="..." />
    </svg>
    <span className="text-sm font-semibold uppercase tracking-wide">{label}</span>
  </div>
)
```

---

## Konsistensi Lintas Produk

### Palet Warna Sunda (PRD §3.3, diverifikasi via Riset)

**Sumber akademis:** [Sundanese Colors (Maulina & Sabana, 2018, ITB)](https://www.researchgate.net/publication/328190095_SUNDANESE_COLORS) — mengidentifikasi 25 nama warna Sunda; riset lanjutan Rusmawati menemukan 232 nama. Hex code untuk warna dasar tercantum di Tabel II riset.

| Nama Sunda | Makna | Hex Code | Penggunaan Karasa (PRD §3.3) |
| :-- | :-- | :-- | :-- |
| **Bodas** | Kesucian, kebersihan, kejujuran | `#FFFFFF` | Latar utama, teks kontras tinggi, cahaya sorot |
| **Beureum** | Keberanian, vitalitas, kekuatan | `#FF0000` | CTA, indikator aktif, aksen Lereng |
| **Koneng** | Keagungan, kehangatan fajar | `#FFFF00` | Stiker premium, rim light 3D |
| **Hejo** | Kemakmuran, kesegaran Priangan | `#008000` | Aksen sekunder, elemen daun, produk organik |
| **Paul** | Kedalaman spiritual, langit mendung | `#0000FF` | Gradien latar WebGL, dasar Mega Mendung |
| **Hawuk** | Keseimbangan, tanah abu vulkanik | `#808080` | Batas UI, teks sekunder, bayangan material |
| (opsional) **Hideung** | Awal mula, kegelapan kosmis | `#000000` | Outline, badge teks |
| (opsional) **Kopi** | Tanah, kematangan | `#A52A2A` | Aksen kayu, label produk |

**Hex codes untuk 6 warna wajib persis seperti PRD §3.3.** Tambahan `Hideung #000000` dan `Kopi #A52A2A` dipakai terbatas untuk elemen non-semiotic (outline UI, kayu).

### Material PBR (PRD §3.2)

| Material | PBR Roughness | PBR Metalness | Tekstur Peta | Penggunaan |
| :-- | :-- | :-- | :-- | :-- |
| **Dekton matte (batu sintered)** | 0.7 | 0.0 | Diffuse + Normal | Kartu informasi 2D, frame info |
| **Kayu Sonokeling (rosewood)** | 0.5 | 0.0 | Diffuse + Normal | Piringan pedestal 3D, gagang Kujang |
| **Tanah liat (terracotta)** | 0.85 | 0.0 | Diffuse + Bump (halus) | Tombol UI sekunder, elemen dekoratif |
| **Plastik pouch (standar)** | 0.45 | 0.0 | Diffuse + Roughness | Body kemasan Lakar Basah & Kuah |
| **Plastik stiker basah (kilap)** | **0.15–0.25** | 0.0 + clearcoat 0.8 | Diffuse + Roughness + Clearcoat | Area stiker saus Lakar Basah (PRD §2.1) |
| **Mika transparan** | 0.05 | 0.0 | Transmission 0.85, IOR 1.45 | Jendela mika pouch |

### Sistem Pencahayaan "Fajar Priangan" (PRD §3.2)

> "Perpaduan cahaya terarah (*directional light*) keemasan dari timur (meniru fajar dataran tinggi Bandung) dan cahaya ambien (*ambient light*) biru indigo dingin di sisi bayangan."

Implementasi R3F (referensi untuk Fase 2):

```jsx
<Canvas>
  {/* Cahaya utama: Fajar Priangan — keemasan dari timur (+X) */}
  <directionalLight
    position={[10, 8, 5]}     // matahari pagi dari timur, sedikit di atas horizon
    color="#FFB347"           // warm gold (sedikit lebih oranye dari #FFFF00 Koneng, lebih sinematik)
    intensity={1.4}
    castShadow
    shadow-mapSize={[1024, 1024]}
  />
  {/* Cahaya isi: langit biru indigo Bandung di sisi bayangan */}
  <ambientLight color="#3B3273" intensity={0.35} />
  {/* Cahaya pantulan: rim light halus dari belakang (opsional, hanya Lakar Basah) */}
  <directionalLight
    position={[-3, 2, -5]}
    color="#FFFF00"           // Koneng, untuk rim light sesuai PRD §3.3
    intensity={0.5}
  />
  {/* Langit HDRI opsional untuk reflection PBR (jika ada HDR kecil < 200 KB) */}
  <Environment preset="dawn" background={false} />
</Canvas>
```

**Catatan palet:**
- `#FFB347` (slightly desaturated orange) untuk matahari, **bukan** `#FF0000` Beureum atau `#FFFF00` Koneng — lebih natural untuk simulasi sunrise. PRD §3.3 menggunakan `#FFFF00` sebagai "warna dasar stiker kemasan premium" dan "efek pendaran cahaya tepi (*rim light*)" — jadi `#FFFF00` dipakai untuk rim light, bukan matahari langsung.
- `#3B3277` indigo dipilih untuk ambient — alternatif `#4040A0` (lebih netral) bisa dipakai jika kontras terlalu dingin.

### Rekomendasi Konsistensi Render

Untuk konsistensi antara 3D (Lakar Basah & Kuah) dan image sequence (Opak & Lakar Kering):

1. **Render image sequence di Blender dengan HDRI yang sama** — pakai procedural sky shader (Blender Sky Texture) dengan parameter sunrise Bandung: `Sun Elevation: 3°`, `Air Density: 1.0`, `Dust: 0.5`. Atau render dengan HDRI Poly Haven "kiara_dawn" CC0.
2. **Background image sequence** di-keyout (`#FFFFFF` atau `#0000FF`) sehingga parent container CSS bisa memberikan latar belakang sesuai palet (mis. gradient `#FFFFFF` ke `#0000FF`).
3. **Tone mapping** yang sama di Three.js dan Blender: `ACESFilmicToneMapping` dengan `exposure 1.0` — konfirmasi di Fase 2.

---

## Riset Mentah

### Library & Versi (diverifikasi via context7)

| Library | Versi | URL | Catatan |
| :-- | :-- | :-- | :-- |
| `three` (Three.js) | r110+ (latest) | [context7 /mrdoob/three.js](https://context7.com/mrdoob/three.js) | `GLTFLoader`, `DRACOLoader`, `MeshPhysicalMaterial`, `ACESFilmicToneMapping` |
| `@react-three/fiber` | 8.x (latest) | [context7 r3f docs](https://r3f.docs.pmnd.rs/advanced/pitfalls) | `useFrame`, `Canvas`, mutasi langsung ke `meshRef.current` |
| `@react-three/drei` | 9.x (latest) | [context7 /pmndrs/drei](https://context7.com/pmndrs/drei) | `useGLTF`, `useTexture`, `PerformanceMonitor`, `OrbitControls`, `Environment`, `ScrollControls` |
| `gsap` + `ScrollTrigger` | 3.x | (rujukan PRD §5.1) | `frame` snap, `scrub`, `pin` |
| `tailwindcss` | 3.x | (PRD §4.1) | Utilitas warna custom untuk palet Sunda |

### Sumber Web Kunci (diverifikasi via firecrawl)

#### Pipeline 3D & Low-Poly
- [Jonas Sandstedt — How to export and compress a glTF file with Draco 3D using Blender](https://jonassandstedt.se/blog/how-to-export-and-compress-a-gltf-file-with-draco-3d-using-blender/) — Built-in Draco di Blender exporter, `File > Export > glTF 2.0`, ☑ Compression di Geometry.
- [Blippar — WebAR Performance Optimisation: The Complete Developer Guide (2026)](https://www.blippar.com/webar-performance-optimisation-the-complete-developer-guide/) — Hero 10K-50K tris, max 100K scene, texture 1024 mobile default, KTX2/Basis compression.
- [Zakeke — Best practices for maximizing performance in Zakeke's 3D Product Configurator](https://zakeke.zendesk.com/hc/en-us/articles/14682779731356-Best-practices-for-maximizing-performance-in-Zakeke-s-3D-Product-Configurator) — Low-poly < 200K tris, **mobile textures max 512x512**, WebP conversion.
- [donmccurdy/glTF-Transform](https://gltf-transform.dev/) — CLI `gltf-transform optimize` dengan opsi `--texture-compress webp --texture-size 1024` (Fase 2).
- [Three.js Forum — When to use basis texture?](https://discourse.threejs.org/t/when-to-use-basis-texture/29987) — KTX2 Basis Universal untuk GPU-native compression.
- [R3F Performance Pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls) — **"Fast updates are carried out in useFrame by mutation"** — `meshRef.current.position.x += delta`, bukan setState.

#### Pipeline Image Sequence
- [WebRotate 360 — How Many Images Do I Need for a 360 Product View?](https://www.webrotate360.com/blog/2024/how-many-images-do-i-need-for-a-360-product-view.aspx) — 20-80 images per 360, file size < 20 MB, WebP -40% vs JPG, single-row horizontal.
- [Google — An image format for the Web | WebP](https://developers.google.com/speed/webp) — Format & quality reference.
- [Extensions.blender.org — Turntable Camera add-on](https://extensions.blender.org/add-ons/turntable-camera/) — v0.1.2 (Feb 2026, Blender 5.0-ready), parameters: Steps, Hold Frames, Elevation, Distance.
- [Blender Stack Exchange — image format fastest encode](https://blender.stackexchange.com/questions/148231/what-image-format-encodes-the-fastest-or-at-least-faster-png-is-too-slow) — OpenEXR vs PNG trade-off.
- [BlenderArtists — 360 turntable frame count discussion](https://blenderartists.org/t/please-advise-how-many-frames-to-render-a-full-360-turntable-animation-for-3d-model/1269580) — "I always end up rendering 480 for smooth 60 FPS" → untuk 60 FPS playback 480 frame; untuk scroll-driven snap 60 frame cukup.
- [Blender Stack Exchange — 360 turntable Python script](https://blender.stackexchange.com/questions/39718/how-to-make-a-360-video-turntable-of-an-object-using-a-python-script) — Referensi scripting untuk otomasi.

#### SVG Budaya
- [freesvg.org — Kujang (SVG ID 160931, Public Domain)](https://freesvg.org/kujang) — Referensi anatomi; akan di-redraw ulang.
- [Grokipedia — Kujang (weapon)](https://grokipedia.com/page/Kujang_(weapon)) — Anatomi lengkap: bilah melengkung, 1-9 mata hierarkis, pamor, kayu Sonokeling gagang.
- [Vocal Media — Batik Megamendung Pattern](https://vocal.media/art/batik-megamendung-pattern) — "layered cloud patterns, arranged neatly. Each line creates a sense of depth."
- [Andlight News — Sundanese Batik Motifs of West Java](https://purchase.andlight.dk/andlight-news/explore-sundanese-batik-motifs-of-west-java-1767647772) — Konteks budaya Cirebon & Priangan.
- [Vecteezy / Vectorstock — Mega Mendung vectors](https://www.vectorstock.com/royalty-free-vectors/mega-mendung-vectors) — Referensi bentuk (jangan embed langsung).
- [Apache Batik SVG Toolkit](https://xmlgraphics.apache.org/batik/) — Untuk rasterisasi build tool jika perlu.

#### Palet & Budaya Sunda
- [ResearchGate — Sundanese Colors (Maulina & Sabana, 2018)](https://www.researchgate.net/publication/328190095_SUNDANESE_COLORS) — 25 nama warna dasar, Tabel II hex codes eksplisit untuk 10 warna dasar (Bodas #FFFFFF, Beureum #FF0000, Koneng #FFFF00, Hejo #008000, Paul #0000FF, Hawuk #808080, Kopi #A52A2A, Kayas #FFC0CB, Bungur #800080, Hideung #000000).
- [Indonesiamuseum.org — The Sundanese Kujang as Weapon, Emblem, and Cultural Memory](https://indonesiamuseum.org/en/articles/the-sundanese-kujang-as-weapon-emblem-and-cultural-memory) — Konteks pusaka.
- [kadeksatria — Batik Mega Mendung: A Well Known Batik Pattern From Cirebon](https://kadeksatria.wordpress.com/2016/03/14/batik-mega-mendung-a-well-known-batik-pattern-from-cirebon/) — "In Cirebon, Mega Mendung's clouds have two directions, horizontal and vertical. Horizontal symbolized the…"

---

## Rekomendasi untuk Fase 2

**Input yang harus di-deliver oleh Fase 1 (akhir Minggu 2):**

1. **Model 3D final Lakar Basah & Kuah** dalam `.blend` (master) + `.glb` (preview tanpa Draco, untuk inspeksi).
2. **60 frame × 1024×1024 WebP** untuk Opak Klasik, Opak Mini, dan Lakar Kering, di folder `public/images/<product>/000.webp ... 059.webp`.
3. **File SVG** untuk: Mega Mendung (2 varian arah), Kujang siluet (1 varian), Lereng divider (3 varian), Pucuk Rebung (4 varian).
4. **Dokumentasi material** (CSV atau JSON) berisi: nama material, hex color, PBR parameter (roughness, metalness, clearcoat, transmission, ior), path tekstur atlas, dan token semantic (semua warna harus dipetakan ke salah satu dari 6 warna PRD §3.3 jika bersifat semiotik).
5. **Style guide ringkas** (markdown atau Figma link) berisi: palet, font, padding badge, ekspektasi pencahayaan (sketsa 3-posisi), tone mapping preset.

**Input yang harus di-deliver oleh Fase 1 ke Fase 2 sebagai kontrak teknis:**

| Item | Spesifikasi yang harus dipenuhi | Validasi |
| :-- | :-- | :-- |
| GLB Draco Lakar Basah | triangle < 30K, size < 1 MB, material count ≤ 5, 2 atlas 512 px | Cek via [gltf-viewer.donmccurdy.com](https://gltf-viewer.donmccurdy.com/) |
| GLB Draco Lakar Kuah | triangle < 30K, size < 1 MB, material count ≤ 5, 3 atlas 512 px | Sama |
| WebP 60 frame Opak Klasik | total < 12 MB, dimensi 1024×1024, alpha tidak dibutuhkan | `ls -lh public/images/opak-klasik/` |
| WebP 60 frame Lakar Kering | total < 12 MB, dimensi 1024×1024 | Sama |
| SVG Mega Mendung horizontal | 800×200 viewBox, 5 pita awan, gradient Paul→Bodas | Inspect di browser, render harus 60+ FPS scroll |
| SVG Kujang siluet | 200×400 viewBox, 3 lob + 5 mata, fill Hawuk/Hideung | Inspect, harus proporsional 1:2 |
| Badge SVG (3 varian) | 200×60, inline-able, dengan `<title>` a11y | Lighthouse a11y ≥ 95 |

**Risiko lintas fase yang harus dimonitor:**

- **Akurasi pencahayaan** — jika render image sequence di Blender tidak menggunakan "Fajar Priangan" yang persis sama dengan R3F shader di Fase 2, produk akan terlihat seperti milik dua brand berbeda. Solusi: gunakan HDRI `kiara_dawn` Poly Haven atau render procedural sky dengan parameter sunrise.
- **Triangle budget meledak** — jika modeler tidak disiplin dengan decimate, GLB bisa > 5 MB. Solusi: adopsi hard limit 30K tris per model di scope dokumen dan review di akhir minggu.
- **WebP encoding lambat** — render 60 frame PNG lalu konversi ke WebP di build pipeline akan menambah waktu build 10–30 menit. Solusi: batch parallel `cwebp` via GNU parallel atau render langsung ke WebP (Blender 4.x sudah mendukung).
- **SVG yang terlalu detail** — menggambar ulang Mega Mendung dengan 7 lapis awan dan gradien kompleks akan menggandakan ukuran file. Solusi: maks 5 lapis untuk inline, gunakan CSS gradient untuk warna.

---

**Dokumen ini adalah sumber kebenaran teknis untuk semua keputusan Fase 1. Jika ada konflik dengan PRD, PRD yang menang. Jika ada konflik dengan library docs, library docs yang menang (versi baru). Update terakhir: 3 Juli 2026.**
