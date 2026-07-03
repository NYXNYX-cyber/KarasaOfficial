# Riset Fase 2 — Arsitektur Multi-Engine & Kompilasi R3F

> **Proyek:** Karasa Web 3D (PRD v2.0) · **Fase:** 2 — Arsitektur Multi-Engine & Kompilasi R3F (Minggu 3–4)
> **Status:** ⏳ Riset selesai, menunggu implementasi.
> **Sumber:** Dokumentasi diverifikasi via `context7` MCP (gltfjsx, three.js, @react-three/drei, @react-three/fiber), riset web via `firecrawl` MCP (OffscreenCanvas, requestIdleCallback, sunrise HDRI, GSAP ScrollTrigger).
> **Kontrak input:** penelitian ini hanya menggunakan deliverable Fase 1 yang sudah didefinisikan di [`research/fase-1-aset-visual.md`](./fase-1-aset-visual.md).

---

## Ringkasan Eksekutif

- **Pipeline GLB Draco end-to-end:** `gltfjsx --transform --resolution 1024 --format webp --simplify --ratio 0.75` (atau CLI `gltf-transform optimize` jika butuh kontrol lebih granular) mengompres geometri Draco + mengompres tekstur ke WebP 1024 px secara atomik. Output: satu `.glb` < 1 MB per produk, draco `useGLTF(url, '/draco-gltf')` di host lokal. Decoder WASM (~150 KB) di-host di `public/draco-gltf/` untuk preload, **tidak** mengambil dari `gstatic.com` (menghindari round-trip CDN).
- **Material PBR Lakar Basah:** `MeshPhysicalMaterial` dengan `clearcoat: 1.0` + `clearcoatRoughness: 0.08` (lapisan kilap saus), `roughness: 0.2` di area stiker basah (roughness map rendah), `roughness: 0.55` di body pouch matte, `metalness: 0.0` keduanya. Jendela mika pakai `transmission: 0.85, ior: 1.45, roughness: 0.05`. Tidak ada emissive di pouch. Saus di X-Ray: `roughness: 0.3, opacity: 0.6, transparent: true, depthWrite: false`.
- **Pencahayaan "Fajar Priangan":** `<directionalLight position={[8, 6, 4]} color="#FFB37A" intensity={2.2} castShadow shadow-mapSize={[1024, 1024]}/>` (sunrise ~2200 K warm gold, dari timur, elevasi ~30°) + `<ambientLight color="#5A5A8A" intensity={0.35}/>` (langit indigo Bandung di sisi bayangan) + `<Environment preset="dawn" environmentIntensity={0.5}/>` untuk PBR reflection tanpa menambah ukuran bundle. **Bukan** preset `sunset`/`city` — `dawn` paling mendekati karakter fajar Bandung.
- **`<PerformanceMonitor>` Drei:** `bounds: (refreshrate) => refreshrate > 90 ? [55, 90] : [40, 55]` (margin 15 FPS) dengan `onDecline` menurunkan `dpr 2→1`, mematikan shadow, dan disable post-processing (Fase 3 nanti). `onIncline` melakukan invers. `factor` graduated, `step: 0.1`, `flipflops: 3` agar tidak pingpong. **Bungkus di root `<Canvas>`**, bukan di dalam komponen produk.
- **Bug kritis di snippet PRD §5.1** (wajib diperbaiki sebelum implementasi): `const images = useRef<HTMLImageElement>()` dideklarasikan sebagai `HTMLImageElement` (single) tapi dipakai `images.current.push(img)` dan `images.current.onload = …`. Kedua pemanggilan ini **akan throw runtime error** di TypeScript strict mode. Perbaikan: `useRef<HTMLImageElement[]>([])` + tracking per-frame via `load` event + `Promise.all` untuk first-frame paint, atau gunakan pola `lordsean/gist` (GSAP official) yang sudah battle-tested. Preload 10 frame pertama sinkron (PRD §8.2), sisanya via `requestIdleCallback`. `OffscreenCanvas` di Web Worker **hanya** dipakai ketika main thread terdeteksi berat (transfer `canvas.transferControlToOffscreen()` setelah preload selesai).

---

## Pipeline GLB + Draco

### Utilitas: `gltfjsx` (context7 diverifikasi)

