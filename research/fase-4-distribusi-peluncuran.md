# Riset Fase 4 — Integrasi Distribusi, Optimasi, & Peluncuran

> **Proyek:** Karasa Web 3D (Rancaekek, Bandung — Jawa Barat)
> **Fase:** 4 / Minggu 7–8 (sesuai PRD §9.4)
> **Tanggal riset:** 3 Juli 2026
> **Sumber utama:** PRD v2.0, Cloudflare Docs (Pages & Rules), Three.js `KTX2Loader`, Khronos `KTX-Software`, WhatsApp Help Center, Shopee Help Centre, libwebp, GoogleChrome/lighthouse, web.dev.
> **Konvensi:** Bahasa Indonesia untuk prosa, istilah teknis apa adanya. URL & versi library dicantumkan di bagian yang relevan.

---

## Ringkasan Eksekutif

- **Distribusi tanpa checkout** mengharuskan tiga tombol CTA yang berbeda sifat: WhatsApp adalah universal-link web (cross-platform, fallback ke `web.whatsapp.com`), Shopee & Tokopedia adalah deep-link toko/produk e-commerce dengan pola URL yang perlu dibakukan via konstanta env (bukan hard-code per produk).
- **Templat pesan WhatsApp** harus otomatis menyisipkan nama produk aktif sesuai PRD §6.2. Nomor `+62 815-6333-9275` harus diformat internasional menjadi `6281563339275` (tanpa `+`, tanpa spasi, tanpa leading nol, sesuai dokumentasi resmi `wa.me`).
- **Kompresi tekstur 3D wajib KTX2** karena model WebGL Karasa butuh GPU-compressed texture (BC7/ETC2/ASTC) yang tidak bisa dicapai PNG/JPEG. Pipeline: `ktx encode` (atau `toktx --t2 --bcmp`) → `KTX2Loader` di Three.js + `setTranscoderPath` ke CDN publik → Drei `useKTX2(url)`. Hanya ETC1S untuk diffuse/normal, UASTC untuk data yang butuh fidelitas (mis. stiker Lakar Basah).
- **Image sequence 60 frame WebP** dengan `cwebp -q 80 -m 6` (lossy), target ≤ 60 KB per frame @ 1024 px = total ≤ 3,6 MB. Preload sinkron 10 frame pertama, sisanya `requestIdleCallback`, fallback ke `OffscreenCanvas` di Web Worker saat main thread padat.
- **Routing SPA Pages:** cukup satu mekanisme — `public/_redirects` dengan `/* /index.html 200`. Konfigurasi `wrangler.toml` `[assets] not_found_handling = "single-page-application"` adalah Workers (bukan legacy Pages) — tidak relevan untuk project ini. PRD §7.1 dan §7.2 redundan; pilih §7.2 saja.
- **Bulk Redirects `*.pages.dev → karasakhasnusantara.com`** wajib mengaktifkan 4 opsi: Preserve query string, Subpath matching, Preserve path suffix (default true), Include subdomains. Tanpa semua opsi, sub-halaman akan patah.
- **Audit performa:** Lighthouse mobile default sudah mensimulasikan "Slow 4G" + CPU 4× (≈ mid-tier mobile 2 tahun ke atas). Target 60 FPS harus diuji dengan Chrome DevTools Performance + 6× CPU throttling pada profil hardware mid-tier.

---

## Deep-link WhatsApp Business

### Format URL resmi

Dokumentasi resmi WhatsApp (`faq.whatsapp.com/425247423114725`) menyatakan tiga format utama:

| Use case | Format | Catatan |
|---|---|---|
| Chat dasar (no prefilled) | `https://wa.me/<intl-number>` | Selalu pakai format internasional, tanpa `+`, tanpa spasi, tanpa strip, tanpa leading nol. |
| Chat dengan pesan prefilled | `https://wa.me/<intl-number>?text=<urlencoded>` | Pesan di-encode URL (spasi → `%20`, `'` → `%27`, dst). Pesan tidak dikirim otomatis; pengguna tetap harus tap kirim. |
| Web/Desktop fallback | `https://api.whatsapp.com/send?phone=<intl-number>&text=<urlencoded>` | Identik dengan `wa.me`, hanya domain berbeda (legacy). |

**API Business resmi tidak dipakai di sini** — kita hanya butuh *click-to-chat* link, bukan WhatsApp Business Platform (BSM/API).

### Format nomor Indonesia

PRD §6.2 menulis `+62 815-6333-9275`. Konversi ke format `wa.me`:

```
+62 815-6333-9275
   ↓ hapus "+"
   ↓ hapus spasi & strip
   ↓ hapus leading "0" setelah kode negara
6281563339275
```

Catatan: `62` adalah kode negara, `815-6333-9275` adalah nomor seluler. Setelah `62`, *tidak* ada leading `0` — jadi langsung `8…`.

### Templat pesan dinamis per produk (PRD §6.2)

Pesan yang muncul di kolom chat harus otomatis memuat **nama produk aktif** (Lakar Basah, Lakar Kuah, Opak Klasik, Opak Mini, atau Lakar Kering). Contoh templat:

```
Halo Karasa, saya tertarik dengan *{productName}* dari etalase web 3D. Mohon info harga & ongkir ke {kota} ya. Terima kasih.
```

Saat di-encode:

```
Halo%20Karasa%2C%20saya%20tertarik%20dengan%20*Lakar%20Basah*%20dari%20etalase%20web%203D.%20Mohon%20info%20harga%20%26%20ongkir%20ke%20{kota}%20ya.%20Terima%20kasih.
```

URL final untuk Lakar Basah (placeholder `{kota}` dihilangkan dulu untuk V1, atau gunakan `Bandung` sebagai default):

```
https://wa.me/6281563339275?text=Halo%20Karasa%2C%20saya%20tertarik%20dengan%20*Lakar%20Basah*%20dari%20etalase%20web%203D.%20Mohon%20info%20harga%20%26%20ongkir.%20Terima%20kasih.
```

**Aturan penting** (dari AppsFlyer & WhatsApp FAQ):
- **Pesan tidak boleh auto-send.** `wa.me` hanya mengisi kolom teks; pengguna tetap harus mengetuk kirim.
- **Jangan gunakan kata-kata menipu/mendesak** ("GRATIS", "MENANG", "KLIK SEKARANG") — dapat di-flag sebagai spam oleh WhatsApp.
- **Hormati Unicode:** emoji dan karakter Sunda (mis. ᮛ, ᮙ) aman selama di-encode benar (`encodeURIComponent`).

### Tracking via `utm_source`

Karena `wa.me` tidak mendukung parameter kustom di URL (browser akan ignore query params tambahan selain `text`), tracking terbatas pada:
- **Sisi Karasa**: lihat jumlah klik via Google Tag Manager event listener (`gtag('event', 'click_whatsapp', { product_name })`).
- **Sisi WhatsApp Business**: lihat chat masuk manual, tanyakan kode promo `WEB3D-{productId}` di pesan templat untuk atribusi offline.

