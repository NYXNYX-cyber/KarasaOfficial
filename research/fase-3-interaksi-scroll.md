# Riset Fase 3 — Fitur Interaksi Gulir & Hotspot Data

> Riset & desain untuk **Karasa Web 3D** (Fase 3 / Minggu 5–6). Fokus: transisi kamera 3D antar produk, sinkronisasi gulir dengan image sequence, dan overlay hotspot informasi.
> Sumber kebenaran spesifikasi: [`PRODUCT REQUIREMENT DOCUMENT.md`](../PRODUCT%20REQUIREMENT%20DOCUMENT.md) (PRD v2.0) — §5.1, §5.2, §6.1, §9.3.

---

## Ringkasan Eksekutif

- **`<ScrollControls>` Drei** adalah primitif yang tepat untuk transisi kamera 3D antar produk (Lakar Basah → Lakar Kuah). `useScroll()` mengembalikan `offset` (0–1) yang bisa diumpankan ke `curve.getPointAt()` pada `THREE.CatmullRomCurve3` di dalam `useFrame` — tidak ada hard-cut.
- **`<OrbitControls>` + `<ScrollControls>` saling menggantikan peran**, bukan ditumpuk. Saat scroll aktif (`damping > 0` atau transisi spline), `OrbitControls` perlu di-`enabled={false}`. Setelah kamera "parkir" di titik fokus, `enabled={true}` dikembalikan dan `minPolarAngle` / `maxPolarAngle` mengunci agar tidak menembus pedestal Kujang (PRD §5.2).
- **GSAP `ScrollTrigger` + `ImageSequencePlayer` berkonflik dengan `<ScrollControls>` damping** (thread GSAP forum 40114). Dua pola yang aman: (a) **pisah tempat** — `ImageSequencePlayer` pakai ScrollTrigger pin biasa, di luar `<ScrollControls>`; atau (b) **ikat scroller** lewat workaround `useScroll().fixed.parentElement` (GitHub issue drei #1316, kontribusi AxiomeCG).
- **`<Html>` Drei** untuk hotspot: gunakan `position={[x,y,z]}` (koordinat model) + `occlude` (true atau `Ref[]`) + `onOcclude` callback agar transisi masuk/keluar halus. Untuk mencegah z-fighting/transform blur, gunakan `transform` + `scale={0.5}` + counter-scale di anak (drei docs, issue #859).
- **Aksesibilitas** wajib: bungkus `<Canvas>` dengan `<A11yAnnouncer />` dan hotspot dengan `<A11y role="button" description="..." />` dari paket **`@react-three/a11y`**. Pakai `<A11yUserPreferences />` untuk membaca `prefers-reduced-motion` runtime — saat aktif, `snap: "frame"` dimatikan dan `damping` di-nol-kan.

---

## Transisi Kamera Spline (ScrollControls)

### Pola
`<ScrollControls>` Drei membuat *scrollable HTML container* di depan `<Canvas>`. Hook `useScroll()`暴露 data posisi gulir yang bisa diikat ke posisi kamera pada spline. PRD §5.2 mengamanatkan transisi Lakar Basah → Lakar Kuah **di sepanjang spline, bukan hard-cut**.

```tsx
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScrollControls, useScroll } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

const spline = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 1.2, 3.0),   // framing Lakar Basah
  new THREE.Vector3(1.5, 1.4, 2.2), // midpoint miring
  new THREE.Vector3(2.4, 1.0, 3.0), // swivel ke Kujang
  new THREE.Vector3(0.0, 1.6, 3.2), // framing Lakar Kuah
], false, 'centripetal')

function CameraRig() {
  const { camera } = useThree()
  const scroll = useScroll()
  const lookAtTarget = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    // offset 0–1 dipetakan ke titik pada spline
    const t = THREE.MathUtils.clamp(scroll.offset, 0, 1)
    const pos = spline.getPointAt(t)
    camera.position.copy(pos)

    // lookAt bergeser halus antar titik fokus dua produk
    const focusA = new THREE.Vector3(0, 0.8, 0)   // tengah Lakar Basah
    const focusB = new THREE.Vector3(2.0, 0.6, 0) // tengah Lakar Kuah
    lookAtTarget.lerpVectors(focusA, focusB, scroll.range(0.4, 0.4))
    camera.lookAt(lookAtTarget)
  })
  return null
}

<Canvas>
  <ScrollControls pages={3} damping={0.15} maxSpeed={0.6}>
    <CameraRig />
    <LakarBasahModel />
    <LakarKuahModel />
  </ScrollControls>
</Canvas>
```

### Props `<ScrollControls>` (diverifikasi dari `pmndrs/drei` master)
| Prop | Default | Catatan Karasa |
| --- | --- | --- |
| `pages` | `1` | Total tinggi gulir dalam kelipatan 100vh. `3` cocok untuk 3 "bab" (Basah → transisi → Kuah). |
| `damping` | `0.2` | Inersia gulir dalam detik. **Jangan > 0.2** karena scroll-spline terasa "lengket" (lihat Risiko). |
| `maxSpeed` | `Infinity` | Pembatas kecepatan clamp. `0.6` mencegah lompatan jauh yang membuat spline terlewati. |
| `horizontal` | `false` | Karasa tetap vertikal (scroll mousewheel / sentuh). |
| `infinite` | `false` | Jangan diaktifkan — Karasa adalah katalog linear. |
| `distance` | `1` | Faktor pengali tinggi scrollbar. |
| `prepend` | `false` | Set `true` jika mau DOM scroll container di belakang canvas (jarang). |

### API `useScroll()` (diverifikasi dari `pmndrs/drei` master)
- `data.offset` — posisi 0–1 (sudah didampingkan).
- `data.delta` — delta 0–1 antar frame.
- `data.range(start, length, margin?)` — 0–1 di dalam window.
- `data.curve(start, length, margin?)` — 0–1–0 (bell curve).
- `data.visible(start, length, margin?)` — boolean di dalam window.

Untuk Karasa, gunakan `data.offset` linear agar pemetaan ke `getPointAt(t)` natural; `data.curve` hanya untuk hotspot yang muncul-tenggelam.

### Fallback bila `useScroll` tidak tersedia
`useScroll()` melempar jika dipanggil di luar `<ScrollControls>`. Pola aman:
```tsx
const scroll = useScroll() // boleh null bila tidak dalam ScrollControls
useFrame(() => {
  if (!scroll) return
  // ... animasi kamera
})
```
Atau gunakan `useState` + `window.addEventListener('scroll', ...)` sebagai fallback (kasar, tidak disarankan — hanya untuk emergency).

### Parameter spline yang disarankan
- **4 titik kontrol** cukup untuk 2 produk (2 endpoint + 2 midpoint).
- `'centripetal'` parameterization mencegah loop/eyeball-shape — direkomendasikan untuk kurva pendek (drei docs `CurveModifier`).
- `getPointAt(t)` (jarak arc-length) lebih natural daripada `getPoint(t)` (parametrik) untuk scrubbing.

---

## OrbitControls Constraints

### Properti `OrbitControls` (diverifikasi dari `three.js` master `examples/jsm/controls/OrbitControls.js`)
```ts
this.minPolarAngle    = 0          // [0, Math.PI] rad
this.maxPolarAngle    = Math.PI
this.minAzimuthAngle  = -Infinity
this.maxAzimuthAngle  = Infinity
this.minDistance      = 0
this.maxDistance      = Infinity
this.enableDamping    = false
this.enableRotate     = true
this.enableZoom       = true
this.enablePan        = true
```

### Mengapa Karasa butuh kunci polar
PRD §5.2: kamera **tidak boleh mendongak menembus bagian bawah pedestal Kujang** (motif Kujang dari PRD §3.1). Pada koordinat Three.js, polar `0` = kamera di atas target melihat ke bawah, `Math.PI/2` = sejajar horizon, `Math.PI` = di bawah. Pedestal Kujang adalah alas di bawah produk, jadi kita kunci agar kamera tidak pernah berada di atas produk pada sudut yang memperlihatkan "bagian dalam" alas.

```tsx
import { OrbitControls } from '@react-three/drei'

<OrbitControls
  makeDefault
  enabled={!isScrolling}    // toggle dari CameraRig via context/ref
  enablePan={false}         // Kujang adalah sumbu putar tetap
  enableZoom
  enableRotate
  minPolarAngle={Math.PI / 3}      // 60° — tidak bisa menukik tajam ke atas
  maxPolarAngle={Math.PI / 2.05}   // ~88° — tidak bisa masuk ke bawah alas
  minDistance={2.4}
  maxDistance={4.2}
  enableDamping
  dampingFactor={0.08}
  target={[0, 0.6, 0]}            // titik fokus tengah Lakar (Y = 0.6 ≈ tengah pouch)
/>
```

Catatan: nilai `0.6` dan sudut di atas adalah **estimasi visual** — saat implementasi, ukur dari mesh aktual di Blender (Fase 1) dan iterasi.

### Integrasi dengan `<ScrollControls>`
Drei `OrbitControls` adalah **kontrol kamera persisten**, sedangkan `<ScrollControls>` menulis `camera.position` langsung di `useFrame`. Jika keduanya hidup bareng, terjadi perkelahian: scroll menggerakkan kamera, lalu OrbitControls mengembalikannya ke posisi orbit. Solusi:

```tsx
function ScrollGate() {
  const scroll = useScroll()
  const { controls } = useThree() // OrbitControls dengan makeDefault
  useFrame(() => {
    // Toleransi kecil: hanya matikan bila scroll benar-benar bergeser
    const isMoving = Math.abs(scroll.delta) > 0.0001
    if (controls) controls.enabled = !isMoving
  })
  return null
}
```
Atau lebih bersih: di `CameraRig`, saat `scroll.offset` mendekati 0 atau 1 (kamera "parkir" di produk), hidupkan kembali `OrbitControls`; saat di tengah (0.1–0.9, area transisi), matikan. Gunakan `useMemo` untuk [`{ enter: 0.0, leave: 0.1, enterNext: 0.9, leaveNext: 1.0 }]` agar `controls.enabled` hanya toggle dua kali per siklus scroll.

Dokumentasi drei menyatakan kontrol kamera otomatis nonaktif ketika ada kontrol lain yang "menarik" — pola di atas adalah versi eksplisit yang lebih deterministik.

---

## Sinkronisasi GSAP ScrollTrigger + ImageSequence

### Konflik inti yang ditemukan
**Drei `<ScrollControls>` damping vs GSAP `ScrollTrigger` `pin: true` saling menggangu** (gejala: marker ScrollTrigger terlihat tertinggal, pinned element bergoyang). Sumber:

- Forum GSAP, thread **#40114** "ScrollTrigger pin and drei's ScrollControls don't play well together" (6 Maret 2024) — pelapor menulis "damping on ScrollControls causes a delay on the pinned element". Rekomendasi Toso: "use only scrollTrigger to do all your scroll-related animations for you, scrollControls was killing me also".
- GitHub drei **issue #1316** "GSAP Not working in ScrollControls Html" (closed as not planned, Nov 2024) — workaround dari **AxiomeCG**: `const { fixed } = useScroll(); useGSAP(() => { ScrollTrigger.create({ scroller: fixed.parentElement, ... }) })`.

### Resolusi konflik — dua strategi

#### Strategi A: Pisah seksi (disarankan untuk Karasa)
PRD §5.1 (`ImageSequencePlayer` dengan `pin: true`, `end: "+=300svh"`) dipakai untuk **Opak Klasik/Mini & Lakar Kering** (image sequence). PRD §5.2 (`ScrollControls` spline) dipakai untuk **Lakar Basah & Lakar Kuah** (WebGL 3D). Letakkan di section/hal berbeda — **jangan nested**:

```
[ Page Section 1: <ImageSequencePlayer> untuk Opak Klasik ]    ← ScrollTrigger biasa
[ Page Section 2: <ImageSequencePlayer> untuk Lakar Kering ]  ← ScrollTrigger biasa
[ Page Section 3: <Canvas><ScrollControls>...Lakar Basah & Kuah ]  ← drei ScrollControls
```

Keuntungan: zero konflik, kode jelas, bundle size lebih kecil (ScrollControls tidak di-mount di section image sequence).

#### Strategi B: Bind scroller (jika harus nested)
```tsx
import { useScroll } from '@react-three/drei'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

function ImageSequenceInsideScroll() {
  const { fixed } = useScroll()        // elemen sticky yang di-scroll
  const containerRef = useRef<HTMLDivElement>(null)
  const framesRef = useRef({ frame: 0 })

  useGSAP(() => {
    gsap.to(framesRef.current, {
      frame: 59,
      snap: 'frame',
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: '+=300svh',
        scrub: 0.5,
        pin: true,
        scroller: fixed.parentElement,   // <-- workaround AxiomeCG
      },
      onUpdate: () => drawFrame(framesRef.current.frame),
    })
  }, [])

  return <div ref={containerRef} className="h-[300svh]">...</div>
}
```
**Catatan**: workaround ini rapuh terhadap versi drei baru. Wajib ditest. PRD §5.1 *tidak* mengharuskan penempatan di dalam ScrollControls — pilih Strategi A.

### Konfigurasi ScrollTrigger optimal untuk 60 frame
| Parameter | Nilai | Alasan |
| --- | --- | --- |
| `frame` (target) | `totalFrames - 1` (yaitu 59) | indeks frame 0–59. |
| `snap` | `"frame"` | Membulatkan nilai `frame` ke integer — mencegah "frame pecahan". |
| `ease` | `"none"` | Wajib — easing membuat pemetaan scroll→frame tidak linear (akapowl, GSAP forum #25996). |
| `scrub` | `0.5` (PRD §5.1) — **tapi pertimbangkan `true`** | `0.5` menambah lagging 0.5 d yang terasa "berat" di 60 frame; `true` lebih responsif. PRD §5.1 menulis `0.5` — patuhi PRD, namun bila jitter muncul, turunkan ke `true`. |
| `pin` | `true` | Jaga canvas statis selama scrubbing (PRD §5.1). |
| `pinSpacing` | default `true` | Menambah spacer agar layout tidak kolaps saat pinned. |
| `start` | `"top top"` | Trigger dimulai saat container menyentuh puncak viewport. |
| `end` | `"+=300svh"` | Ruang gulir 3× tinggi viewport — proporsional untuk 60 frame dengan jeda visual. |

### Resize handler untuk canvas
```tsx
useEffect(() => {
  const onResize = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio, 2)
    canvas.width = canvas.clientWidth * dpr
    canvas.height = canvas.clientHeight * dpr
    ctx.scale(dpr, dpr) // penting: scale sekali, reset setiap resize
    ScrollTrigger.refresh()
  }
  window.addEventListener('resize', onResize)
  return () => window.removeEventListener('resize', onResize)
}, [])
```
- `ScrollTrigger.refresh()` dipanggil otomatis saat resize (didebounce 200 ms) menurut skill dokumentasi GSAP — namun untuk canvas 2D, kita tetap harus resize buffer eksplisit.
- Setel `image-rendering: pixelated` di CSS canvas untuk menjaga ketajaman saat WebP upscale.

---

## Hotspot Html Drei

### Pola dasar (diverifikasi dari `drei.docs.pmnd.rs/misc/html`)
```tsx
import { Html } from '@react-three/drei'

function HotspotStiker({ position, label, body }) {
  const [hidden, setHidden] = useState(false)
  return (
    <Html
      position={position}                // koordinat model: [x, y, z]
      center                              // CSS transform -50%/-50% pada center
      occlude={[modelRef]}                // sembunyikan saat tertutup mesh model
      onOcclude={setHidden}
      zIndexRange={[100, 0]}
      style={{
        transition: 'opacity 0.3s, transform 0.3s',
        opacity: hidden ? 0 : 1,
        transform: `scale(${hidden ? 0.6 : 1})`,
        pointerEvents: hidden ? 'none' : 'auto',
      }}
    >
      <button className="bg-bodas/95 backdrop-blur border border-hawuk rounded-full px-3 py-1.5 text-xs font-semibold text-beureum">
        {label}
      </button>
      {/* tooltip / popover eduksi muncul saat focus atau click */}
    </Html>
  )
}
```
- `occlude={[modelRef]}` (array of `Ref<Object3D>`) menyembunyikan hotspot hanya ketika tertutup mesh *tertentu* — lebih presisi dari `occlude` (boolean) yang menyembunyikan di belakang mesh apa pun.
- `onOcclude(boolean)` dipanggil tiap kali status visibilitas berubah.

### Z-fighting & transform blur
Mode default `<Html>` (CSS positioned) tidak mengalamai z-fighting — diproyeksikan ke koordinat layar. Masalah muncul saat `transform` diaktifkan (HTML benar-benar menjadi child 3D):
- **Workaround blur**: drei docs merekomendasikan `<Html transform scale={0.5}><div style={{ transform: 'scale(2)' }}>` (issue drei #859). Untuk Karasa, **default mode (tanpa `transform`) sudah cukup** karena hotspot berupa badge HTML yang diproyeksikan ke layar.

### Animasi masuk/keluar dengan Framer Motion
Bungkus konten HTML dengan `motion.div` Framer Motion, gerakkan `opacity` & `scale` saat `hidden` berubah atau saat `scroll.range(0, 1/3)` melewati threshold:
```tsx
import { motion, AnimatePresence } from 'framer-motion'
<AnimatePresence>
  {!hidden && (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
    >
      {label}
    </motion.div>
  )}
</AnimatePresence>
```

### Klik handler & focus kamera (PRD §6.1 "Handmade", "Tanpa Pengawet", dll)
`<Html>` mewarisi `onClick` native. Untuk pindah fokus kamera ke hotspot, gunakan `useBounds` Drei (alternatif: `OrbitControls.target` + `camera.position.lerp`):
```tsx
import { useBounds } from '@react-three/drei'

function HotspotWithFocus({ position, label }) {
  const bounds = useBounds()
  return (
    <Html position={position} ...>
      <button
        onClick={(e) => {
          e.stopPropagation()
          bounds.refresh().clip().fit()
        }}
        aria-label={`Lihat detail ${label}`}
      >{label}</button>
    </Html>
  )
}
```
Atau untuk kontrol lebih presisi: `OrbitControls` ref + `gsap.to(camera.position, { ... })` di event handler (jangan lupa cleanup dengan `gsap.killTweensOf(camera.position)` saat komponen unmount).

### Hotspot pada image sequence
Karena image sequence adalah Canvas 2D (bukan WebGL), `<Html>` Drei tidak berlaku. Untuk Opak/Lakar Kering, gunakan **overlay HTML biasa** di atas `<canvas>`, diposisikan absolut dengan koordinat yang telah dihitung manual untuk tiap frame (lookup table). Ini merupakan keterbatasan teknis yang harus di-design-around — PRD tidak eksplisit mengatakannya, tetapi aturan rendering hybrid di AGENTS.md melarang model 3D untuk Opak/Lakar Kering.

---

## Aksesibilitas & prefers-reduced-motion

### Paket `@react-three/a11y` (diverifikasi dari `pmndrs/react-three-a11y`)
A11y wrapper memberi:
- `<A11yAnnouncer />` — di-sibling dengan `<Canvas>`, mengirim info ke screen reader.
- `<A11y role="button" description="..." actionCall={...}>` — fokus + keyboard (Enter/Space) + screen reader.
- `<A11yUserPreferences />` — hook untuk baca `prefers-reduced-motion` & `prefers-color-scheme` runtime.
- 4 role: `content`, `button`, `togglebutton`, `link`. Untuk Karasa, gunakan `button`.

```tsx
import { A11yAnnouncer, A11y, A11yUserPreferences } from '@react-three/a11y'

<>
  <Canvas>...</Canvas>
  <A11yAnnouncer />
  <A11yUserPreferences />   {/* baca prefers-reduced-motion */}
</>
```

```tsx
// Hotspot dengan keyboard nav & screen reader
<A11y
  role="button"
  description="Bumbu khas Sunda: cikur, kencur, garam"
  actionCall={() => openDetail('bumbu')}
>
  <Html position={...}>
    <button tabIndex={-1} aria-hidden>  {/* A11y yg handle focus */}
      <span>bumbu</span>
    </button>
  </Html>
</A11y>
```

Catatan AGENTS.md: A11y bukan dependency yang direncanakan di PRD §4.1. **Rekomendasi**: tambahkan ke stack dengan satu paket tambahan kecil (~16 KB gzip) — value a11y untuk hotspot info produk sangat tinggi.

### prefers-reduced-motion fallback
Verifikasi dari `web.dev/articles/prefers-reduced-motion`:
```ts
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
const reduce = motionQuery.matches
// di GSAP:
scrub: reduce ? false : 0.5,
snap: reduce ? false : 'frame',
// di ScrollControls:
damping: reduce ? 0 : 0.15,
// di Framer Motion:
<motion.div transition={{ duration: reduce ? 0 : 0.3 }} />
```
`A11yUserPreferences` Drei expose nilai ini via context — lebih bersih daripada `matchMedia` manual saat a11y sudah terpasang.

**Dengarkan perubahan runtime** (user toggle setting OS saat sesi berlangsung):
```ts
motionQuery.addEventListener('change', () => {
  ScrollTrigger.refresh()
  // atau trigger re-render seluruh scene
})
```

---

## Pola Interaksi Lengkap (use case)

### Skenario 1: User scroll pertama kali dari hero
1. **Hero** (svh 0–1): logo Karasa, tagline "Old but Gold, Classic but Fresh" fade-in.
2. ScrollTrigger di hero, fade-out panel deskripsi saat `start: "top 20%"`.
3. `ImageSequencePlayer` Opak Klasik ter-pin 3× svh. Gulir 1 svh = 20 frame. Gulir dengan sentuhan halus, `snap: "frame"` mencegah frame pecahan.
4. Setelah 3 svh, panel keluar. ScrollTrigger `onLeave` → unmount player, mount `<Canvas><ScrollControls>...</ScrollControls></Canvas>`.

### Skenario 2: Transisi Lakar Basah → Lakar Kuah
1. `useScroll().offset` 0.0–0.1: kamera di posisi spline titik 0, `OrbitControls` masih enabled untuk rotasi ringan.
2. 0.1–0.9: `OrbitControls.enabled = false`, `CameraRig` menulis `camera.position` ke `spline.getPointAt(offset)`. Hotspot di Lakar Basah fade-out (Framer Motion), hotspot di Lakar Kuah fade-in.
3. 0.9–1.0: kamera parkir, `OrbitControls` re-enabled, hotspot interaktif penuh.

### Skenario 3: Hotspot interaksi
1. User tap hotspot stiker "Handmade" pada Lakar Basah.
2. `onClick` di `<Html>`: `OrbitControls.target` lerp ke posisi stiker (0.4 d, ease `power2.out`).
3. `setSelectedHotspot('handmade')` → mount Framer Motion panel eduksi di luar Canvas (DOM 2D di-overlay via portal React).
4. Tombol "Beli" di panel eduksi: deep-link ke Shopee (lihat Fase 4).

### Skenario 4: prefers-reduced-motion aktif
1. `A11yUserPreferences` membaca `prefers-reduced-motion: reduce` saat mount.
2. ScrollControls `damping=0`, snap nonaktif — frame sequence berubah langsung sesuai gulir.
3. Tidak ada fade-in panel; perpindahan produk terjadi cut langsung (trade-off: kehilangan kemulusan spline, sesuai spec a11y).
4. `performanceMonitor` Drei tetap jalan — performa adaptif tidak terkait motion preference.

---

## Riset Mentah

### Library & versi diverifikasi (knowledge cutoff Januari 2026)
| Library | Versi diverifikasi | Sumber |
| --- | --- | --- |
| `@react-three/drei` | master branch (Docs MDX di `pmndrs/drei`) | https://context7.com/pmndrs/drei, https://drei.docs.pmnd.rs |
| `@react-three/fiber` | `__branch__v10` | https://context7.com/pmndrs/react-three-fiber |
| `@react-three/a11y` | v3.0.0 (Mei 2022) — repositori masih aktif, last commit 30 Nov 2024 | https://github.com/pmndrs/react-three-a11y |
| `gsap` + `ScrollTrigger` | v3.x, skill dokumentasi per Maret 2026 | https://gsap.com/docs/v3/Plugins/ScrollTrigger/ , https://github.com/greensock/gsap-skills/blob/main/skills/gsap-scrolltrigger/SKILL.md |
| `three` | master (OrbitControls rewrite) | https://raw.githubusercontent.com/mrdoob/three.js/master/examples/jsm/controls/OrbitControls.js |

### Cuplikan penting

**`<ScrollControls>` + `useScroll()`** — dari `pmndrs/drei` llms.txt:
```jsx
<ScrollControls pages={3} damping={0.1} horizontal={false}>
  <SomeModel />      {/* tidak ikut scroll, menerima useScroll */}
  <Scroll>...</Scroll>   {/* ikut scroll, canvas contents */}
  <Scroll html>...</Scroll>  {/* ikut scroll, DOM contents */}
</ScrollControls>
```
API `useScroll` mengembalikan `{ offset, delta, range, curve, visible }`.

**`<Html>` props** — dari drei docs resmi:
```jsx
<Html
  as='div'
  center
  transform
  distanceFactor={10}
  zIndexRange={[100, 0]}
  occlude={[ref]}     // atau 'blending' untuk true occlusion
  onOcclude={(hidden) => ...}
  style={{ transition: 'all 0.5s', opacity: hidden ? 0 : 1 }}
/>
```

**GSAP `ScrollTrigger` snap frame + scrub** — dari skill dokumentasi GSAP v3:
```js
gsap.to(obj, {
  frame: 59,
  snap: 'frame',
  ease: 'none',
  scrollTrigger: {
    trigger: el, start: 'top top', end: '+=300svh',
    scrub: 0.5, pin: true, pinSpacing: true,
  }
})
```
- `snap` accepts: `Number | Array | Function | "labels" | Object`. `"frame"` (alias dari `snapTo: 1`) membulatkan ke integer.
- `scrub: true` direct, `scrub: 0.5` lagging 0.5 d.
- `ease: "none"` **wajib** untuk image sequence (akapowl, forum #25996) — agar 1:1 antara scroll position dan frame index.

**Workaround drei #1316 (AxiomeCG)**:
```js
const { fixed } = useScroll()
useGSAP(() => {
  ScrollTrigger.create({
    trigger: el,
    scrub: true,
    scroller: fixed.parentElement,  // <-- bind ke scroll container Drei
  })
})
```

**A11y hotspot pattern** — dari `pmndrs/react-three-a11y`:
```jsx
<A11y role="button" description="Bumbu khas Sunda" 
       actionCall={() => openDetail('bumdu')}>
  <Html position={...}><button>bumbu</button></Html>
</A11y>
<A11yUserPreferences />   {/* exposes prefers-reduced-motion */}
```

**Preferensi gerak** — dari web.dev (Thomas Steiner):
```js
const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
mq.addEventListener('change', () => { /* stop JS animations */ })
// CSS:
@media (prefers-reduced-motion: no-preference) {
  button { animation: vibrate 0.3s linear infinite both; }
}
```

### URL referensi
- drei ScrollControls: https://github.com/pmndrs/drei/blob/master/docs/controls/scroll-controls.mdx
- drei Html: https://drei.docs.pmnd.rs/misc/html
- drei CurveModifier (spline di R3F): https://github.com/pmndrs/drei/blob/master/docs/modifiers/curve-modifier.mdx
- drei Issue #1316 (GSAP + ScrollControls): https://github.com/pmndrs/drei/issues/1316
- drei Issue #859 (Html transform blur): https://github.com/pmndrs/drei/issues/859
- GSAP forum #40114 (pin + ScrollControls conflict): https://gsap.com/community/forums/topic/40114-scrolltrigger-pin-and-dreis-scrollcontrols-dont-play-well-together/
- GSAP forum #25996 (image sequence scrub value): https://gsap.com/community/forums/topic/25996-gsap-scrolltrigger-image-sequence-with-horizontal-scrubber/
- GSAP ScrollTrigger skill docs: https://github.com/greensock/gsap-skills/blob/main/skills/gsap-scrolltrigger/SKILL.md
- @react-three/a11y: https://github.com/pmndrs/react-three-a11y
- three.js OrbitControls: https://raw.githubusercontent.com/mrdoob/three.js/master/examples/jsm/controls/OrbitControls.js
- model-viewer annotations (referensi UX): https://modelviewer.dev/examples/annotations/
- prefers-reduced-motion: https://web.dev/articles/prefers-reduced-motion , https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
- Discourse three.js camera-scroll (referensi pola): https://discourse.threejs.org/t/how-to-change-camera-position-on-scroll-in-react-three-fibre/42771

---

## Rekomendasi untuk Fase 4

Input untuk agen riset **Fase 4 — Integrasi Distribusi, Optimasi, & Peluncuran** (Minggu 7–8):

1. **State kamera harus di-share dengan CTA**. PRD §6.2 mengamanatkan deep-link ke Shopee/Tokopedia/WhatsApp dengan nama produk aktif. Cara termurah: simpan `currentProduct: 'lakar-basah' | 'lakar-kuah' | 'opak-klasik' | 'lakar-kering'` di URL search-param (`?p=lakar-basah`) atau di React Context, sinkronkan dengan `useScroll().range(0, 0.5) → 'lakar-basah'`. CTA di overlay 2D tinggal baca context.
2. **Hotspot `<A11y role="link" href="...">`** untuk beberapa hotspot bisa langsung deep-link ke SKU spesifik Shopee/Tokopedia — percepat konversi tanpa harus buka panel detail.
3. **Mobile-first audit**: ScrollTrigger `pin: true` + Canvas 2D + ScrollControls di seluler kelas menengah berisiko scroll-jank. Target < 45 FPS akan di-handle `<PerformanceMonitor>` (PRD §8.1), tapi audit Lighthouse wajib sebelum luncur.
4. **KTX2 untuk tekstur 3D Lakar Basah & Kuah** tidak menyentuh image sequence — sequence sudah WebP. Pipeline tetap terpisah.
5. **Bulk Redirect** `*.pages.dev → karasakhasnusantara.com` dengan Preserve query string **penting** agar `?p=lakar-basah` (state produk) ikut ter-redirect utuh.
6. **CTA WhatsApp templat** contoh: `Halo Karasa, saya tertarik dengan *${currentProductLabel}* (sumber: web 3D Karasa).` — gunakan label eksak dari PRD, bukan terjemahan.
7. **Tambahkan paket `@react-three/a11y` ke stack** (PRD §4.1 belum menyebutnya). Rekomendasi biaya/manfaat: sangat positif untuk visibilitas SEO & inklusivitas, paket kecil (~16 KB gzip).

---

## Lampiran: Peta file sumber PRD

| Bagian PRD | Kutipan singkat | Riset Fase 3 menyentuh |
| --- | --- | --- |
| §5.1 | `ImageSequencePlayer` dengan GSAP ScrollTrigger pin 300svh, `snap: "frame"`, `scrub: 0.5` | §"Sinkronisasi GSAP ScrollTrigger + ImageSequence" |
| §5.2 | `<ScrollControls>` Drei untuk transisi spline Lakar Basah → Lakar Kuah; `OrbitControls` minPolarAngle/maxPolarAngle | §"Transisi Kamera Spline" + §"OrbitControls Constraints" |
| §6.1 | SWOT → "Handmade", "Tanpa Pengawet" sebagai badge 2D/3D | §"Hotspot Html Drei" (pola badge) |
| §8.1 | Dilarang `useState` di `useFrame`; mutasi langsung | §"Transisi Kamera Spline" (snippet menggunakan `camera.position.copy()`) |
| §8.2 | Preload 10 frame pertama sinkron, sisanya `requestIdleCallback` | (Riset ini tidak menyentuh — bagian Fase 2) |
| §9.3 | 3.1 ScrollControls spline · 3.2 GSAP ScrollTrigger snap · 3.3 Html hotspot | Struktur utama dokumen ini |