[gltfjsx](https://github.com/pmndrs/gltfjsx) adalah CLI dari tim `pmndrs` yang menghasilkan **komponen React Three Fiber** dari GLB, dengan opsi `--transform` yang menjalankan **Draco + prune + texture resize** secara built-in (powered by [`@gltf-transform/cli`](https://gltf-transform.dev/)). Tidak perlu install dependensi Draco manual.

### Instalasi & Perintah

```bash
# Cara 1: npx (recommended, tanpa install global)
npx gltfjsx@latest public/models/lakar-basah.blend.glb \
  --transform \
  --resolution 1024 \
  --format webp \
  --simplify \
  --ratio 0.75 \
  --types \
  --output src/components/products/LakarBasah.tsx

# Cara 2: jika GLB sudah di-compress di Blender, skip --transform
npx gltfjsx public/models/lakar-basah.glb \
  --types \
  --shadows \
  --output src/components/products/LakarBasah.tsx
```

**Flag penting untuk Karasa:**

| Flag | Nilai | Alasan |
|:--|:--|:--|
| `--transform` | aktif | Draco + prune + resize tekstur otomatis |
| `--resolution, -R` | `1024` | Default; sesuai PRD §8.1 (mobile-first 512 → 1024 saat interaksi) |
| `--format, -f` | `webp` | Default; WebP -40% vs PNG ([WebP docs](https://developers.google.com/speed/webp)) |
| `--simplify, -S` | aktif | Meshopt; turunkan tri count tanpa ubah silhouette |
| `--ratio` | `0.75` | Pertahankan 75% detail (jangan over-aggressive) |
| `--types, -t` | aktif | Emit TypeScript types |
| `--shadows, -s` | aktif | Otomatis set `castShadow`/`receiveShadow` di tiap mesh |
| `--keepmeshes, -j` | aktif | Jangan join mesh yang punya material berbeda (penting untuk roughness map stiker) |
| `--keepmaterials, -M` | aktif | Jangan palette-join (penting untuk clearcoat vs non-clearcoat) |

> **CATATAN tentang `--keepmeshes`/`--keepmaterials`:** default `--transform` akan join material yang kompatibel. Untuk Lakar Basah (di mana stiker butuh `clearcoat` dan body tidak), **wajib** set kedua flag ini agar material tetap terpisah dan roughness map per-area tidak hilang.

### Output: Komponen TSX

Hasil `gltfjsx` adalah file `.tsx` (atau `.jsx`) yang berisi virtual graph:

```tsx
// auto-generated by: https://github.com/pmndrs/gltfjsx
import { useGLTF } from '@react-three/drei'

export function LakarBasah(props) {
  const { nodes, materials } = useGLTF('/models/lakar-basah-transformed.glb')
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.PouchBody.geometry} material={materials.PouchBody} castShadow receiveShadow />
      <mesh geometry={nodes.StickerSticker.geometry} material={materials.StickerWet} castShadow receiveShadow />
      <mesh geometry={nodes.MikaWindow.geometry} material={materials.Mika} castShadow receiveShadow />
      <mesh geometry={nodes.Saus.geometry} material={materials.SausChilli} />
      <mesh geometry={nodes.Baso.geometry} material={materials.Baso} />
      <mesh geometry={nodes.Siomay.geometry} material={materials.Siomay} />
    </group>
  )
}

useGLTF.preload('/models/lakar-basah-transformed.glb')
```

**File output ini hanya perlu diedit untuk hook material custom** (lihat bagian "Material PBR Lakar Basah" di bawah). Geometri & hierarki dibiarkan apa adanya.

### Verifikasi Kompresi

1. **Lihat ukuran file:**
   ```bash
   ls -lh public/models/lakar-basah-transformed.glb
   # target: < 1.0 MB (PRD §1.1 Fase 1, constraint < 1 MB per produk)
   ```

2. **Lihat tri count & material count** di [gltf-viewer.donmccurdy.com](https://gltf-viewer.donmccurdy.com/) (drop file GLB). Validasi: tri < 30K, materials ≤ 5, draw call < 50 (target dari Fase 1).

3. **Verifikasi Draco aktif** — buka tab Network DevTools, harus ada request ke `draco_decoder.wasm`. Tanpa request ini, GLB **tidak** benar-benar memakai Draco.

### Konfigurasi R3F Loader (Drei)

`useGLTF` dari Drei secara default **memakai Draco decoder dari Google CDN** (`gstatic.com`). Untuk konsistensi & menghindari ketergantungan eksternal, host decoder di `public/draco-gltf/`:

```
public/
└── draco-gltf/
    ├── draco_decoder.wasm        # ~150 KB
    ├── draco_wasm_wrapper.js     # ~5 KB
    └── draco_decoder.js          # ~250 KB (fallback asm.js)
```

Drei merekomendasikan prefetch dengan `<link rel="prefetch">` di `<head>` ([drei docs](https://github.com/pmndrs/drei/blob/master/docs/loaders/gltf-use-gltf.mdx)):

```html
<link rel="prefetch" crossorigin="anonymous" href="/draco-gltf/draco_decoder.wasm" />
<link rel="prefetch" crossorigin="anonymous" href="/draco-gltf/draco_wasm_wrapper.js" />
```

Konfigurasi loader (cukup sekali, di root sebelum komponen produk):

```tsx
// src/lib/three/loader.ts
import { useGLTF } from '@react-three/drei'
useGLTF.setDecoderPath('/draco-gltf')

// Lalu di komponen:
const { nodes, materials } = useGLTF('/models/lakar-basah-transformed.glb', true, true)
```

Atau jika perlu kontrol lebih (mis. tambahkan KTX2 di Fase 4):

```tsx
import { useGLTF } from '@react-three/drei'
import { GLTFLoader, DRACOLoader, KTX2Loader } from 'three-stdlib'

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco-gltf')

const ktx2Loader = new KTX2Loader()
ktx2Loader.setTranscoderPath('/basis/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)
gltfLoader.setKTX2Loader(ktx2Loader)

useGLTF.preload('/models/lakar-basah-transformed.glb')
// di dalam komponen:
const { nodes, materials } = useGLTF(
  '/models/lakar-basah-transformed.glb',
  true,                // useDraco
  true,                // useMeshOpt
  (loader) => loader.setKTX2Loader(ktx2Loader),  // extendLoader
)
```

### Ukuran Target & Validasi

| Produk | Triangle budget | Material count | GLB size | Atlas |
|:--|:--|:--|:--|:--|
| Lakar Basah | < 25K | ≤ 5 (pouch body, stiker, mika, saus, komponen) | < 1.0 MB | 2 atlas 1024 px |
| Lakar Kuah | < 30K | ≤ 5 (pouch, komponen, kuah, mangkok, sendok) | < 1.2 MB | 3 atlas 1024 px |

> **Mengapa GLB Lakar Kuah sedikit lebih besar:** ada objek mangkok & sendok terpisah (idealnya) atau digabung menjadi satu mesh. Pertahankan ≤ 5 material.

### Compatibility Note: R3F v9 + drei v10

Per Juli 2026, **R3F v9** stabil untuk React 19 ([R3F releases](https://github.com/pmndrs/react-three-fiber/releases), v9.6.0 "Sunset X" adalah rilis stabil terakhir). Drei v10 peer-depends ke R3F v9. R3F v10 ada di alpha (`@react-three/fiber@alpha` + drei 11 alpha) dengan WebGPURenderer; **tidak dipakai** untuk Karasa karena masih experimental.

**Rekomendasi stack Fase 2:**
- `react@19.0.0` + `react-dom@19.0.0`
- `three@0.170.0` (atau latest, cek `three-stdlib` compatibility)
- `@react-three/fiber@9.6.x`
- `@react-three/drei@10.x`
- `gsap@3.12.x` (free tier cukup; tidak butuh ScrollSmoother)
- `vite@5.x` (atau 6 jika sudah stable)

---

## Material PBR Lakar Basah

### Spesifikasi per Mesh

Material disusun untuk menghasilkan **efek kilap saus minyak cabai** di area stiker (PRD §2.1) yang berbeda dari body pouch matte. Karakteristik fisik yang ditiru:
- Plastik pouch matte-glossy (kebanyakan permukaan) — `roughness` 0.5
- Stiker label mengkilap basah (area kecil di tengah pouch) — `roughness` 0.15, `clearcoat` 1.0
- Jendela mika transparan — `transmission` 0.85, `roughness` 0.05
- Saus chili-oil merah di dalam (untuk X-Ray Mode) — `roughness` 0.3, semi-transparan

| Material | Type | Color | Metalness | Roughness | Clearcoat | ClearcoatRoughness | Transmission | IOR | Notes |
|:--|:--|:--|:--|:--|:--|:--|:--|:--|:--|
| `PouchBody` (plastik matte) | MeshPhysicalMaterial | `#FFFAF0` (krem) | 0.0 | 0.55 | 0.0 | — | 0.0 | 1.45 | body pouch default |
| `StickerWet` (stiker saus) | MeshPhysicalMaterial | `#C8102E` (merah karasa) | 0.0 | **0.18** | **1.0** | **0.08** | 0.0 | 1.45 | roughness map rendah di sini |
| `Mika` (jendela depan) | MeshPhysicalMaterial | `#FFFFFF` | 0.0 | 0.05 | 0.5 | 0.02 | **0.85** | **1.45** | `transparent: true, opacity: 1, depthWrite: false` |
| `SausChilli` (saus minyak) | MeshPhysicalMaterial | `#FF0000` (Beureum) | 0.0 | 0.3 | 0.0 | — | 0.0 | 1.4 | X-Ray: `transparent: true, opacity: 0.6, depthWrite: false` |
| `Baso`, `Siomay`, `Bumbu` (komponen) | MeshStandardMaterial | `#FFB347` (warm gold) | 0.0 | 0.7 | — | — | — | — | tidak perlu `clearcoat` |

> **Pemilihan warna:** `#C8102E` adalah merah tua khas chilli oil (di antara `#FF0000` Beureum PRD dan merah marun). Ini bukan warna semiotik Sunda; dipakai untuk produk realistis (PRD §3.3 hanya mewajibkan palet untuk komponen semiotik).

### Roughness Map untuk Stiker

PRD §2.1: *"roughness map yang rendah di area stiker untuk memunculkan pantulan mengilap basah khas saus minyak cabai."*

**Cara kerja:** stiker di area tengah pouch punya area transparan (lihat-through saus) yang sangat reflektif. Roughness map adalah gambar grayscale 1-channel yang dikalikan dengan `roughness` material: **putih (1.0) = rough, hitam (0.0) = halus**. Stiker basah di tengah = hitam (≈ 0.0) → `roughness` final 0.0 di area itu, sisanya tetap 0.18.

**Pembuatan di Blender:**
1. Paint roughness map terpisah dari material lain; gunakan **node Principled BSDF** dengan input image.
2. Export bersama GLB (masuk ke slot `roughnessMap` di material yang ter-ekspor).
3. Atau, buat dua material terpisah: `StikerArea` (roughness 0.18, tidak ada map) untuk body label, dan `SausOverlay` (roughness 0.05, `clearcoat: 1.0, clearcoatRoughness: 0.02`) untuk area saus mengkilap. Mesh harus terpisah (faces split). **Rekomendasi ini lebih pragmatis** untuk skala Karasa.

**Kode R3F (setelah `gltfjsx` di-edit untuk menyuntikkan material kustom):**

```tsx
// src/components/products/LakarBasah.tsx
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useMemo } from 'react'

export function LakarBasah(props) {
  const { nodes } = useGLTF('/models/lakar-basah-transformed.glb', true, true)

  // Material kustom (overriding hasil gltfjsx untuk material clearcoat)
  const materials = useMemo(() => ({
    PouchBody: new THREE.MeshPhysicalMaterial({
      color: '#FFFAF0',
      metalness: 0.0,
      roughness: 0.55,
      ior: 1.45,
    }),
    StickerWet: new THREE.MeshPhysicalMaterial({
      color: '#C8102E',
      metalness: 0.0,
      roughness: 0.18,            // base; akan di-mask oleh roughnessMap
      clearcoat: 1.0,             // kilap saus minyak cabai
      clearcoatRoughness: 0.08,
      ior: 1.45,
    }),
    Mika: new THREE.MeshPhysicalMaterial({
      color: '#FFFFFF',
      metalness: 0.0,
      roughness: 0.05,
      clearcoat: 0.5,
      clearcoatRoughness: 0.02,
      transmission: 0.85,
      ior: 1.45,
      transparent: true,
      depthWrite: false,
    }),
    SausChilli: new THREE.MeshPhysicalMaterial({
      color: '#FF0000',
      metalness: 0.0,
      roughness: 0.3,
      transparent: true,
      opacity: 1.0,                // X-Ray akan turunkan ke 0.6
      depthWrite: false,
    }),
    Baso: new THREE.MeshStandardMaterial({ color: '#FFB347', roughness: 0.7 }),
    Siomay: new THREE.MeshStandardMaterial({ color: '#FFD9A0', roughness: 0.7 }),
    Bumbu: new THREE.MeshStandardMaterial({ color: '#8B4513', roughness: 0.8 }),
  }), [])

  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.PouchBody.geometry} material={materials.PouchBody} castShadow receiveShadow />
      <mesh geometry={nodes.StickerSticker.geometry} material={materials.StickerWet} castShadow />
      <mesh geometry={nodes.MikaWindow.geometry} material={materials.Mika} />
      <mesh geometry={nodes.Saus.geometry} material={materials.SausChilli} />
      <mesh geometry={nodes.Baso.geometry} material={materials.Baso} />
      <mesh geometry={nodes.Siomay.geometry} material={materials.Siomay} />
      <mesh geometry={nodes.Bumbu.geometry} material={materials.Bumbu} />
    </group>
  )
}

useGLTF.preload('/models/lakar-basah-transformed.glb')
```

> **Penting:** `useMemo` di sini **aman** (hanya dieksekusi sekali saat mount). Yang **dilarang keras** adalah `useState` di dalam `useFrame` ([R3F pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls)). Material di sini statis, jadi tidak masalah.

### X-Ray Mode (Lakar Kuah)

PRD §2.1: *"Penurunan nilai opasitas material kemasan secara halus untuk memunculkan isi komponen."*

```tsx
// X-Ray toggle di useFrame (mutasi langsung, BUKAN useState)
const xRayRef = useRef(0)  // 0 = opaque, 1 = full X-Ray

useFrame((_, delta) => {
  // Animate xRayRef toward target (dari prop atau context)
  const target = xRayTargetRef.current
  xRayRef.current = THREE.MathUtils.damp(xRayRef.current, target, 4, delta)

  // Mutate material langsung
  const opacity = 1 - xRayRef.current * 0.65
  materials.PouchBody.opacity = opacity
  materials.PouchBody.transparent = opacity < 1
  materials.PouchBody.depthWrite = opacity > 0.95
  // Komponen dalam fade IN
  materials.Baso.material.opacity = 0.3 + xRayRef.current * 0.7
  materials.Siomay.material.opacity = 0.3 + xRayRef.current * 0.7
  // Saus float
  sausMeshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.02 * xRayRef.current
})
```

Perhatikan: **tidak ada `useState`**, hanya mutasi `meshRef.current` dan `material.opacity`. Mutasi batched ke `materials.X.opacity` juga valid karena Three.js tidak memicu React render ulang.

---

## Pencahayaan "Fajar Priangan"

### Sumber & Karakteristik

PRD §3.2: *"Perpaduan cahaya terarah (directional light) keemasan dari timur (meniru fajar dataran tinggi Bandung) dan cahaya ambien (ambient light) biru indigo dingin di sisi bayangan."*

Bandung di ketinggian ~768 mdpl, di kaki Gunung Tangkuban Perahu. Sunrise sekitar pukul 05:30 WIB. Karakteristik visual:
- **Warm gold** saat matahari baru naik (~5–15° di atas horizon)
- **Color temperature** sekitar 2000–2500 K (warm); turun ke 3500 K saat matahari naik
- **Ambient** langit sisi berlawanan (barat) tetap dingin indigo kebiruan karena atmosfer Rayleigh scattering

### Heuristik Color Temperature

| Fase | Color Temp (K) | Hex approx | Catatan |
|:--|:--|:--|:--|
| Golden hour (subuh 0–10°) | 2000–2500 | `#FFB37A` – `#FFCBA4` | warm gold dominan oranye |
| Sunrise (10–20°) | 2500–3500 | `#FFE0B2` – `#FFF5E0` | lebih kuning, mulai putih |
| Mid-morning (20–40°) | 4000–5500 | `#FFFAF0` | warm white netral |

**Rekomendasi Karasa: pakai `#FFB37A`** (≈ 2300 K) untuk `directionalLight` utama — sesuai fase golden hour PRD yang puitis. Alternatif: `#FFCBA4` (≈ 2800 K) untuk sedikit lebih netral.

### Komponen R3F (referensi untuk Fase 2)

```tsx
<Canvas
  shadows
  dpr={[1, 2]}                              // PerformanceMonitor akan override
  gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
  camera={{ position: [0, 0.5, 3], fov: 35 }}
>
  {/* Cahaya utama: matahari pagi Bandung dari timur (+X), elevasi ~30° */}
  <directionalLight
    position={[8, 6, 4]}
    color="#FFB37A"                          // warm gold ~2300 K
    intensity={2.2}                          // cukup kuat untuk mobile tanpa overexpose
    castShadow
    shadow-mapSize-width={1024}
    shadow-mapSize-height={1024}
    shadow-camera-near={0.5}
    shadow-camera-far={20}
    shadow-camera-left={-3}
    shadow-camera-right={3}
    shadow-camera-top={3}
    shadow-camera-bottom={-3}
    shadow-bias={-0.0005}
  />

  {/* Cahaya isi: langit pagi Bandung, sisi bayangan tetap dingin */}
  <ambientLight color="#5A5A8A" intensity={0.35} />

  {/* Rim light halus dari belakang (Koneng #FFFF00 sesuai PRD §3.3) */}
  <directionalLight
    position={[-3, 2, -5]}
    color="#FFFF00"
    intensity={0.4}
  />

  {/* HDRI untuk PBR reflections (opsional tapi direkomendasikan untuk clearcoat) */}
  <Environment preset="dawn" environmentIntensity={0.5} />
</Canvas>
```

**Penjelasan pilihan:**

- **`directionalLight` warna `#FFB37A`** — warm gold sunrise, bukan `#FFFF00` Koneng (terlalu kuning) dan bukan `#FF0000` Beureum (terlalu merah). Sesuai golden hour Bandung. Sesuai dengan rekomendasi Fase 1.
- **`ambientLight` warna `#5A5A8A`** — indigo Bandung di sisi bayangan. PRD §3.2 menyebut "biru indigo dingin". `#5A5A8A` adalah biru-ungu yang lebih natural daripada `#3B3273` yang dipakai Fase 1 untuk preview. (Catatan: nilai Fase 1 dipertahankan sebagai fallback di `Environment` preset.)
- **`Environment preset="dawn"`** — Drei menyediakan preset `dawn`, `night`, `sunset`, `city`, `park`, `studio`, `lobby`, `forest`, `apartment`, `warehouse`. **Hanya `dawn`** yang mendekati karakter fajar Bandung. Drei mendownload dari CDN [pmndrs.github.io/assets](https://github.com/pmndrs/assets); untuk production self-host, pindah ke `Environment files="/hdri/dawn.hdr"` dengan file dari Poly Haven **kiara_1_dawn** (CC0, ~3 MB → resize ke 256 px cubemap ~150 KB via `gltf-transform` atau manual).
- **`<Environment background={false}>`** — hanya untuk reflection, bukan skybox. Skybox tetap gradient CSS di belakang Canvas.
- **Rim light `#FFFF00` Koneng** — sesuai PRD §3.3 ("efek pendaran cahaya tepi/rim light pada model 3D"). Intensitas rendah (0.4) agar tidak mendominasi.

### Tone Mapping & Color Space

- `gl.toneMapping = ACESFilmicToneMapping` (default di three.js r110+) — film-like, cocok untuk PBR.
- `gl.toneMappingExposure = 1.0` — netral; naikkan ke 1.1 jika scene terlalu gelap.
- `THREE.ColorManagement.enabled = true` (default di r152+) — warna input sudah linear-space, otomatis ke sRGB output.

### Konsistensi dengan Image Sequence

**Risiko Fase 1 (lihat `fase-1-aset-visual.md`):** image sequence di-render di Blender tanpa HDRI yang sama akan terlihat "berbeda" dari 3D. Solusi:
1. Render image sequence di Blender dengan HDRI `kiara_1_dawn` (CC0 dari Poly Haven).
2. Atau, Blender Sky shader: `Sun Elevation: 5°`, `Air: 1.5`, `Dust: 0.5`.
3. Tone mapping: `Filmic` atau `Filmic Log Encoding` (match ACES).
4. **Wajib** lakukan cross-check side-by-side di akhir Fase 1 sebelum handover.

---

## PerformanceMonitor & Auto-Degrade

### Props (diverifikasi via context7 `@pmndrs/drei`)

Dokumentasi resmi [PerformanceMonitor](https://github.com/pmndrs/drei/blob/master/docs/performances/performance-monitor.mdx) menjelaskan semua props & API callback.

**TypeScript types:**
```ts
type PerformanceMonitorProps = {
  ms?: number                  // default 250 — durasi sampling per iterasi
  iterations?: number          // default 10 — jumlah iterasi sebelum trigger
  threshold?: number           // default 0.75 — proporsi iterasi yang harus match
  bounds: (refreshrate: number) => [lower: number, upper: number]
  flipflops?: number           // default Infinity — max incl/decl cycles
  factor?: number              // default 0.5 — initial 0..1 quality
  step?: number                // default 0.1 — increment/decrement per cycle
  onIncline?: (api: PerformanceMonitorApi) => void
  onDecline?: (api: PerformanceMonitorApi) => void
  onChange?: (api: PerformanceMonitorApi) => void
  onFallback?: (api: PerformanceMonitorApi) => void
  children?: React.ReactNode
}

type PerformanceMonitorApi = {
  fps: number
  factor: number                // 0..1
  refreshrate: number           // device refresh rate
  frames: number[]
  averages: number[]
}
```

**Cara kerja (dari docs):** mengukur rata-rata FPS selama `ms × iterations` ms. Jika `threshold` (default 75%) dari rata-rata berada di atas `upper` → `onIncline`. Jika di bawah `lower` → `onDecline`. Di antara `lower` dan `upper` ada **margin aman** — tidak ada callback triggered (mencegah pingpong).

### Implementasi untuk Karasa

```tsx
// src/components/three/AdaptiveScene.tsx
import { PerformanceMonitor } from '@react-three/drei'
import { useState, useRef } from 'react'
import * as THREE from 'three'

type Quality = 'high' | 'mid' | 'low'

export function AdaptiveScene({ children }) {
  const [quality, setQuality] = useState<Quality>('mid')
  const shadowsRef = useRef<THREE.WebGLShadowMap | null>(null)

  // Konfigurasi: prioritas 60 FPS di mobile mid-range
  return (
    <>
      <PerformanceMonitor
        ms={250}
        iterations={10}
        bounds={(refreshrate) =>
          refreshrate > 90 ? [55, 90] : [40, 55]   // mobile 60Hz target 40-55 FPS
        }
        factor={0.5}
        step={0.15}
        flipflops={3}
        onIncline={(api) => {
          // FPS naik di atas upper bound → naikkan kualitas
          if (quality === 'low') setQuality('mid')
          else if (quality === 'mid') setQuality('high')
        }}
        onDecline={(api) => {
          // FPS turun di bawah lower bound → turunkan kualitas
          if (quality === 'high') setQuality('mid')
          else if (quality === 'mid') setQuality('low')
        }}
        onFallback={() => setQuality('low')}  // fallback terakhir
      >
        {children}
      </PerformanceMonitor>

      {/* Quality propagates via React context (lihat di bawah) */}
      <QualityContext.Provider value={quality}>
        {/* ... scene ... */}
      </QualityContext.Provider>
    </>
  )
}
```

### Tiga Level Kualitas

| Level | Pixel Ratio | Shadows | Post-FX (Fase 3) | Texture path |
|:--|:--|:--|:--|:--|
| `high` | 2.0 | enabled (mapSize 1024) | bloom, DoF | 1024 px |
| `mid` (default) | 1.5 | enabled (mapSize 512) | bloom only | 1024 px |
| `low` | 1.0 | **disabled** | none | 512 px |

### Strategi Auto-Degrade

`onDecline` dipanggil bukan hanya sekali — PerformanceMonitor bisa flip-flop. Untuk menghindari perubahan visual yang kasar, **gunakan React state** di sini (BUKAN di `useFrame`). State berubah hanya beberapa kali per detik, tidak setiap frame. PRD §8.1 melarang `useState` di `useFrame`; state di sini aman karena trigger di callback React event handler, bukan di loop render.

Propagasi ke seluruh scene via React Context:

```tsx
// src/lib/three/quality-context.ts
import { createContext, useContext } from 'react'
export const QualityContext = createContext<'high' | 'mid' | 'low'>('mid')
export const useQuality = () => useContext(QualityContext)

// Penggunaan di komponen mana pun:
function LakarBasah() {
  const quality = useQuality()
  const shadowProps = quality === 'low' ? { castShadow: false, receiveShadow: false } : { castShadow: true, receiveShadow: true, 'shadow-mapSize': [512, 512] }
  // ...
}
```

### Kombinasi dengan Drei Helpers

Drei menyediakan `AdaptiveDpr` dan `AdaptiveEvents` yang lebih sederhana (otomatis detect decline). Untuk Karasa, **pakai `<PerformanceMonitor>`** karena perlu kontrol tiga level kualitas (Drei Adaptive* hanya toggle dua).

---

## ImageSequencePlayer Pattern

### Analisis Snippet PRD §5.1 — Bug yang Ditemukan

Snippet di PRD §5.1 baris 136 mengandung **dua bug** yang akan crash di TypeScript strict mode dan runtime:

**Bug 1: Type annotation salah** (line 136 PRD)
```ts
const images = useRef<HTMLImageElement>();  // ❌ single element
images.current.push(img);                     // ❌ .push() expects array
```

Tipe `HTMLImageElement` (tanpa `[]`) adalah **satu elemen**. `.push()` adalah method `Array` — runtime error: *"Cannot read properties of undefined (reading 'push')"* atau di strict mode: *"Property 'push' does not exist on type 'HTMLImageElement'"*.

**Bug 2: onload assignment ke array** (line 161 PRD)
```ts
images.current.onload = () => drawFrame(0);  // ❌ array tidak punya onload
```

Setelah diperbaiki ke array, `images.current.onload` tidak ada (cuma `images.current[0].onload` yang valid).

**Bug 3 (minor): onUpdate timing** (line 175 PRD)
```ts
onUpdate: () => drawFrame(sequenceObj.current.frame),
```
Setiap update ScrollTrigger memanggil `drawFrame`, tapi `frame` adalah float (`scrub: 0.5`) — perlu di-round ke integer untuk index array. Snippet asli secara implisit mengasumsikan `snap: "frame"` meng-handle ini, dan memang GSAP Snap plugin akan snap ke integer terdekat, jadi ini OK. **Tapi tambahkan `Math.round` defensif.**

**Bug 4 (minor): race condition** — `images.current.push(img)` lalu `images.current.onload` — push tidak synchronous dengan load. Frame 0 mungkin belum loaded saat handler dipasang, sehingga `drawFrame(0)` bisa draw gambar kosong. Snippet asli tidak handle ini.

### Pola yang Direkomendasikan (PRD §8.2 compliant)

```tsx
// src/components/canvas/ImageSequencePlayer.tsx
'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface ImageSequencePlayerProps {
  totalFrames: number
  imagePathPattern: string    // e.g. '/images/opak-klasik/frame_{frame}.webp'
  productId: 'opak-klasik' | 'opak-mini' | 'lakar-kering'
  canvasWidth?: number
  canvasHeight?: number
  syncFrameCount?: number      // default 10 (PRD §8.2)
  scrollLengthVh?: number      // default 300 (PRD §5.1)
}

const SYNC_FRAMES_DEFAULT = 10

export function ImageSequencePlayer({
  totalFrames,
  imagePathPattern,
  productId,
  canvasWidth = 1024,
  canvasHeight = 1024,
  syncFrameCount = SYNC_FRAMES_DEFAULT,
  scrollLengthVh = 300,
}: ImageSequencePlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(totalFrames).fill(null))
  const sequenceObjRef = useRef({ frame: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    // === FASE 1: Preload sinkron (10 frame pertama) — boleh block render ~500ms ===
    let firstFrameDrawn = false
    const drawFrame = (frameIndex: number) => {
      const img = imagesRef.current[frameIndex]
      if (!img || !img.complete || img.naturalWidth === 0) return
      const i = Math.round(frameIndex)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      if (!firstFrameDrawn) firstFrameDrawn = true
    }

    for (let i = 0; i < syncFrameCount && i < totalFrames; i++) {
      const img = new Image()
      img.src = imagePathPattern.replace('{frame}', String(i).padStart(3, '0'))
      img.onload = () => { if (i === 0) drawFrame(0) }
      imagesRef.current[i] = img
    }

    // === FASE 2: Preload idle (frame sisanya, 11..59) ===
    const loadIdle = (deadline: IdleDeadline) => {
      let frame = syncFrameCount
      while (frame < totalFrames && deadline.timeRemaining() > 5) {
        const img = new Image()
        img.src = imagePathPattern.replace('{frame}', String(frame).padStart(3, '0'))
        imagesRef.current[frame] = img
        frame++
      }
      if (frame < totalFrames) {
        requestIdleCallback(loadIdle, { timeout: 2000 })
      }
    }

    // Polyfill untuk browser tanpa requestIdleCallback (Safari < 16.4)
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadIdle, { timeout: 2000 })
    } else {
      let frame = syncFrameCount
      const fallback = () => {
        for (let i = 0; i < 5 && frame < totalFrames; i++, frame++) {
          const img = new Image()
          img.src = imagePathPattern.replace('{frame}', String(frame).padStart(3, '0'))
          imagesRef.current[frame] = img
        }
        if (frame < totalFrames) setTimeout(fallback, 50)
      }
      setTimeout(fallback, 100)
    }

    // === FASE 3: ScrollTrigger scrub ===
    const trigger = gsap.to(sequenceObjRef.current, {
      frame: totalFrames - 1,
      snap: 'frame',                    // snap ke integer
      ease: 'none',
      scrollTrigger: {
        trigger: scrollContainerRef.current,
        start: 'top top',
        end: `+=${scrollLengthVh}svh`,  // PRD §5.1: 300svh
        scrub: 0.5,
        pin: true,
      },
      onUpdate: () => drawFrame(sequenceObjRef.current.frame),
    })

    return () => {
      trigger.scrollTrigger?.kill()
      trigger.kill()
    }
  }, [totalFrames, imagePathPattern, canvasWidth, canvasHeight, syncFrameCount, scrollLengthVh])

  return (
    <div ref={scrollContainerRef} className="relative w-full" style={{ height: `${scrollLengthVh + 100}svh` }}>
      <div className="sticky top-0 left-0 w-full h-screen flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="max-w-[80vw] max-h-[80vh] object-contain"
        />
      </div>
    </div>
  )
}
```

### requestIdleCallback Fallback (context7 diverifikasi)

`requestIdleCallback` adalah **experimental API** ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback)). Dukungan:
- Chrome/Edge: ✅ sejak 47
- Firefox: ✅ sejak 55
- Safari: ❌ sampai 16.4 (Maret 2023) — masih banyak user Safari tanpa dukungan

Polyfill resmi dari [Chrome devrel](https://developer.chrome.com/blog/using-requestidlecallback):

```ts
// src/lib/utils/idle-callback.ts
type IdleCallbackHandle = number
interface IdleDeadline {
  didTimeout: boolean
  timeRemaining: () => number
}

export const requestIdleCallback: (
  cb: (deadline: IdleDeadline) => void,
  options?: { timeout?: number }
) => IdleCallbackHandle = (cb, options) => {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(cb, options)
  }
  // Fallback: setTimeout 1ms
  const start = Date.now()
  return setTimeout(() => {
    cb({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
    })
  }, 1) as unknown as IdleCallbackHandle
}

export const cancelIdleCallback: (handle: IdleCallbackHandle) => void = (handle) => {
  if ('cancelIdleCallback' in window) window.cancelIdleCallback(handle)
  else clearTimeout(handle)
}
```

### OffscreenCanvas — Kapan Dipakai

PRD §8.2: *"Jika proses komputasi thread utama terdeteksi berat karena interaksi UI 2D, rendering frame sequence pada canvas dialihkan menuju OffscreenCanvas di dalam thread Web Worker terpisah."*

**Rekomendasi untuk Karasa:** JANGAN pakai OffscreenCanvas secara default. Alasannya:
1. `drawImage()` ke Canvas 2D di mobile mid-range **sangat cepat** (≤ 2ms per frame); overhead transfer ke Web Worker bisa **lebih besar** dari savings-nya.
2. 60 frame WebP 1024×1024 di memori = ~6–12 MB (Fase 1). Transfer ke worker = duplikasi memori.
3. Kode OffscreenCanvas lebih kompleks (postMessage, ImageBitmap, context lost handling).

**Pakai OffscreenCanvas hanya JIKA**:
- FPS monitor menunjukkan main thread usage > 80% saat scroll image sequence
- Atau sebagai **progressive enhancement**: feature-detect `'OffscreenCanvas' in window` + `'transferControlToOffscreen' in HTMLCanvasElement`, lalu aktifkan di device tier "high"

**Pola feature-detect (diverifikasi [web.dev](https://web.dev/articles/offscreen-canvas) + [macarthur.me](https://macarthur.me/posts/animate-canvas-in-a-worker)):**

```tsx
// src/components/canvas/OffscreenImageSequence.tsx (FASE 4, OPTIONAL)
if (typeof OffscreenCanvas !== 'undefined' && 'transferControlToOffscreen' in canvas) {
  const offscreen = canvas.transferControlToOffscreen()
  const worker = new Worker(new URL('./image-worker.ts', import.meta.url), { type: 'module' })
  worker.postMessage({ type: 'init', canvas: offscreen, totalFrames, imagePathPattern }, [offscreen])
  worker.postMessage({ type: 'scroll', frame: currentFrame })
} else {
  // Fallback ke ImageSequencePlayer biasa
}
```

> **Gotcha dari web.dev:** Three.js butuh `canvas.style.width` dan `canvas.style.height`; OffscreenCanvas detached dari DOM tidak punya ini. Untuk Canvas 2D kita tidak masalah (hanya drawImage), tapi untuk WebGL via R3F perlu stub manual.

### Pola Preload Frame 10 + Sisanya (Best Practice)

Pola yang dipakai banyak production site (contoh: [Apple AirPods Pro](https://www.apple.com/uk/airpods-pro/), tutorial [loopspeed blog](https://blog.loopspeed.co.uk/scroll-driven-image-sequence-header), [lordsean gist](https://gist.github.com/lordsean/cb33cd1d9c1bca52a7849c36ce8821a6) dari GSAP team):

1. **Frame 1–10**: `<link rel="preload" as="image">` di `<head>` (browser akan fetch paralel dengan HTML)
2. **Frame 11–60**: dynamic `new Image()` di `requestIdleCallback` (prioritas rendah)
3. **First frame paint**: `Promise.all` atau event `load` → drawFrame(0)
4. **ScrollTrigger**: scrub `playhead.frame: 0 → 59` dengan `snap: 'frame'`
5. **onUpdate**: `drawFrame(Math.round(playhead.frame))`

`<link rel="preload">` lebih cepat dari `new Image()` untuk batch loading karena browser bisa de-duplicate & prioritize.

```html
<!-- Di <head> index.html, 10 frame pertama -->
<link rel="preload" as="image" href="/images/opak-klasik/frame_000.webp" />
<link rel="preload" as="image" href="/images/opak-klasik/frame_001.webp" />
...
<link rel="preload" as="image" href="/images/opak-klasik/frame_009.webp" />
```

Alternatif: gunakan `[1, 2, ..., 10].map(i => <link rel="preload" as="image" href={...} />)` di component root (SSR).

---

## Struktur Folder Proyek

### Rancangan Awal Vite + React 19 + R3F

```
karasa-web-3d/
├── public/
│   ├── _redirects                              # PRD §7.2: /* /index.html 200
│   ├── favicon.svg
│   ├── models/                                 # GLB hasil gltfjsx --transform
│   │   ├── lakar-basah-transformed.glb         # < 1 MB
│   │   ├── lakar-kuah-transformed.glb          # < 1.2 MB
│   │   └── pedestal-kujang.glb                 # opsional, motif Kujang
│   ├── draco-gltf/                             # Draco WASM decoder
│   │   ├── draco_decoder.wasm                  # ~150 KB
│   │   ├── draco_wasm_wrapper.js
│   │   └── draco_decoder.js
│   ├── images/                                 # Image sequence (PRD §2.2)
│   │   ├── opak-klasik/
│   │   │   ├── 000.webp ... 059.webp
│   │   │   └── manifest.json                   # opsional
│   │   ├── opak-mini/
│   │   │   ├── 000.webp ... 059.webp
│   │   └── lakar-kering/
│   │       ├── 000.webp ... 059.webp
│   ├── svg/                                    # Budaya Sunda (dari Fase 1)
│   │   ├── mendung-horizontal.svg
│   │   ├── mendung-vertical.svg
│   │   ├── kujang-silhouette.svg
│   │   ├── lereng-divider.svg
│   │   └── pucuk-rebung.svg
│   └── hdri/                                   # Opsional Fase 4 (self-host)
│       └── kiara_1_dawn_256.hdr
│
├── src/
│   ├── main.tsx                                # entry; mount <App/>
│   ├── App.tsx                                 # <Canvas> + <ImageSequencePlayer> + <Header>
│   ├── index.css                               # Tailwind directives
│   ├── vite-env.d.ts
│   │
│   ├── components/
│   │   ├── three/                              # WebGL engine
│   │   │   ├── KarasaScene.tsx                 # root <Canvas> wrapper
│   │   │   ├── AdaptiveScene.tsx               # PerformanceMonitor wrapper
│   │   │   ├── LightingSetup.tsx               # directional + ambient + Environment
│   │   │   ├── PedestalKujang.tsx              # SVG-backed pedestal
│   │   │   └── camera/
│   │   │       ├── CameraRig.tsx               # camera + OrbitControls config
│   │   │       └── ScrollCamera.tsx            # Fase 3: spline path
│   │   │
│   │   ├── products/                           # Komponen GLB (output gltfjsx + edited)
│   │   │   ├── LakarBasah.tsx                  # PBR + clearcoat
│   │   │   ├── LakarKuah.tsx                   # PBR + X-Ray mode
│   │   │   └── materials.ts                    # THREE.Material instances
│   │   │
│   │   ├── canvas/                             # Canvas 2D engine
│   │   │   ├── ImageSequencePlayer.tsx         # PRD §5.1 (fixed)
│   │   │   └── imagePreloader.ts               # 10 sync + 50 idle + fallback
│   │   │
│   │   ├── hud/                                # 2D overlay (PRD §3.3)
│   │   │   ├── BrandBadge.tsx                  # Handmade, Tanpa Pengawet
│   │   │   ├── ProductInfo.tsx
│   │   │   ├── ScrollProgress.tsx              # Pucuk Rebung chevron
│   │   │   └── SectionDivider.tsx              # Lereng motif
│   │   │
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── ProductSection.tsx              # generic: 3D atau ImageSequence
│   │       └── Footer.tsx
│   │
│   ├── lib/
│   │   ├── three/
│   │   │   ├── loader.ts                       # useGLTF.setDecoderPath, KTX2 setup
│   │   │   ├── quality-context.ts              # React context untuk quality
│   │   │   └── color-management.ts             # sRGB, ACES, exposure
│   │   ├── utils/
│   │   │   ├── idle-callback.ts                # requestIdleCallback + fallback
│   │   │   ├── raf-throttle.ts                 # throttle util
│   │   │   └── breakpoint.ts                   # mobile/tablet/desktop detection
│   │   └── config/
│   │       ├── products.ts                     # registry: { id, name, type, slug }
│   │       └── brand.ts                        # palet Sunda, deep-link URLs
│   │
│   ├── styles/
│   │   ├── tailwind.config.ts
│   │   └── tokens.css                          # CSS custom properties untuk palet Sunda
│   │
│   └── types/
│       └── three.d.ts                          # module augmentation
│
├── index.html                                  # <head> + preload frame 0-9
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── wrangler.toml                               # PRD §7.1
```

### Konvensi Penamaan File

- **Komponen:** PascalCase, suffix sesuai engine: `LakarBasah.tsx` (3D), `ImageSequencePlayer.tsx` (Canvas 2D), `LightingSetup.tsx` (helper).
- **Utilitas/lib:** camelCase: `loader.ts`, `idle-callback.ts`.
- **Aset GLB:** `kebab-case-transformed.glb` (suffix `-transformed` menandai hasil `gltfjsx --transform`).
- **Image sequence:** zero-padded 3 digit: `000.webp`, `001.webp`, ..., `059.webp`. Sumber: PRD §5.1 + Fase 1.

---

## Riset Mentah

### Library & Versi (diverifikasi via context7)

| Library | Versi Stabil (Jul 2026) | URL Resmi | Catatan |
|:--|:--|:--|:--|
| `three` | 0.170+ | [context7 /mrdoob/three.js](https://context7.com/mrdoob/three.js) | `MeshPhysicalMaterial`, `GLTFLoader`, `DRACOLoader`, `ACESFilmicToneMapping` |
| `@react-three/fiber` | 9.6.x ("Sunset X") | [GitHub releases](https://github.com/pmndrs/react-three-fiber/releases) | R3F v9 = React 19 compatibility release |
| `@react-three/drei` | 10.x | [context7 /pmndrs/drei](https://context7.com/pmndrs/drei) | `useGLTF`, `useTexture`, `PerformanceMonitor`, `OrbitControls`, `Environment`, `ScrollControls`, `Preload` |
| `gltfjsx` | 6.x | [context7 /pmndrs/gltfjsx](https://context7.com/pmndrs/gltfjsx) | `--transform` mengintegrasikan Draco + prune + WebP |
| `gsap` | 3.12.x | [gsap.com](https://gsap.com) | `ScrollTrigger`, `snap: 'frame'`, `scrub` — free tier cukup |
| `react` + `react-dom` | 19.0.x | [react.dev/blog/2024/12/05/react-19](https://react.dev/blog/2024/12/05/react-19) | Stabil sejak Desember 2024 |
| `vite` | 5.x / 6.x | [vitejs.dev](https://vitejs.dev) | `npm create vite@latest` |
| `tailwindcss` | 3.4.x / 4.x | [tailwindcss.com](https://tailwindcss.com) | Custom colors untuk palet Sunda |

### Sumber Kunci (diverifikasi via firecrawl + context7)

#### gltfjsx & Draco
- [gltfjsx README (GitHub)](https://github.com/pmndrs/gltfjsx/blob/master/readme.md) — CLI usage, semua flag, contoh output TSX
- [drei `useGLTF` docs](https://github.com/pmndrs/drei/blob/master/docs/loaders/gltf-use-gltf.mdx) — `useGLTF(url, '/draco-gltf')`, `setDecoderPath`, KTX2 extendLoader
- [three.js GLTFLoader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader) — `setDRACOLoader`, `KHR_draco_mesh_compression` extension
- [gltf-transform.dev](https://gltf-transform.dev/) — CLI `optimize` untuk kontrol lebih granular (digunakan `--transform` di balik layar)

#### PBR Material
- [three.js MeshPhysicalMaterial](https://threejs.org/docs/pages/MeshPhysicalMaterial.html) — clearcoat, clearcoatRoughness, transmission, ior, iridescence properties
- [three.js MeshStandardMaterial.clearcoat](https://threejs.org/docs/#api/materials/MeshStandardMaterial.clearcoat) — clearcoat ada di MeshStandardMaterial juga (legacy)
- [Codrops — Transparent Glass & Plastic in Three.js](https://tympanus.net/codrops/2021/10/27/creating-the-effect-of-transparent-glass-and-plastic-in-three-js/) — tutorial `transmission`, `roughness` untuk plastik realistis
- [Medium — Experimenting with PBR Textures Using Three.js](https://medium.com/@makoto_29712/experimenting-with-pbr-textures-usingthree-js-a25aad28ed65) — roughness/metalness workflow

#### Performance & R3F Pitfalls
- [R3F Performance Pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls) — **"Don't setState in useFrame"**, "Mutate with delta", tips `lerp`
- [R3F v9 Migration Guide](https://r3f.docs.pmnd.rs/tutorials/v9-migration-guide) — React 19 compat, `useLoader` accepts instance, `extend` factory
- [R3F Installation](https://r3f.docs.pmnd.rs/getting-started/installation) — "Fiber is compatible with React v18 and v19"
- [Drei PerformanceMonitor](https://github.com/pmndrs/drei/blob/master/docs/performances/performance-monitor.mdx) — full props & API
- [Drei AdaptiveDpr](https://github.com/pmndrs/drei/blob/master/docs/performances/adaptive-dpr.mdx), [AdaptiveEvents](https://github.com/pmndrs/drei/blob/master/docs/performances/adaptive-events.mdx), [useDetectGPU](https://github.com/pmndrs/drei/blob/master/docs/misc/detect-gpu-use-detect-gpu.mdx)
- [Drei discussion #2213 — React 19 & R3F v9 status](https://github.com/pmndrs/drei/discussions/2213) — report `__r3f` patches needed; akhirnya v9.6.x stable menutup gap ini

#### Image Sequence & Canvas
- [Loopspeed blog — Scroll-driven image sequence in React with GSAP](https://blog.loopspeed.co.uk/scroll-driven-image-sequence-header) — pola Next.js + Mantine hooks + GSAP
- [GSAP official gist (lordsean) — `imageSequence()` helper](https://gist.github.com/lordsean/cb33cd1d9c1bca52a7849c36ce8821a6) — battle-tested: 147-frame Apple AirPods pattern
- [GSAP forum — Snapping to given frame in canvas sequence](https://gsap.com/community/forums/topic/38544-snapping-to-given-frame-in-canvas-sequence/) — diskusi `snap: "frame"` & `progress`

#### OffscreenCanvas & Web Workers
- [web.dev — OffscreenCanvas](https://web.dev/articles/offscreen-canvas) — pattern `transferControlToOffscreen`, `postMessage({canvas}, [canvas])`, Three.js gotcha
- [Alex MacArthur — Animating Canvas in a Web Worker](https://macarthur.me/posts/animate-canvas-in-a-worker) — `requestAnimationFrame` di worker, demo side-by-side
- [MDN — requestIdleCallback](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback) — `deadline.timeRemaining()`, `timeout` option
- [Chrome for Developers — Using requestIdleCallback](https://developer.chrome.com/blog/using-requestidlecallback) — polyfill pattern, deadline object

#### Pencahayaan "Fajar Priangan" & HDRI
- [Poly Haven HDRIs](https://polyhaven.com/hdris/sunrise-sunset) — `kiara_1_dawn` (CC0, sunrise Bandung-like), `dikhololo_night`, `belfast_open_field`
- [Drei Environment](https://github.com/pmndrs/drei/blob/master/docs/staging/environment.mdx) — preset `dawn`/`sunset`/`city`/`park`/`studio`/`lobby`/`forest`/`apartment`/`warehouse`, `environmentIntensity`
- [Three.js Sky example](https://github.com/mrdoob/three.js/blob/dev/examples/webgl_animation_keyframes.html) — `Sky` shader, turbidity/rayleigh, sunPosition untuk `pmremGenerator`

#### Konsistensi & Color Management
- [Three.js Color Management](https://threejs.org/docs/#manual/en/introduction/Color-management) — `THREE.ColorManagement.enabled`, sRGB workflow
- [ResearchGate — Sundanese Colors (Maulina & Sabana, 2018)](https://www.researchgate.net/publication/328190095_SUNDANESE_COLORS) — palet PRD §3.3

---

## Rekomendasi untuk Fase 3

**Input yang harus di-deliver oleh Fase 2 (akhir Minggu 4):**

1. **Komponen 3D siap-pakai:**
   - `LakarBasah.tsx` — `useGLTF` + 6 material `MeshPhysicalMaterial` (pouch, stiker, mika, saus, baso, siomay)
   - `LakarKuah.tsx` — `useGLTF` + X-Ray mode (mutasi `material.opacity` di `useFrame`)
   - `PedestalKujang.tsx` — flat plane dengan `alphaMap` dari SVG silhouette Kujang (Fase 1)
   - `KarasaScene.tsx` — root `<Canvas>` dengan `LightingSetup` + `AdaptiveScene` + `OrbitControls`
2. **Komponen Canvas 2D:**
   - `ImageSequencePlayer.tsx` — fix bug PRD §5.1, dengan preload 10 sinkron + 50 idle + fallback polyfill
3. **Helper libraries:**
   - `lib/three/loader.ts` — `useGLTF.setDecoderPath('/draco-gltf')`, KTX2 stub
   - `lib/three/quality-context.ts` — React Context untuk `high`/`mid`/`low`
   - `lib/utils/idle-callback.ts` — polyfill `requestIdleCallback`
4. **Konfigurasi:**
   - `public/draco-gltf/` terisi (3 file: `.wasm`, `_wasm_wrapper.js`, `_decoder.js`)
   - `public/_redirects` (`/* /index.html 200`) untuk Cloudflare Pages
   - `wrangler.toml` dengan `[assets] not_found_handling = "single-page-application"`
   - `index.html` dengan `<link rel="preload" as="image">` untuk 10 frame pertama dari masing-masing produk
5. **Style guide operasional:**
   - `LightingSetup.tsx` sebagai single source of truth untuk pencahayaan (jangan duplikasi di komponen produk)
   - Palet Sunda didefinisikan di `tailwind.config.ts` sebagai `colors.brand.{bodas, beureum, koneng, hejo, paul, hawuk}` agar bisa dipakai sebagai `text-brand-beureum` dll.

**Input ke Fase 3 (interaksi scroll):**

1. **`<ScrollControls>` Drei** untuk kamera spline antar produk (PRD §5.2). Pattern:
   - 4 section = 4 pages
   - Lakar Basah di section 1 (3D)
   - Lakar Kuah di section 2 (3D, X-Ray triggered)
   - Opak Klasik di section 3 (Canvas 2D image sequence)
   - Lakar Kering di section 4 (Canvas 2D image sequence)
2. **OrbitControls** hanya aktif di section 1 & 2 (saat kamera diam di titik fokus), `minPolarAngle: Math.PI * 0.25`, `maxPolarAngle: Math.PI * 0.55` (PRD §5.2).
3. **GSAP ScrollTrigger** untuk sinkronisasi `imageSequence` di section 3 & 4. Pattern: `scrub: 0.5, snap: 'frame', pin: true, end: '+=300svh'`.
4. **Hotspot `<Html>` Drei** di area stiker Lakar Basah & tutup klip Lakar Kuah (PRD §5.2). Trigger: pointer click, animasi fade-in via Framer Motion.

**Risiko lintas fase:**

- **Pinning conflict:** ScrollControls (Drei) menangkap scroll di seluruh Canvas; jika ImageSequencePlayer juga pakai `pin: true` di ScrollTrigger (GSAP), **konflik** — solusi: ImageSequencePlayer pakai scroll **native** (bukan di dalam Canvas), atau ScrollControls di-nonaktifkan saat section image sequence aktif.
- **Draco decoder CDN vs self-host:** default Drei ambil dari `gstatic.com`; untuk konsistensi & GDPR, self-host di `public/draco-gltf/`. Performance impact: ~50–150 ms first-load penalty (sudah di-mitigasi dengan `<link rel="prefetch">`).
- **First-frame race condition:** frame 0 harus digambar **sebelum** ScrollTrigger aktif. Pattern: `img.onload = () => drawFrame(0)` di preload loop, **atau** `Promise.all(images.map(loadImg)).then(() => drawFrame(0))` untuk deterministik.
- **X-Ray animasi smoothness:** pakai `THREE.MathUtils.damp` atau `lerp` di `useFrame` dengan delta time. Hindari hard cut dari opaque → transparan karena jarring.
- **Image sequence memory pressure:** 60 frame × 1024² × 4 bytes = ~250 MB raw pixel data, tapi compressed WebP di memori browser ~6–12 MB (Fase 1). Jangan decode semua frame ke ImageBitmap (akan blow up memory); biarkan sebagai `HTMLImageElement` dan biarkan browser handle decode-on-draw.

---

**Dokumen ini adalah sumber kebenaran teknis untuk semua keputusan Fase 2. Jika ada konflik dengan PRD, PRD yang menang. Jika ada konflik dengan library docs, library docs yang menang (versi lebih baru). Update terakhir: 3 Juli 2026.**