Jika atribusi server-side dibutuhkan, gunakan AppsFlyer OneLink (biaya subscription) — di luar scope MVP serverless.

### Catatan platform & fallback

- **Desktop** → `wa.me` membuka `web.whatsapp.com` di tab baru.
- **Mobile (WhatsApp terinstall)** → membuka app WhatsApp dengan chat ke nomor.
- **Mobile (tanpa WhatsApp)** → menampilkan error/"open in browser" — terima sebagai graceful failure (PRD tidak mensyaratkan fallback ke app store).

---

## Deep-link Shopee & Tokopedia

### Shopee — pola URL resmi

Beradasarkan **Shopee Short Link Implementation Guideline** (help.shopee.com.my/portal/10/article/174050), ada dua domain yang relevan untuk pasar Indonesia:

| Domain | Use case |
|---|---|
| `shopee.co.id` (atau `shopee.co.id/product/<shop_id>/<item_id>`) | Landing page produk / toko asli. |
| `shope.ee` | Short-link domain untuk afiliasi. Format: `shope.ee/an_redir?origin_link=<url-encoded landing>&affiliate_id=<id>&sub_id=<custom>`. |
| `s.shopee.co.id` | Subdomain regional Indonesia untuk short-link affiliate resmi. |

**Rekomendasi untuk Karasa:**
- **Tombol CTA "Beli di Shopee"** menggunakan short-link affiliate (sesuai panduan), tetapi **jangan hard-code** karena affiliate ID akan berubah.
- Siapkan konstanta env (PRD §6.2: tidak ada checkout di aplikasi, hanya deep-link):

```ts
// Konstanta env, bukan hard-code
const SHOPEE_LINKS: Record<ProductId, string> = {
  'lakar-basah':   import.meta.env.VITE_SHOPEE_LAKAR_BASAH,
  'lakar-kuah':    import.meta.env.VITE_SHOPEE_LAKAR_KUAH,
  'opak-klasik':   import.meta.env.VITE_SHOPEE_OPAK_KLASIK,
  'opak-mini':     import.meta.env.VITE_SHOPEE_OPAK_MINI,
  'lakar-kering':  import.meta.env.VITE_SHOPEE_LAKAR_KERING,
};
```

- **Format URL toko resmi** (jika Karasa punya official store di Shopee, yang lazim untuk UMKM Bandung): `https://shopee.co.id/<shop-slug>` atau `https://shopee.co.id/product/<shop_id>/<item_id>`.

### Shopee app deep-link

Shopee mendukung universal-link di iOS dan app-link di Android. Di web, tidak ada `shopeeid://` scheme yang di-handle browser — saat user mobile meng-klik `shopee.co.id/...`, Shopee app akan otomatis terbuka jika terinstall (handled by OS, bukan oleh kita). Tidak perlu fallback eksplisit.

### Tokopedia — pola URL

Pola URL produk/toko di Tokopedia (diverifikasi dari beberapa sumber official Tokopedia Care):

- **Toko:** `https://www.tokopedia.com/<shop-slug>` (mis. `https://www.tokopedia.com/karasa`).
- **Produk:** `https://www.tokopedia.com/<product-slug>/p/<product-id>` (slug di-generate dari nama produk; `p/<id>` adalah identifier numerik).
- **Pencarian:** `https://www.tokopedia.com/search?q=<keyword>&st=product`.

Tokopedia **tidak punya short-link domain publik** yang setingkat `shope.ee`. Untuk afiliasi, gunakan `ta.tokopedia.net` (hanya untuk partner yang diundang) atau `tokopedia.link` (khusus product feed partner). Untuk MVP, **deep-link langsung ke URL toko/produk** sudah cukup.

### Tokopedia app deep-link

Tokopedia menggunakan `tokopedia://` scheme di Android (di-handle oleh OS via Android App Links) dan universal-link di iOS. Di web, tidak ada yang perlu kita tangani — `tokopedia.com` akan otomatis membuka app jika terinstall. Untuk safety, **link harus pakai `https://www.tokopedia.com/...`** (bukan HTTP), karena HTTPS adalah syarat universal-link.

### Rekomendasi struktur CTA

| Tombol | Target URL | Tracking |
|---|---|---|
| **WhatsApp** | `https://wa.me/6281563339275?text={encoded}` | GTM event `click_whatsapp` + `{productName}` |
| **Shopee** | `shope.ee/an_redir?origin_link=...&affiliate_id=...&sub_id=web3d-{productId}` | GTM event `click_shopee` + URL pendek afiliasi |
| **Tokopedia** | `https://www.tokopedia.com/{shop}/{product-slug}/p/{id}` | GTM event `click_tokopedia` + product ID |

Semua CTA harus membuka tab baru (`target="_blank"`) dengan `rel="noopener noreferrer"`. Tambahkan `aria-label` yang menyebut nama produk (aksesibilitas — lihat Lampiran A. SEO/A11y).

---

## Kompresi KTX2 + Basis Universal

### Apa itu Basis Universal GPU

Basis Universal (sebelumnya "Basis") adalah **intermediate GPU-compressed texture format** dari Binomial LLC, sekarang distandardisasi ke dalam **KTX2** container oleh Khronos. Keuntungan utama untuk Karasa:

- **1 file → 1 GPU format** (auto-transcode ke BC7 desktop, ETC2/ASTC mobile, sesuai kemampuan hardware).
- **Ukuran ~4× lebih kecil** dari PNG/JPEG dengan kualitas visual setara.
- **Load time** turun signifikan karena GPU langsung dekompresi (tidak seperti PNG yang harus di-upload ke GPU sebagai RGBA).

Teknologi ini dipakai di [`KhronosGroup/KTX-Software`](https://github.com/KhronosGroup/KTX-Software) — repo resmi, baru di-commit 6 bulan lalu (Jan 2026), BSD-3-Clause license. Tersedia CLI `ktx` (pengganti `toktx` legacy) dan library `libktx`.

### Pipeline generate KTX2 untuk Karasa

#### Tool: `ktx` CLI (dari KTX-Software Releases)

Tool yang direkomendasikan sekarang adalah **`ktx`** (bukan lagi `toktx` legacy yang sering error di WebGL2 — lihat diskusi three.js forum Aug 2022). Subcommand yang relevan:

| Subcommand | Fungsi |
|---|---|
| `ktx encode` | Re-encode file KTX2 existing. |
| `ktx create` | Convert PNG/JPEG/EXR ke KTX2. |
| `ktx transcode` | Ubah supercompression. |
| `ktx info` | Inspeksi metadata. |
| `ktx validate` | Validasi KTX2 untuk web. |

#### Contoh perintah untuk diffuse tekstur Lakar Basah (ETC1S, lossy, terkompresi kuat):

```bash
ktx create \
  --encode etc1s \
  --clevel 4 \
  --qlevel 128 \
  --genmipmap \
  diffuse.png diffuse.ktx2
```

- `--encode etc1s` → mode LZ/ETC1S (lossy, ukuran paling kecil, ideal untuk diffuse & normal map).
- `--clevel 4` → compression level 1–5 (4 = balanced; 5 = terkecil, paling lambat).
- `--qlevel 128` → quality level 1–255 (128 = default; turunkan ke 64 untuk file lebih kecil).
- `--genmipmap` → generate mipmap otomatis (penting untuk LOD, mencegah moiré di LOD rendah).

#### Contoh untuk stiker/premium texture (UASTC, fidelitas tinggi):

```bash
ktx create \
  --encode uastc \
  --zcmp 15 \
  --genmipmap \
  stiker_lakar_basah.png stiker_lakar_basah.ktx2
```

- `--encode uastc` → block-compressed (4×4 block), lossless terhadap input, ideal untuk normal map & tekstur dengan detail halus.
- `--zcmp 15` → Zstd supercompression level 15 (21 = max).
- UASTC tidak cocok untuk diffuse besar (>2 MB) karena rasio kompresinya lebih buruk dari ETC1S.

#### Catatan penting dari three.js forum (`discourse.threejs.org/t/how-to-create-ktx2-correctly/40963`):

> File hasil `toktx --t2 file.jpg` (legacy) sering gagal di `KTX2Loader.transcodeImage` karena tidak memiliki supercompression yang benar. Solusi: gunakan `ktx create` dari KTX-Software versi baru, atau `ktxsc` (legacy) dengan flag `--encode etc1s --clevel 5 -qlevel 255`.

### Loader di R3F / Drei

#### Three.js core (lower-level)

```js
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { WebGLRenderer } from 'three';

const renderer = new WebGLRenderer({ antialias: true, alpha: true });
const loader = new KTX2Loader();
loader.setTranscoderPath('/basis/');        // Lokasi file .wasm & .js wrapper
loader.detectSupport(renderer);             // Wajib sebelum .load() — pilih target format GPU
const tex = await loader.loadAsync('/textures/diffuse_lakar_basah.ktx2');
```

**`setTranscoderPath` default** adalah `examples/jsm/libs/basis/` (path relatif terhadap three.js npm package). Untuk produksi di Cloudflare Pages, **salin 4 file transcoder** (`basis_transcoder.wasm`, `basis_transcoder.js`, `KTX2Loader.*`) ke `public/basis/` sehingga ter-serve di `/basis/`.

#### Drei (cara yang dipakai Karasa)

Drei menyediakan hook `useKTX2` ([docs.pmnd.rs/drei/loaders/ktx2-use-ktx2](https://drei.docs.pmnd.rs/loaders/ktx2-use-ktx2)) yang membungkus `useLoader` + `KTX2Loader`:

```jsx
import { useKTX2 } from '@react-three/drei';

function LakarBasahMaterial() {
  const [diffuse, normal] = useKTX2([
    '/textures/diffuse_lakar_basah.ktx2',
    '/textures/normal_lakar_basah.ktx2',
  ]);
  return <meshStandardMaterial map={diffuse} normalMap={normal} />;
}
```

**Setup satu kali di root** (jangan lupa — tanpa ini, `useKTX2` akan error):

```jsx
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';

<Canvas onCreated={({ gl }) => {
  const ktx2 = new KTX2Loader()
    .setTranscoderPath('/basis/')
    .detectSupport(gl);
  // Inject ke useLoader registry
  useLoader.setKTX2Loader(ktx2);  // Drei helper (lihat discussion pmndrs/drei#1335)
}}>
```

### Trade-off ukuran vs kualitas vs kompatibilitas

| Format | Rasio kompresi | Kualitas | GPU yang didukung | Use case Karasa |
|---|---|---|---|---|
| **ETC1S** (LZ) | ~10–20× PNG | Lossy (qlevel-controlled) | Universal (BC7 desktop, ETC2 mobile, ASTC modern) | Diffuse, normal map, ORM — Lakar Basah stiker, semua tekstur umum. |
| **UASTC** | ~3–5× PNG | Mendekati lossless | Sama seperti ETC1S, tapi ukuran lebih besar | Normal map kritis, displacement (jika ada). |
| **UASTC + Zstd** | ~5–8× PNG | Sama | Sama | Kompromi untuk tekstur detail yang perlu kualitas tetapi bandwidth terbatas. |
| **BC7 (raw)** | ~4× PNG | Lossless | Desktop only (GPU Nvidia/AMD/Intel) | Tidak dipakai — fallback otomatis oleh KTX2Loader. |

**Kompatibilitas browser:**
- **WebGL2** wajib — dukungan ~97% global (caniuse, Juli 2026).
- **WASM** wajib — dukungan ~99% global.
- **KTX2Loader** tidak kompatibel dengan browser yang tidak support WebGL2 (akan throw). Untuk browser lama, fallback ke PNG via `<picture>` element dengan `<source type="image/ktx2">` (sebagian browser akan pilih fallback PNG).

**Verifikasi device support** sebelum produksi: jalankan `renderer.capabilities.isWebGL2` dan `WebGL2RenderingContext.getExtension('WEBGL_compressed_texture_astc' | 'WEBGL_compressed_texture_etc')` di aplikasi, dan log ke console untuk audit.

### Strategi dua resolusi (PRD §8.1)

Sesuai PRD §8.1, **render awal pakai 512 px, naik ke 1024–2048 px setelah user mulai rotasi manual**. Untuk KTX2, ini bisa diimplementasikan dengan:

1. **Dua file KTX2** per tekstur: `lakar_basah_diffuse_512.ktx2` dan `lakar_basah_diffuse_2k.ktx2`.
2. **Loader logic** (Drei tidak punya built-in untuk ini; tulis hook custom):

```ts
function useAdaptiveKTX2(low: string, high: string) {
  const [url, setUrl] = useState(low);
  useEffect(() => {
    const onInteract = () => {
      setUrl(high);
      window.removeEventListener('pointerdown', onInteract);
    };
    window.addEventListener('pointerdown', onInteract, { once: true });
    return () => window.removeEventListener('pointerdown', onInteract);
  }, [high]);
  return useKTX2(url);
}
```

3. **Performa trade-off:** KTX2 512 px biasanya ~50–150 KB; 2K bisa ~500 KB–2 MB. Preload 512 px, swap ke 2K setelah interaksi pertama.

---

## Optimasi WebP Image Sequence

### Tool encoder

| Tool | Sumber | Catatan |
|---|---|---|
| **cwebp** (CLI resmi) | [developers.google.com/speed/webp/docs/cwebp](https://developers.google.com/speed/webp/docs/cwebp) | Standar de-facto. `cwebp input.png -q 80 -m 6 -o output.webp`. |
| **libwebp** | [github.com/webmproject/libwebp](https://github.com/webmproject/libwebp) | Library + `cwebp`/`dwebp` binaries. |
| **Squoosh CLI** | [github.com/GoogleChromeLabs/squoosh](https://github.com/GoogleChromeLabs/squoosh) | Image optimizer Node.js, mendukung batch & WebP. Bagus untuk CI/CD. |
| **sharp** (Node) | [sharp.pixelplumbing.com](https://sharp.pixelplumbing.com) | Tercepat untuk batch besar. `sharp(input).webp({ quality: 80, effort: 6 }).toFile(output)`. |
| **FFmpeg** | [ffmpeg.org](https://ffmpeg.org) | Berguna jika sequence di-render ke video dulu lalu di-extract frame. `ffmpeg -i video.mp4 -vf fps=30 frame_%03d.webp`. |

### Quality & ukuran target

**Quality 80** adalah sweet spot (lihat diskusi Reddit r/webdev): di bawah 80 perbedaan visual mulai terlihat, di atas 80 ukuran naik tanpa perbaikan kualitas signifikan.

**Perkiraan ukuran per frame @ 1024×1024, quality 80, lossy:**

| Konten | Ukuran tipikal |
|---|---|
| Plain background solid | ~5–15 KB |
| Foto produk dengan tekstur detail (Opak, Lakar Kering) | ~40–80 KB |
| Frame dengan motion blur & banyak detail (Lakar Kering, banyak bumbu) | ~80–150 KB |
| Frame transparan (Lakar Kering PRD §2.2: "60 frame transparan") | ~30–70 KB |

**Target Karasa:**
- **60 frame × 60 KB rata-rata = ~3,6 MB total** (sebelum kompresi CDN).
- **First batch (10 frame sinkron) ≈ 600 KB** — target Web Vitals LCP < 2,5 d pada 4G (kecepatan 4G Indonesia ~5–10 Mbps) butuh transfer < 2 MB untuk first paint.
- Cloudflare Pages otomatis gzip/brotli — pada teks/biner WebP, rasio ~10–20% lebih kecil.

### Pipeline rekomendasi

```bash
# Loop 60 frame hasil render Blender
for i in $(seq -f "%03g" 0 59); do
  cwebp \
    -q 80 \
    -m 6 \
    -metadata none \
    -af \
    frames/opak_${i}.png \
    -o public/sequences/opak/${i}.webp
done
```

Flags penting:
- `-q 80` — quality (0–100).
- `-m 6` — compression method (0=fast, 6=slowest/best).
- `-metadata none` — hapus metadata EXIF (privasi + ukuran).
- `-af` — auto-filter (pilih filter terbaik per gambar).

**Atau via sharp (lebih cepat untuk CI):**

```js
import sharp from 'sharp';
import { readdir } from 'node:fs/promises';

const files = await readdir('frames/');
await Promise.all(files.map(async (f) => {
  const i = f.match(/(\d+)/)[1];
  await sharp(`frames/${f}`)
    .webp({ quality: 80, effort: 6 })
    .toFile(`public/sequences/opak/${i.padStart(3,'0')}.webp`);
}));
```

### Penamaan file & path

Sesuai snippet PRD §5.1: pola `/images/opak/frame_{frame}.webp` dengan `{frame}` 3-digit zero-padded. Untuk deployment Cloudflare Pages dengan caching optimal, tambahkan **content-hash** di nama file (`opak-frame-001-a3f9b2.webp`) dan buat manifest JSON agar ImageSequencePlayer tahu urutan & hash yang valid. Ini menghindari cache miss saat deploy baru.

---

## Cloudflare Pages SPA Routing

### Perbandingan dua pendekatan

| Pendekatan | File | Cara kerja | Kapan dipakai |
|---|---|---|---|
| **`_redirects` (legacy Pages)** | `public/_redirects` di repo → disalin ke `dist/_redirects` saat `vite build` | Cloudflare Pages parses file ini, lalu me-rewrite semua path ke `/index.html` dengan status `200` (proxy mode). | **Default untuk Pages.** Wajib ada di project berbasis Pages Functions/Git integration. |
| **`wrangler.toml` [assets]** | `wrangler.toml` di root project | Untuk **Workers with Static Assets** (fitur baru 2024–2025), bukan legacy Pages. `not_found_handling = "single-page-application"` mengarahkan semua path tak-dikenal ke `index.html`. | Hanya untuk project yang di-deploy via `wrangler deploy` (Workers). Tidak relevan untuk Pages Functions. |

**Rekomendasi untuk Karasa: gunakan `public/_redirects` saja.**

Alasannya:
1. PRD §7.1 dan §7.2 menyajikan keduanya sebagai opsi — ini redundan. Stack Karasa adalah Vite + Git-integrated Cloudflare Pages (PRD §4.1, §7), bukan Workers dengan static assets.
2. `wrangler.toml` `[assets]` didesain untuk skenario Workers; mencampurnya dengan Pages Functions bisa menimbulkan konflik config.
3. `public/_redirects` adalah cara idiomatis — disalin otomatis ke root `dist/` oleh Vite (`publicDir: 'public'`, default).

### File `public/_redirects` minimal untuk SPA

```text
# public/_redirects
# Semua route dinamis dihandle client-side oleh React Router
/*    /index.html   200
```

Format: `[source] [destination] [code?]`. Status `200` (proxy) bukan `301/302` — penting untuk SPA agar tidak terjadi double-redirect yang menambah latensi.

### Konfirmasi Vite menyalin file

Vite default `publicDir: 'public'` ([docs](https://vitejs.dev/config/shared-options.html#publicdir)) — file apa pun di `public/` disalin *as-is* ke `dist/` saat build. Jadi `public/_redirects` akan otomatis menjadi `dist/_redirects` yang dibaca Cloudflare.

Jika menggunakan custom build output (mis. `outDir: 'build'`), pastikan path wrangler/redirects tetap konsisten. PRD §7.1 menulis `directory = "./dist/"` — konsisten dengan default Vite.

### Batasan `_redirects` (untuk diketahui)

- Maks 2.000 static + 100 dynamic = 2.100 rules per file. Untuk Karasa, cukup 1 rule.
- Tidak mendukung query parameters, country/language matching, cookie matching. Untuk rule yang lebih kompleks, gunakan **Transform Rules** atau **Bulk Redirects** di dashboard (lihat bagian berikutnya).
- Redirects dieksekusi **sebelum** `_headers` — pastikan `Cache-Control` di `_headers` tidak bentrok.

---

## Cloudflare Bulk Redirects (Custom Domain)

### Langkah setup (Cloudflare Dashboard)

Dokumentasi resmi: [developers.cloudflare.com/pages/how-to/redirect-to-custom-domain](https://developers.cloudflare.com/pages/how-to/redirect-to-custom-domain).

1. **Pastikan custom domain sudah attached ke Pages project.**
   - Buka dashboard → **Workers & Pages** → pilih project → **Custom domains** → konfirmasi `karasakhasnusantara.com` (dan `www.karasakhasnusantara.com` jika perlu) ada.
   - DNS akan otomatis di-manage Cloudflare (CNAME ke `<project>.pages.dev`).

2. **Buka Bulk Redirects.**
   - Dashboard → **Account Home** → **Bulk Redirects** (atau langsung dari sidebar Rules).

3. **Buat Bulk Redirect List** dengan nilai berikut:

   | Field | Nilai |
   |---|---|
   | Source URL | `https://karasa-web-3d.pages.dev` (atau nama project sesuai dashboard) |
   | Target URL | `https://karasakhasnusantara.com` |
   | Status | `301` (permanent) |
   | **Preserve query string** | ✅ ON |
   | **Subpath matching** | ✅ ON |
   | **Preserve path suffix** | ✅ ON (default true) |
   | **Include subdomains** | ✅ ON (jaga-jaga untuk preview branch `*.karasa-web-3d.pages.dev`) |

4. **Buat Bulk Redirect Rule** yang me-refer ke list di atas, dengan kondisi "Hostname equals `<project>.pages.dev`" atau tanpa kondisi (match all). Aktifkan rule (status: Active).

5. **Verifikasi:** buka `https://karasa-web-3d.pages.dev/produk/lakar-basah` di browser; harus redirect ke `https://karasakhasnusantara.com/produk/lakar-basah` dengan status 301 dan query string (jika ada) dipertahankan.

### Mengapa keempat opsi wajib

Dari dokumentasi resmi [How Bulk Redirects work](https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/how-it-works/) dan [URL redirect parameters](https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/reference/parameters/):

- **Preserve query string** (default `false`): tanpanya, `?utm_source=ig` akan hilang. Penting untuk atribusi kampanye.
- **Subpath matching** (default `false`): tanpanya, hanya root path yang match — `/produk/lakar-basah` tidak akan ter-redirect.
- **Preserve path suffix** (default `true`): padanan dengan subpath matching — mempertahankan sisa path setelah prefix. PRD §7.3 menyebut opsi ini wajib.
- **Include subdomains** (default `false`): agar preview deploy (`<branch>.karasa-web-3d.pages.dev`) dan commit-hash preview juga ter-redirect, konsisten dengan domain utama.

### Catatan SEO

- **301 (permanent)** adalah sinyal ke search engine bahwa domain lama sudah pindah selamanya — PageRank akan ditransfer ke domain baru. Jangan gunakan 302 kecuali untuk pengujian.
- **Bulk Redirects** dieksekusi di edge Cloudflare — overhead < 5 ms. Tidak menghangatkan origin karena tidak sampai ke Pages Functions.
- **Akhiri di `?`** (preserved): sangat penting untuk shared link di Instagram/WhatsApp yang sering bawa `?utm_*`.
- Setelah propagasi (~1–24 jam untuk edge global), test dengan `curl -I https://<project>.pages.dev/produk/lakar-basah` — harus muncul `Location: https://karasakhasnusantara.com/produk/lakar-basah`.

### Catatan teknis

- Bulk Redirects dan `_redirects` file **tidak konflik** — `_redirects` untuk SPA routing, Bulk Redirects untuk domain-level redirect. Keduanya aktif paralel.
- Maks 1.000 list entries per akun (free plan). Karasa butuh 1 entry saja.
- Free plan mendukung Bulk Redirects mulai 2023; tidak ada biaya tambahan.

---

## Audit Performa 60 FPS / < 2,5 d

### Threshold & baseline (dari PRD §8)

- **First Paint (FP) < 2,5 d** pada 4G seluler Indonesia (kecepatan tipikal 4–10 Mbps).
- **60 FPS stabil** di seluler kelas menengah (mis. Samsung A-series 2 tahun ke belakang, Xiaomi Redmi Note 2 tahun ke belakang).
- **Fallback adaptif:** jika FPS turun di bawah 45, `<PerformanceMonitor>` Drei otomatis matikan shadows, turunkan `dpr`, dan disable post-processing.

### Tool audit

| Tool | Use case | URL |
|---|---|---|
| **Lighthouse** (CLI atau Chrome DevTools → Lighthouse tab) | Audit komprehensif: Performance, Accessibility, SEO, Best Practices. | [developer.chrome.com/docs/lighthouse](https://developer.chrome.com/docs/lighthouse) |
| **PageSpeed Insights** | Lighthouse run dari datacenter Google, dengan field data (CrUX) jika tersedia. | [pagespeed.web.dev](https://pagespeed.web.dev) |
| **WebPageTest** | Throttling detail, multi-location, video capture. | [webpagetest.org](https://webpagetest.org) |
| **Chrome DevTools Performance** | Profile runtime, identifikasi main-thread bottleneck. | DevTools → Performance → CPU 6× throttle |
| **Chrome DevTools Rendering** | FPS overlay, paint flashing, layout shift regions. | DevTools → More tools → Rendering |
| **Web Vitals extension** | Real-time LCP, CLS, INP di browser. | Chrome Web Store |

### Konfigurasi Lighthouse mobile (default yang dipakai)

Dari [lighthouse/docs/throttling.md](https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md) dan [debugbear.com/blog/cpu-throttling-in-chrome-devtools-and-lighthouse](https://www.debugbear.com/blog/cpu-throttling-in-chrome-devtools-and-lighthouse):

- **CPU throttling: 4× slowdown** (default pada preset mobile). Mensimulasikan mid-tier mobile.
- **Network throttling: "Slow 4G"** preset — download 1,6 Mbps, upload 750 Kbps, latency 150 ms. Merepresentasikan ~bottom 25% koneksi 4G.
- **Viewport: 412×823** (default mobile preset).
- **Device scale factor: 1.75** (mid-tier mobile).

Untuk audit Karasa (target mid-tier 2 tahun ke atas), **GUNAKAN PRESET MOBILE BAWAAN** — ini yang paling sesuai dengan target. Untuk stress test, naikkan ke **6× CPU + "Regular 4G"** (4 Mbps / 3 Mbps / 20 ms).

### Target skor Lighthouse (Web Vitals)

| Metrik | Target | Buruk | Catatan |
|---|---|---|---|
| **FCP** (First Contentful Paint) | < 1,8 d | > 3,0 d | Hero text/canvas pertama muncul. |
| **LCP** (Largest Contentful Paint) | < 2,5 d | > 4,0 d | PRD §8 menyebut "first-paint < 2,5 d" — interpretasi yang benar adalah **LCP** (bukan FP). |
| **TBT** (Total Blocking Time) | < 200 ms | > 600 ms | Main-thread blocking. |
| **CLS** (Cumulative Layout Shift) | < 0,1 | > 0,25 | Krusial untuk SPA — gunakan `min-height` di container canvas. |
| **INP** (Interaction to Next Paint) | < 200 ms | > 500 ms | Responsivitas scroll/click. |
| **Performance Score** | ≥ 90 | < 50 | Weighted average. |

### Optimasi lanjutan sesuai PRD §8

1. **Code splitting per produk.** Karasa punya 5 produk (Lakar Basah, Lakar Kuah, Opak Klasik, Opak Mini, Lakar Kering). Bundle 5 model 3D + 2 image sequence = beban besar. Strategi:
   - Vite `dynamic import()` di route handler: `const LakarBasah = lazy(() => import('./products/LakarBasah'))`.
   - React `Suspense` boundary di root dengan fallback (skeleton card).
   - Preload produk berikutnya saat scroll mendekati 80% viewport (`IntersectionObserver`).

2. **Lazy GLB prefetch saat idle.**
   - Pakai `requestIdleCallback` (lihat snippet PRD §8.2): setelah first paint, preload `lakar_kuah.glb` & `lakar_basah.glb` (Draco-compressed) saat thread idle.
   - `fetch()` + `cache.put()` di Cache API. Saat user scroll, asset sudah di-disk cache.

3. **OffscreenCanvas fallback untuk image sequence.**
   - Deteksi main-thread saturation dengan `performance.now()` delta — jika > 16 ms per frame selama 3 frame berturut-turut, pindahkan canvas ke OffscreenCanvas di Web Worker.
   - Browser support (per [web.dev/offscreen-canvas](https://web.dev/articles/offscreen-canvas) Juli 2026): Chrome 69+, Edge 79+, Firefox 105+, Safari 16.4+. Cakupan global ~96%, cukup untuk MVP.
   - Implementasi: `canvas.transferControlToOffscreen()` lalu `postMessage` ke Worker; Worker menggambar ImageBitmap dari `createImageBitmap(blob)`.

4. **Image sequence progressive preload (PRD §8.2).**
   - 10 frame pertama: `new Image()` sinkron di `useEffect` mount.
   - Frame 11–60: `requestIdleCallback(() => loadFrame(i))` — Worker-friendly.
   - Tampilkan loading state (skeleton) untuk produk yang belum preload.

5. **`<PerformanceMonitor>` Drei auto-degradation.**
   - Threshold default: matikan shadows, post-processing, dan turunkan `dpr` ke 1 jika FPS < 45 selama 0,5 d.
   - Konfigurasi: `<PerformanceMonitor onDecline={() => degrade()} onIncline={() => restore()} />`.
   - Penting: degradation **harus reversibel** — saat user close tab lain, FPS naik, dan shadows kembali.

6. **Aset lain yang dioptimasi:**
   - **GLB Draco compression** — kurangi ~80% ukuran model 3D. `gltf-transform draco input.glb output.glb`.
   - **Tailwind purge** — `content: ['./src/**/*.{ts,tsx}']` di `tailwind.config.js` agar CSS bundle kecil.
   - **Font preconnect** — untuk Google Fonts Sunda/lokal, `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`.
   - **`<link rel="preload" as="image" href="/sequences/opak/000.webp">`** — preload frame pertama image sequence untuk LCP cepat.

---

## Daftar Periksa Pra-Peluncuran

### 4.1 Distribusi & CTA

- [ ] `ProductContext` (atau `useProduct()` hook) menyimpan `productId` aktif — Lakar Basah / Lakar Kuah / Opak Klasik / Opak Mini / Lakar Kering.
- [ ] Komponen `CTABar` membaca `productId` dan memilih URL dari env constants (`VITE_SHOPEE_*`, `VITE_TOKOPEDIA_*`).
- [ ] Nomor WhatsApp hard-code `6281563339275` (konstanta di `src/config/contact.ts`, bukan inline).
- [ ] Fungsi `buildWhatsAppURL(productName)` menghasilkan URL dengan `text=` ter-encode. Test: paste ke mobile browser harusnya membuka chat dengan pesan berisi nama produk.
- [ ] Tombol `target="_blank" rel="noopener noreferrer"`, `aria-label="Hubungi Karasa via WhatsApp untuk produk {nama}"`.
- [ ] Tracking: GTM event `cta_click` dengan property `{ product, channel, url_host }`.
- [ ] Fallback desktop: jika `navigator.userAgent` desktop dan WhatsApp Web tidak tersedia, tampilkan tooltip "Buka di HP untuk chat langsung".

### 4.2 Optimasi Aset

- [ ] Semua tekstur 3D sudah dalam format KTX2 (ETC1S untuk diffuse/normal, UASTC untuk stiker kritis).
- [ ] File transcoder (`basis_transcoder.wasm`, `basis_transcoder.js`) di-copy ke `public/basis/`.
- [ ] `setTranscoderPath('/basis/')` di-set di root Canvas.
- [ ] `useKTX2` atau `KTX2Loader` dipakai — bukan `TextureLoader` untuk tekstur 3D.
- [ ] 60 frame image sequence per produk sudah WebP `q=80 m=6`, total < 4 MB per produk.
- [ ] First 10 frame preloaded sinkron; sisanya via `requestIdleCallback`.
- [ ] OffscreenCanvas worker module ditulis dan di-test di mobile throttling.
- [ ] `vite.config.ts` punya `build.rollupOptions.output.manualChunks` untuk split per produk.

### 4.3 Peluncuran Cloudflare Pages

- [ ] `public/_redirects` berisi `/* /index.html 200` (SPA fallback).
- [ ] `public/_headers` (opsional) set `Cache-Control: public, max-age=31536000, immutable` untuk `/basis/*` dan `/sequences/*` (file dengan hash).
- [ ] Build: `npm run build` → `dist/index.html` ada, `dist/_redirects` ada.
- [ ] Custom domain `karasakhasnusantara.com` attached di dashboard Pages (CNAME otomatis).
- [ ] SSL/TLS mode: "Full (strict)" (default Cloudflare).
- [ ] Bulk Redirects list dibuat, keempat opsi ON, status 301, test dengan `curl -I`.
- [ ] Lighthouse run (mobile preset) di production URL — target Performance ≥ 90, LCP < 2,5 d.
- [ ] WebPageTest run (Jakarta atau Singapore location) untuk konfirmasi throttling 4G.
- [ ] Manual smoke test di device mid-tier (Samsung A33, Redmi Note 11) — verify 60 FPS scroll di image sequence.
- [ ] 404 page: `public/404.html` dengan branding Karasa (opsional — `not_found_handling` Pages default 404 sudah cukup).

### SEO & Analytics (Lampiran A)

- [ ] `<title>` per produk (SPA route change).
- [ ] Meta description, Open Graph, Twitter Card di `index.html`.
- [ ] JSON-LD `Product` schema untuk setiap produk (price, availability, brand).
- [ ] `robots.txt` izinkan crawl; `sitemap.xml` dengan 5 URL produk.
- [ ] Google Analytics 4 / Plausible / Umami setup, event tracking CTA & scroll depth.
- [ ] Web vitals reporting (CrUX atau custom) di GA4.

---

## Riset Mentah

### Library docs (context7 MCP)

| Topik | Sumber | Catatan |
|---|---|---|
| Vite `publicDir` default `'public'` | [github.com/vitejs/vite/blob/main/docs/guide/assets.md](https://github.com/vitejs/vite/blob/main/docs/guide/assets.md) | File di `public/` disalin ke `dist/` as-is. |
| Vite `publicDir` config | [github.com/vitejs/vite/blob/main/docs/config/shared-options.md](https://github.com/vitejs/vite/blob/main/docs/config/shared-options.md) | `publicDir: string \| false` — set `false` untuk disable. |
| Three.js `KTX2Loader` API | [threejs.org/docs/pages/KTX2Loader.html](https://threejs.org/docs/pages/KTX2Loader.html) | `setTranscoderPath`, `detectSupport(renderer)`, `loadAsync`. Default transcoder path `examples/jsm/libs/basis/`. |
| Drei `useKTX2` | [drei.docs.pmnd.rs/loaders/ktx2-use-ktx2](https://drei.docs.pmnd.rs/loaders/ktx2-use-ktx2) | `useKTX2(url)` atau `useKTX2([url1, url2])`. |
| Cloudflare Pages SPA rendering | [developers.cloudflare.com/pages/llms-full.txt](https://developers.cloudflare.com/pages/llms-full.txt) | `wrangler.toml [assets] not_found_handling = "single-page-application"` adalah **Workers**, bukan Pages. Untuk Pages, gunakan `_redirects`. |
| Cloudflare Pages redirects | [developers.cloudflare.com/pages/configuration/redirects](https://developers.cloudflare.com/pages/configuration/redirects/) | Format: `[source] [destination] [code?]`. Maks 2.000 static + 100 dynamic. `/* /index.html 200` untuk SPA. |
| Cloudflare Bulk Redirects | [developers.cloudflare.com/rules/url-forwarding/bulk-redirects](https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/) | Edge-executed, max 1.000 entries (free). |

### Web riset (firecrawl MCP)

| Topik | Sumber | Catatan |
|---|---|---|
| WhatsApp deep-link format | [faq.whatsapp.com/425247423114725](https://faq.whatsapp.com/425247423114725) (tidak dapat di-scrape, dirujuk via AppsFlyer) | Format resmi: `https://wa.me/<intl-number>?text=<urlencoded>`. |
| WhatsApp deep-link praktik | [appsflyer.com/blog/deep-linking/whatsapp-deep-link](https://www.appsflyer.com/blog/deep-linking/whatsapp-deep-link/) | iOS: `whatsapp://send?text=...`. Android: `intent://send?phone=...&text=...#Intent;scheme=whatsapp;package=com.whatsapp;end`. Untuk web gunakan `wa.me`. |
| WhatsApp FAQ Stack Overflow | [stackoverflow.com/questions/21500570](https://stackoverflow.com/questions/21500570/start-whatsapp-from-url-href-with-custom-text-content) | Konfirmasi format `wa.me` sejak 2014. |
| Shopee Short Link | [help.shopee.com.my/portal/10/article/174050](https://help.shopee.com.my/portal/10/article/174050) | Untuk ID, gunakan `s.shopee.co.id/an_redir?origin_link=...&affiliate_id=...&sub_id=...`. |
| Tokopedia URL | [tokopedia.com](https://www.tokopedia.com), [seller.tokopedia.com](https://seller.tokopedia.com) | Format: `tokopedia.com/<product-slug>/p/<id>`. Tidak ada short-link publik. |
| Khronos KTX-Software | [github.com/KhronosGroup/KTX-Software](https://github.com/KhronosGroup/KTX-Software) | Repo resmi, CLI `ktx` + library. Commit terakhir Jan 2026. |
| KTX2 three.js guide | [discourse.threejs.org/t/how-to-create-ktx2-correctly/40963](https://discourse.threejs.org/t/how-to-create-ktx2-correctly/40963) | `toktx` legacy sering error; gunakan `ktx create` dari KTX-Software baru. |
| KTX2 di R3F | [stackoverflow.com/questions/71579820](https://stackoverflow.com/questions/71579820/ktx2-textures-for-glb-in-react-three-fiber), [github.com/pmndrs/drei/discussions/1335](https://github.com/pmndrs/drei/discussions/1335) | `useKTX2` adalah cara idiomatic. |
| WebP cwebp | [developers.google.com/speed/webp/docs/cwebp](https://developers.google.com/speed/webp/docs/cwebp), [github.com/webmproject/libwebp](https://github.com/webmproject/libwebp) | `cwebp -q 80 -m 6 -o output.webp`. |
| WebP ukuran | [developers.google.com/speed/webp/faq](https://developers.google.com/speed/webp/faq) | Lossy ~30% lebih kecil dari JPEG; lossless ~23% lebih kecil dari PNG. |
| Cloudflare Bulk Redirects How-To | [developers.cloudflare.com/pages/how-to/redirect-to-custom-domain](https://developers.cloudflare.com/pages/how-to/redirect-to-custom-domain/) | Empat opsi: Preserve query, Subpath matching, Preserve path suffix, Include subdomains. |
| Bulk Redirects parameter | [developers.cloudflare.com/rules/url-forwarding/bulk-redirects/reference/parameters](https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/reference/parameters/) | Default value tiap opsi & matching algorithm. |
| OffscreenCanvas | [web.dev/articles/offscreen-canvas](https://web.dev/articles/offscreen-canvas) | Chrome 69+, Edge 79+, Firefox 105+, Safari 16.4+. |
| Lighthouse throttling | [github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md](https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md) | Mobile: 4× CPU + "Slow 4G" preset. |
| DebugBear CPU throttle | [debugbear.com/blog/cpu-throttling-in-chrome-devtools-and-lighthouse](https://www.debugbear.com/blog/cpu-throttling-in-chrome-devtools-and-lighthouse) | Lighthouse CLI bisa custom `--throttling-method=devtools`. |

### Cuplikan kutipan kunci

> **Three.js `KTX2Loader` (threejs.org/docs):**
> "KTX2Loader is a loader for KTX 2.0 GPU Texture containers, specifically supporting Basis Universal GPU textures which can be transcoded to various GPU texture compression formats. It parses the KTX 2.0 container and transcodes the textures. The loader relies on Web Assembly and requires the WASM transcoder and JS wrapper, which are available from the `examples/jsm/libs/basis` directory. This loader is not compatible with older browsers that do not support Web Assembly."

> **Cloudflare Pages redirects (developers.cloudflare.com):**
> "If you are using a framework, you will often have a directory named `public/` or `static/`, and this usually contains deploy-ready assets… These files get copied over to a final output directory during the build, so this is the perfect place to author your `_redirects` file."

> **Cloudflare Bulk Redirects parameter docs:**
> "Subpath matching (default: false) — When `true`, the URL redirect applies not only to the exact source path, but also to all paths under it."
> "Preserve path suffix (default: true) — Applicable only when Subpath matching is enabled. If `true`, defines that the redirect URL will include the remaining (non-matched) path elements of the source URL."

> **AppsFlyer (mengutip WhatsApp FAQ):**
> "Format your number with the country code and no special characters, URL-encode your pre-filled message, assemble the link using the wa.me format, and add attribution parameters before deploying."
> "The message pre-populates in the chat window and the customer chooses whether to send it."

> **Shopee Short Link Guideline:**
> "Add https://{domain}/an_redir?origin_link= in front of your encoded landing link… Attach your Affiliate ID and Sub ID to track conversions: ?&affiliate_id={affiliate id}&sub_id={value1}-{value2}-{value3}-{value4}-{value5} parameters behind the encoded link."

> **Khronos KTX-Software README:**
> "KTX (Khronos Texture) is a lightweight container for textures for OpenGL, Vulkan and other GPU APIs. KTX files contain all the parameters needed for texture loading… Basis Universal currently encompasses two formats that can be quickly transcoded to any GPU-supported format: LZ/ETC1S, which combines block-compression and supercompression, and UASTC, a block-compressed format."

> **Lighthouse throttling (GoogleChrome/lighthouse):**
> "By default, Lighthouse uses a constant 4x CPU multiplier which moves a typical run in the high-end desktop bracket somewhere into the mid-tier mobile bracket."

> **web.dev OffscreenCanvas:**
> "OffscreenCanvas, as the name implies, decouples the DOM and the Canvas API by moving it off-screen… What is more, though, is that it can be used in a Web Worker, even though there is no DOM available. This enables all kinds of interesting use cases."

---

## Lampiran A — Catatan SEO & Analytics

### SEO per produk (SPA route)

Karasa adalah SPA — Google merender JS, tapi butuh bantuan untuk crawling semua state produk. Strategi:

1. **`<title>` dinamis**: `useEffect` update `document.title` saat `productId` berubah. Contoh: `Karasa — Lakar Basah (Pouch Chilli Oil Pedas)`.
2. **Open Graph & Twitter Card**:
   ```html
   <meta property="og:title" content="Lakar Basah — Karasa" />
   <meta property="og:image" content="https://karasakhasnusantara.com/og/lakar-basah.webp" />
   <meta property="og:type" content="product" />
   <meta name="twitter:card" content="summary_large_image" />
   ```
3. **JSON-LD Product schema** (di-inject saat productId berubah):
   ```json
   {
     "@context": "https://schema.org",
     "@type": "Product",
     "name": "Lakar Basah",
     "brand": { "@type": "Brand", "name": "Karasa" },
     "image": "https://karasakhasnusantara.com/images/lakar-basah-1.webp",
     "description": "Jajanan kenyal basah bersaus chilli oil dalam kemasan pouch higienis.",
     "offers": {
       "@type": "Offer",
       "url": "https://www.tokopedia.com/karasa/lakar-basah",
       "priceCurrency": "IDR",
       "price": "25000",
       "availability": "https://schema.org/InStock"
     }
   }
   ```
4. **Canonical URL**: `<link rel="canonical" href="https://karasakhasnusantara.com/produk/lakar-basah" />` di-update dinamis.
5. **Sitemap.xml** static di `public/sitemap.xml` dengan 5 URL produk + 1 home.
6. **robots.txt** izinkan crawl semua, arahkan ke sitemap.

### Analytics

- **Plausible** (privasi-first, ringan, gratis untuk < 10K pageview/bulan) atau **Umami** self-hosted. Hindari GA4 jika target audiens Eropa (GDPR).
- **Custom event tracking** via `dataLayer` (GTM) atau `window.plausible()`:
  - `cta_click` { product, channel: 'whatsapp' | 'shopee' | 'tokopedia' }
  - `product_view` { product_id, duration_ms }
  - `sequence_progress` { product_id, frame_index, percent }
  - `fps_drop` { avg_fps, products_active } (debug only, sample 1%)

### A11y (aksesibilitas)

- Tombol CTA harus punya `aria-label` yang menyebut nama produk: `aria-label="Beli Lakar Basah di Shopee"`.
- Canvas image sequence: `<canvas role="img" aria-label="Animasi rotasi 360 derajat produk Lakar Basah">` + fallback `<noscript>` dengan satu gambar statis.
- Kontras warna: PRD §3.3 palette Sunda — `#FF0000` (Beureum) di atas `#FFFFFF` (Bodas) = 4.0:1 (pass WCAG AA untuk teks besar). Untuk teks kecil, turunkan opacity atau gunakan versi `#CC0000` (rasio 5.9:1).

### Performance budget

| Aset | Budget | Catatan |
|---|---|---|
| HTML | < 30 KB gzipped | Single file. |
| CSS (Tailwind purged) | < 25 KB gzipped | Hanya kelas yang dipakai. |
| JS (initial bundle) | < 200 KB gzipped | React + R3F + Drei core; per produk di-lazy. |
| GLB (Lakar Basah, Draco) | < 800 KB gzipped | Single produk per load. |
| KTX2 per tekstur | < 500 KB (2K) | 512 px versi ~80–150 KB. |
| Image sequence (60 frame) | < 4 MB total | WebP q=80, 10 frame sinkron preload. |
| Basis transcoder (WASM) | ~300 KB | Cached after first load. |

Total first-load budget: < 1.5 MB (HTML + CSS + JS + first product 512 px textures + 10 frame sequence + transcoder) — comfortably < 2,5 d LCP pada 4G Indonesia.

---

> **Status riset:** ✅ Selesai untuk Fase 4. Tidak ada kode implementasi yang ditulis — riset ini menjadi input untuk fase eksekusi.
> **Riset selanjutnya yang mungkin dibutuhkan (di luar Fase 4):**
> - Riset A/B testing CTA copy untuk konversi optimal.
> - Riset integrasi payment gateway jika Karasa someday memutuskan untuk menambah checkout (di luar PRD saat ini).
> - Riset PWA / service worker untuk offline-first (jika user minta "lihat katalog di area tanpa sinyal").
