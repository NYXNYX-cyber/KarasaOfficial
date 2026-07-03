# Riset Font — Karasa Web 3D

> Riset tipografi untuk platform eksibisi produk interaktif Karasa (jajanan tradisional Sunda: opak, lakar, citruk, emping — Rancaekek, Bandung). Tagline brand: **"Old but Gold, Classic but Fresh"**.
>
> Disusun: 3 Juli 2026 · Metode: `context7` MCP (dokumentasi Google Fonts & fontsource) + `firecrawl` MCP (riset web brand Indonesia & font Nusantara).

---

## Ringkasan Eksekutif

- **Pairing final rekomendasi:** **Fraunces** (display, serif "Old Style" variabel) + **Plus Jakarta Sans** (body, sans-serif geometris variabel). Keduanya open-source (OFL-1.1), variabel, tersedia di Google Fonts, dan kompatibel dengan pipeline Vite + `@fontsource-variable`.
- **Klarifikasi penting soal Aksara Sunda:** **Noto Serif Sundanese tidak ada** di Google Fonts (URL `fonts.google.com/noto/specimen/Noto+Serif+Sundanese` mengembalikan 404). Satu-satunya font Sundanese dari keluarga Noto di Google Fonts adalah **Noto Sans Sundanese** (variabel, wght 400–700, OFL, 89 glyph, blok Unicode `U+1B80–U+1BBF`). Font ini **hanya** berisi glyph Aksara Sunda — **bukan** glyph Latin; tidak bisa dipakai sebagai font body.
- **Plus Jakarta Sans** adalah pilihan body yang sangat kuat: dirancang oleh desainer Indonesia (**Gumpita Rahayu, Tokotype**), membawa karakter Nusantara modern tanpa eksotisasi, dan dukungan Latin Extended + Cyrillic + Vietnamese memastikan keamanan tipografi untuk semua varian copy.
- **Plus Jakarta Sans tidak mendukung Aksara Sunda** (hanya Latin/Latin Ext/Cyrillic/Vietnamese). Untuk render Aksara Sunda, muat **Noto Sans Sundanese** sebagai font aksara-saja (`unicode-range: U+1B80-1BBF, U+1CC0-1CCF`) — di-bundle terpisah agar tidak membebani CSS utama.
- **Strategi delivery:** self-host via `@fontsource-variable/*` (bukan Google Fonts CDN) untuk kontrol performa 4G (target first-paint < 2,5 d per PRD §8) dan kepatuhan privasi. Bundle variable-font untuk Latin sekitar ~25–60 kB woff2 per family.

---

## Rekomendasi Final

### Display — Fraunces
- **Google Fonts:** <https://fonts.google.com/specimen/Fraunces>
- **Font ID Google:** `Fraunces` (URL slug `Fraunces`)
- **Desainer:** Phaedra Charles, Flavia Zimbardi, Undercase Type
- **Lisensi:** SIL Open Font License 1.1 (OFL-1.1) — gratis untuk penggunaan komersial
- **Tipe:** Serif "Old Style" lembut, variabel, dengan **4 axis**: `wght` (100–900), `opsz` (Optical Size 9–144), `SOFT` (Softness 0–100), `WONK` (Wonky 0–1)
- **Subset yang didukung:** `latin`, `latin-ext`, `vietnamese`
- **Italic:** Tersedia (`wght-italic`)
- **Gaya karakter:** "vintage, rugged, business" — sesuai dengan dimensi "Old but Gold". Italic yang landai dan sumbu `WONK` memberi keunikan untuk tagline tanpa terlihat norak.
- **Bundle via Fontsource:** `@fontsource-variable/fraunces` (v5.2.9) — `npm install @fontsource-variable/fraunces`
- **Font version di Google Fonts:** v38 (per file `OFL.txt` upstream)

### Body — Plus Jakarta Sans
- **Google Fonts:** <https://fonts.google.com/specimen/Plus+Jakarta+Sans>
- **Font ID Google:** `Plus Jakarta Sans` (URL slug `Plus+Jakarta+Sans`)
- **Desainer:** Gumpita Rahayu, **Tokotype** (Indonesia)
- **Lisensi:** SIL Open Font License 1.1 (OFL-1.1)
- **Tipe:** Sans-serif geometris, variabel, dengan **1 axis**: `wght` (200–800)
- **Subset yang didukung:** `latin`, `latin-ext`, `cyrillic-ext`, `vietnamese`
- **Italic:** Tersedia (`wght-italic`)
- **Asal-usul:** Awalnya dikomisi untuk *+Jakarta City Branding* tahun 2020, kini dipakai luas oleh brand Indonesia modern — relevan secara metaforis untuk positioning Karasa sebagai brand Sunda yang terbuka.
- **Bundle via Fontsource:** `@fontsource-variable/plus-jakarta-sans` (v5.2.8) — `npm install @fontsource-variable/plus-jakarta-sans`
- **Font version di Google Fonts:** v12

### Aksara Sunda — Noto Sans Sundanese (aksara-saja)
- **Google Fonts:** <https://fonts.google.com/noto/specimen/Noto+Sans+Sundanese>
- **Font ID Google:** `Noto Sans Sundanese` (URL slug `Noto+Sans+Sundanese`)
- **Lisensi:** SIL Open Font License 1.1 (OFL-1.1)
- **Tipe:** Sans-serif "unmodulated" untuk aksara Sunda
- **Axis variabel:** `wght` (400–700) — file `NotoSansSundanese[wght].ttf`
- **Glyph:** 89, **82 karakter** di blok **Sundanese** (`U+1B80–U+1BBF`) + **Sundanese Supplement** (`U+1CC0–U+1CCF`)
- **OpenType features:** 3
- **Versi:** 2.005 · **Ditambahkan ke Google Fonts:** 2020-11-19
- **Upstream:** `github.com/notofonts/sundanese` (release v2.005, commit `8069fb6`)
- **Bundle via Fontsource:** `@fontsource-variable/noto-sans-sundanese` (v5.2.8) — `npm install @fontsource-variable/noto-sans-sundanese`
- **Penting:** Font ini **tidak memiliki glyph Latin** — hanya Sundanese. Wajib dipair dengan font Latin (Plus Jakarta Sans) dalam `unicode-range` terpisah.

---

## Alternatif Display

| Font | Style | Variable | Axis | Subset | OFL | Cocok untuk Karasa? |
|---|---|---|---|---|---|---|
| **Fraunces** (rekomendasi) | Old Style serif | Ya | wght, opsz, SOFT, WONK | latin, latin-ext, vietnamese | Ya | ✅ Paling pas — "Old but Gold" lewat sumbu WONK/opsz |
| **Playfair Display** | Transitional serif (high-contrast) | Ya (sejak 2023) | wght 400–900 + ital | latin, latin-ext, vietnamese | Ya | ⚠️ Bagus tapi sudah terlalu umum di brand Indonesia ("default Instagram") |
| **DM Serif Display** | High-contrast serif (Didone) | Tidak ada variable, hanya 1 weight tetap | – | latin, latin-ext | Ya | ⚠️ Elegan tapi kurang Sunda; kontras tinggi kurang ramah di mobile kecil |

**Mengapa Fraunces unggul:**
1. **Variable dengan 4 axis** — kontrol tipografi yang kaya untuk heading responsif di mobile vs desktop.
2. **Optical Size axis (`opsz`)** — Facebook/Google menyebut ini sebagai teknik untuk "memilih typeface yang tepat" pada skala berbeda. Cocok untuk Hero H1 (opsz≈96) vs H2 sub-bagian (opsz≈24).
3. **Softness axis** — bisa meniru kehangatan opak/kerupuk (SOFT tinggi) atau formalitas kemasan pouch (SOFT rendah).
4. **Wonky axis** — memberikan sentuhan "handmade" yang sesuai dengan positioning produk "Handmade" Karasa (PRD §6.1, Strength).
5. **Belum over-used** di antara brand Indonesia — diferensiasi.

---

## Alternatif Body

| Font | Style | Variable | Weight | Subset | OFL | Cocok untuk Karasa? |
|---|---|---|---|---|---|---|
| **Plus Jakarta Sans** (rekomendasi) | Geometric sans | Ya | 200–800 + ital | latin, latin-ext, cyrillic-ext, vietnamese | Ya | ✅ Desainer Indonesia, brand-aware, modern-clean |
| **Manrope** | Geometric humanist sans | Ya | 200–800 | latin, latin-ext, cyrillic, greek, vietnamese | Ya | ⚠️ Bagus tapi netral — kurang "Indonesia feel" |
| **Be Vietnam Pro** | Neo-grotesk | Ya (sejak 2022) | 100–900 + ital | latin, latin-ext, vietnamese | Ya | ⚠️ Adaptif Vietnam, tapi karakter agak dingin/teknis |
| **Sora** | Geometric sans (desain Jonathan Hill) | Ya | 100–800 | latin, latin-ext | Ya | ⚠️ Sangat techy — kurang heritage |
| **Inter** | UI sans (Rasmus Andersson) | Ya | 100–900 + ital | extended (incl. cyrillic, greek, vietnamese) | Ya | ❌ Terlalu UI/utility — tidak membawa karakter brand |

**Mengapa Plus Jakarta Sans unggul:**
1. **Asal-usul brand-aware:** dirancang untuk *+Jakarta City Branding* (sebuah brand Indonesia resmi), sehingga tidak terasa "imported".
2. **Open karakter:** tall x-height + geometric forms yang netral tapi hangat — mudah dibaca pada 14–16 px di mobile (PRD §8 target mobile-first).
3. **Broad subset:** Cyrillic Ext + Vietnamese = "future-proof" jika Karasa menambah copy bahasa Inggris / varian ekspor.
4. **Italic tersedia** — penting untuk penekanan & kutipan storytelling sejarah Karasa.
5. **Konsistensi dengan PRD §3.3** — bentuk geometrisnya cocok dengan palet warna Sunda (Beureum, Hejo, Paul) yang "bersih dan tegas".

---

## Font Aksara Sunda

### Verifikasi dukungan Unicode `U+1B80–U+1BBF`

| Font | Status | Catatan |
|---|---|---|
| **Noto Sans Sundanese** | ✅ Tersedia di Google Fonts | Variabel, wght 400–700, 89 glyph, OFL, v2.005 |
| **Noto Serif Sundanese** | ❌ **Tidak ada** | URL `fonts.google.com/noto/specimen/Noto+Serif+Sundanese` → **404 Page not found**. PRD §3.1 tidak menyebutkan font ini, jadi tidak ada spec yang dilanggar — tapi perlu dicatat agar tim tidak mencari font yang tidak ada. |
| **Noto Sans (Latin utama)** | ❌ Tidak mendukung blok Sundanese | Hanya Latin, Cyrillic, Greek (per dokumentasi `google/fonts/ofl/notosans`) |
| **Noto Serif (Latin utama)** | ❌ Tidak mendukung blok Sundanese | Sama seperti di atas — Latin, Cyrillic, Greek saja |
| **Plus Jakarta Sans** | ❌ Tidak mendukung blok Sundanese | latin, latin-ext, cyrillic-ext, vietnamese saja |
| **Fraunces** | ❌ Tidak mendukung blok Sundanese | latin, latin-ext, vietnamese saja |
| **Sundanese Unicode** (oleh Tim Unicode Aksara Sunda, 2008) | ⚠️ Alternatif lama | Bukan open-source modern; font ini ada di `fonts2u.com` tapi tanpa OFL/garansi maintenance |

**Kesimpulan:** Untuk render Aksara Sunda di web Karasa, satu-satunya opsi open-source + actively maintained + di Google Fonts adalah **Noto Sans Sundanese**.

### Pola loading via `unicode-range` (best practice)

Pisahkan ke file CSS terpisah agar browser **tidak download font Sundanese untuk pengguna yang tidak melihat karakter Sundanese** (90%+ pengguna Indonesia bagian barat akan tetap punya karakter ini di Unicode range mereka karena copy mungkin mengandung "Lakar", "Opak", dll dalam Latin — namun aksara Sunda hanya muncul di elemen dekoratif/spesifik).

```css
/* font-sundanese.css — diimpor terpisah, lazy */
@font-face {
  font-family: 'Noto Sans Sundanese Variable';
  src: url('@fontsource-variable/noto-sans-sundanese/files/noto-sans-sundanese-latin-wght-normal.woff2')
       format('woff2-variations');
  unicode-range: U+1B80-1BBF, U+1CC0-1CCF;
  font-display: swap;
}
```

Paket `@fontsource-variable/noto-sans-sundanese` hanya berisi 89 glyph — bobot sangat kecil (~5–10 kB woff2). Aman di-bundle default.

### Kapan menggunakan Aksara Sunda di UI?

Sesuai PRD §3.1 (motif Mega Mendung, Kujang, Pucuk Rebung, Lereng) dan §1.2 ("Old but Gold"), Aksara Sunda cocok untuk:
1. **Tagline sekunder dekoratif** (mis. "ᮞᮊᮥᮙ᮪ᮔ" / "Sakumna") di Hero section.
2. **Label produk** di hotspot info 3D (PRD §5.2 `<Html>` overlays).
3. **Tentang Karasa** — narasi heritage.

Bukan untuk body text atau CTA — gunakan Plus Jakarta Sans di sana.

---

## Font Pairing Logic — Kenapa Pas untuk "Old but Gold, Classic but Fresh"

### Analogi dimensi brand ↔ dimensi font

| Dimensi Brand (PRD §1.2) | Manifestasi tipografi |
|---|---|
| **"Old"** (warisan Sunda kuno) | Fraunces adalah serif "Old Style" — kelas tipografi yang lahir dari abad ke-15 (Venice/Caslon). Karakter "vintage/rugged" di klasifikasi Google Fonts = warisan. |
| **"Gold"** (kemuliaan/keberhargaan) | Fraunces sumbu **Optical Size** memungkinkan rendering optimal di ukuran besar (logo, hero) — terlihat "premium". |
| **"Classic"** (klasik, tipografi serif) | Pasangan klasik adalah **serif + sans-serif** — pola yang sudah terbukti 200+ tahun. Fraunces + Plus Jakarta Sans mengikuti konvensi serif-display + sans-body. |
| **"Fresh"** (Gen Z, modern) | Plus Jakarta Sans variabel dengan weight 200 (ExtraLight) hingga 800 (ExtraBold) memberi **rentang ekspresi modern** — kontras tipis di caption, bold di CTA. |

### Prinsip kontras tipografi

Mengikuti panduan Google Fonts "Pairing typefaces using the font matrix":
- **Klasifikasi berbeda** — serif (Fraunces) vs sans-serif (Plus Jakarta Sans) → cukup kontras.
- **Tujuan berbeda** — Fraunces untuk display (opsz besar), Plus Jakarta Sans untuk body (opsz kecil, geometric clarity).
- **Konsistensi mood** — keduanya warm, tidak kaku; Fraunces "soft old style" + Plus Jakarta "geometric tapi tidak dingin".
- **Konsistensi era** — keduanya modern (rilis 2020/2022) bukan typeface historis.

### Performa di mobile (PRD §8 mobile-first, target 60 FPS, first-paint < 2,5 d pada 4G)

- **Fraunces** variabel woff2 subset Latin ≈ 50–60 kB
- **Plus Jakarta Sans** variabel woff2 subset Latin ≈ 30–40 kB
- **Noto Sans Sundanese** variabel woff2 subset Latin ≈ 5–10 kB (Sundanese glyph sangat sedikit)
- **Total ~90–110 kB woff2** untuk semua 3 — masih dalam target untuk first-paint < 2,5 d pada 4G dengan brotli/gzip Vite.

---

## Strategi Self-Host & Bundle Size

### Rekomendasi: **Self-host via `@fontsource-variable/*` (npm), bukan Google Fonts CDN**

| Aspek | Google Fonts CDN | Self-host via Fontsource |
|---|---|---|
| **HTTP request tambahan** | 1 stylesheet ke `fonts.googleapis.com` + N file font ke `fonts.gstatic.com` | 0 (semuanya satu origin) |
| **GDPR / privasi** | ⚠️ IP user terkirim ke Google | ✅ Tidak ada third-party request |
| **Caching** | Browser-shared, tapi eviction unpredictable | ✅ Hash-bundled, content-hashed, predictable cache |
| **Variable font support** | Ya | Ya |
| **Subset control** | Otomatis dari `&text=` (ribet) | ✅ Otomatis per package; bisa diimpor per-axis |
| **Bundle integration dengan Vite** | Butuh `<link>` di `index.html` | ✅ `import` di `main.tsx`, ikut tree-shake + content-hash |
| **CSP** | Butuh whitelist `fonts.googleapis.com` & `fonts.gstatic.com` | ✅ Self-contained |

### Pola instalasi Vite (sesuai PRD §4.1)

```bash
npm install @fontsource-variable/fraunces \
            @fontsource-variable/plus-jakarta-sans \
            @fontsource-variable/noto-sans-sundanese
```

```ts
// src/main.tsx
import '@fontsource-variable/plus-jakarta-sans';   // 200-800, latin/latin-ext
import '@fontsource-variable/plus-jakarta-sans/wght-italic.css';
import '@fontsource-variable/fraunces';             // 100-900, latin/latin-ext
import '@fontsource-variable/fraunces/wght-italic.css';
import '@fontsource-variable/fraunces/standard-italic.css'; // opsz opsional
import '@fontsource-variable/noto-sans-sundanese';  // Sundanese + Supplement
```

Untuk mengontrol bundle size:
- Impor per weight saja jika tidak perlu seluruh rentang: `@fontsource-variable/plus-jakarta-sans/wght.css` (default 400) — tambahkan `400-italic.css` dll hanya bila dipakai.
- Subset default untuk Plus Jakarta Sans & Fraunces: `latin, latin-ext`. Cyrillic Ext dan Vietnamese ikut di-bundle — di Vite bisa dibatasi via `?subset` (cek dokumentasi `@fontsource` per font).

### Tips performa tambahan (PRD §8)

1. **Preload 1 file saja di `<head>`** — file `Plus Jakarta Sans` regular (paling pertama dirender untuk body text):
   ```html
   <link rel="preload" as="font" type="font/woff2"
         href="/assets/plus-jakarta-sans-latin-wght-normal-XXXX.woff2"
         crossorigin>
   ```
2. **`font-display: swap`** — sudah default di Fontsource; teks tampil dengan fallback dulu, baru swap ke font kustom (mencegah FOIT / blank text).
3. **Lazy-load font Sundanese** karena hanya dipakai di elemen dekoratif:
   ```ts
   useEffect(() => {
     import('@fontsource-variable/noto-sans-sundanese');
   }, []);
   ```
4. **Woff2 only** — drop `.woff`, `.ttf` untuk web modern (dukungan woff2 = 97%+ browser; per `caniuse`).
5. **Subsetting custom** — bila perlu, gunakan `glyphhanger` atau `fonttools` untuk memangkas lebih jauh (tidak perlu untuk MVP — Fontsource subset sudah cukup).

---

## Font Stack Fallback

### CSS siap-pakai (Tailwind-compatible)

```css
/* === Display (heading, hero, tagline) === */
:root {
  --font-display: 'Fraunces Variable', 'Fraunces',
                  'Cambria', 'Georgia', 'Times New Roman',
                  ui-serif, serif;
  --font-body:    'Plus Jakarta Sans Variable', 'Plus Jakarta Sans',
                  'Inter', 'Segoe UI', 'Helvetica Neue', 'Arial',
                  ui-sans-serif, system-ui, -apple-system, sans-serif;
  --font-sundanese: 'Noto Sans Sundanese Variable', 'Noto Sans Sundanese',
                    'Noto Sans', system-ui, sans-serif;
}

h1, h2, h3, .display {
  font-family: var(--font-display);
  font-variation-settings: 'opsz' 96, 'SOFT' 30, 'WONK' 0;
  font-weight: 600;
  letter-spacing: -0.02em;
}

h4, h5, h6 {
  font-family: var(--font-display);
  font-variation-settings: 'opsz' 24, 'SOFT' 50, 'WONK' 0;
  font-weight: 500;
  letter-spacing: -0.01em;
}

body, p, li, button, input, .body {
  font-family: var(--font-body);
  font-variation-settings: 'wght' 400;
  font-weight: 400;
  font-feature-settings: 'kern' 1, 'liga' 1;
}

.aksara-sunda, [lang="su"], .sundanese-script {
  font-family: var(--font-sundanese);
  font-feature-settings: 'kern' 1;
}
```

### Penjelasan stack

- **`local()`** — `'Fraunces Variable'`, `'Plus Jakarta Sans Variable'`, `'Noto Sans Sundanese Variable'` adalah nama family dari variable-font Fontsource; browser akan pakai yang sudah ter-cache di memory.
- **Tanpa `local()`** sebagai fallback utama — variabel font otomatis terdeteksi.
- **Generic family di akhir** — `serif`, `sans-serif` menjamin render di OS apapun (Times di iOS, DejaVu Serif di Linux, dsb).
- **`ui-serif` / `ui-sans-serif`** — generic modern CSS yang memilih serif/sans-serif default UI OS (San Francisco di macOS/iOS, Segoe di Windows).

### Tailwind config (untuk PRD §4.1)

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces Variable"', '"Fraunces"', 'Cambria', 'Georgia', 'serif'],
        body:    ['"Plus Jakarta Sans Variable"', '"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        sunda:   ['"Noto Sans Sundanese Variable"', '"Noto Sans Sundanese"', 'sans-serif'],
      },
    },
  },
} satisfies Config;
```

---

## Riset Mentah

### Cuplikan dari `context7` MCP (dokumentasi Google Fonts)

> **Plus Jakarta Sans — Source Metadata Investigation** (github.com/google/fonts):
> "The Plus Jakarta Sans font is a geometric sans serif variable font designed by Tokotype. It was first created in 2020 and added to Google Fonts on 2022-03-24. The font supports a weight range from ExtraLight (200) to ExtraBold (800) in both upright and italic styles. It features broad Latin and Latin Extended coverage, along with Cyrillic Extended and Vietnamese character sets, making it suitable for multilingual use."
>
> **Fraunces — Typeface** (github.com/google/fonts):
> "Fraunces is a Variable Font featuring four axes: Weight (wght), Optical Size (opsz), Softness (SOFT), and Wonky (WONK). The Softness axis influences the 'inkiness' of the typeface, while the Wonky axis allows for manual substitution of 'wonky' characters, affecting glyph lean and ball terminals."
>
> **Noto Sans Sundanese** (github.com/google/fonts):
> "Noto Sans Sundanese is a sans-serif font designed for the Sundanese script. It includes multiple weights, 89 glyphs, 3 OpenType features, and supports 82 characters across the Sundanese and Sundanese Supplement Unicode blocks."
>
> **Noto Sans Sundanese — Upstream Info** (commit `8069fb6`):
> "Noto Sans Sundanese was sourced from the notofonts/sundanese repository. The family was published as a variable font with a `wght` axis (400–700), covering the Sundanese script (Sund) used for the Sundanese language of West Java, Indonesia. The font was added to Google Fonts on 2020-11-19 and released at version 2.005."

### Cuplikan dari `firecrawl` MCP (riset web)

> **Plus Jakarta Sans di Google Fonts (verified 2026-07-03):**
> "Plus Jakarta Sans is a fresh take on geometric sans serif styles, designed by Gumpita Rahayu from Tokotype. The fonts were originally commissioned by 6616 Studio..."
>
> **Noto Sans Sundanese di Google Fonts (verified 2026-07-03):**
> Variabel, weights Regular 400, Medium 500, SemiBold 600, Bold 700. Sample text "ᮞᮊᮙᮔ". Style axis: Humanist, Variable, Business, Calm, Competent, Sincere, Rugged, Stiff, Loud.
>
> **Fraunces di Google Fonts (verified 2026-07-03):**
> Variabel dengan 4 axis (opsz, ital, soft, weight). 18 style tetap (Thin 100 → Black 900, masing-masing + italic). Desain oleh Undercase Type / Phaedra Charles / Flavia Zimbardi.
>
> **@fontsource-variable/plus-jakarta-sans (npm, v5.2.8):**
> Weights `[200,300,400,500,600,700,800]`, Styles `[italic,normal]`, Subsets `[cyrillic-ext,latin,latin-ext,vietnamese]`, Axes `[wght]`. License: OFL-1.1. Font version v12.
>
> **@fontsource-variable/fraunces (npm, v5.2.9):**
> Weights `[100,200,300,400,500,600,700,800,900]`, Styles `[italic,normal]`, Subsets `[latin,latin-ext,vietnamese]`, Axes `[opsz,wght,SOFT,WONK]`. License: OFL-1.1. Font version v38.
>
> **@fontsource-variable/noto-sans-sundanese (npm, v5.2.8):**
> Tersedia. jsDelivr CDN index terdaftar. Homebrew formula `font-noto-sans-sundanese` juga ada.

### Library & sumber yang diverifikasi

- **GitHub `google/fonts`** — upstream Google Fonts repo, sumber kebenaran untuk semua metadata font (commit hash, versi, deskripsi).
- **GitHub `notofonts/sundanese`** — repositori sumber Noto Sans Sundanese (v2.005).
- **GitHub `tokotype/PlusJakartaSans`** — repositori sumber Plus Jakarta Sans.
- **GitHub `undercasetype/Fraunces`** — repositori sumber Fraunces.
- **fonts.google.com** — katalog publik dengan CSS API.
- **fontsource.org** — registry self-host npm packages (1500+ font OFL).
- **npmjs.com** — `@fontsource-variable/*` package metadata.
- **Google Fonts Knowledge** (`fonts.google.com/knowledge`) — dokumentasi variabel font (`opsz`, `ital`, `wght` axes) & optical sizing.

---

## Lampiran: Font Sans-serif Indonesia Modern — Tabel Perbandingan

| Font | Desainer | Asal | Rilis | Variable | Weight Range | Subset | Aksara Sunda? | Rekomendasi untuk Karasa |
|---|---|---|---|---|---|---|---|---|
| **Plus Jakarta Sans** | Gumpita Rahayu (Tokotype) | 🇮🇩 Indonesia (commissioned 6616 Studio) | 2020, GF 2022 | Ya | 200–800 + ital | latin, latin-ext, cyrillic-ext, vietnamese | ❌ | ✅ **Body final** |
| **Manrope** | Mikhail Sharanda | 🇧🇾 Belarus | 2018 | Ya | 200–800 | latin, latin-ext, cyrillic, greek, vietnamese | ❌ | ⚠️ Alternatif body |
| **Be Vietnam Pro** | beGroup (Gabriel Lam dkk.) | 🇻🇳 Vietnam | 2018, variable 2022 | Ya | 100–900 + ital | latin, latin-ext, vietnamese | ❌ | ⚠️ Alternatif body (kurang Sunda) |
| **Sora** | Jonathan Hill | 🇫🇷 Prancis (untuk TYPETR) | 2019 | Ya | 100–800 | latin, latin-ext | ❌ | ❌ Terlalu techy |
| **Inter** | Rasmus Andersson | 🇸🇪 Swedia | 2017 | Ya | 100–900 + ital | extended (latin, cyrillic, greek, vietnamese) | ❌ | ❌ Terlalu UI/utility |
| **Sora** *(var reentry)* | — | — | — | — | — | — | — | — |
| **Outfit** | Smartsheet / Rodrigo Fuenzalida | 🇨🇱 Chile | 2020 | Ya | 100–900 | latin, latin-ext | ❌ | ❌ Brand-tool, bukan heritage |
| **Noto Sans (global)** | Google | 🇺🇸 USA | 2014–… | Ya | 100–900 + ital | sangat luas (per region) | ⚠️ Beberapa region Noto Sans mendukung Sundanese jika di-bundle Noto Sans全套 (CJK/Vietnam/dsb), tapi **Noto Sans Latin default tidak** | ❌ Bukan spesifik Sunda |
| **Noto Sans Sundanese** | Google (notofonts/sundanese) | 🇺🇸 USA / kontributor global | 2020-11-19 | Ya | 400–700 | sundanese + sundanese supplement | ✅ | ✅ **Aksara Sunda final** |
| **Sundanese Unicode** (Tim Unicode Aksara Sunda, 2008) | Tim Unicode Aksara Sunda | 🇮🇩 Indonesia | 2008 | Tidak | 1 weight | sundanese | ✅ | ❌ Tidak OFL, tidak maintained |

**Pemenang per kategori:**
- **Display:** Fraunces (sumbu variabel unik, karakter vintage-modern, optik size adaptif)
- **Body:** Plus Jakarta Sans (desainer Indonesia, broad subset, geometris hangat)
- **Aksara Sunda:** Noto Sans Sundanese (satu-satunya font Sundanese OFL + actively maintained di Google Fonts)

---

## Tindak Lanjut untuk Tim Pengembang

1. **Tidak ada spec di PRD yang terlanggar** — rekomendasi font display, body, dan aksara-sunda semua tersedia gratis (OFL) dan variabel.
2. **Pattern install sudah jelas** — `npm install @fontsource-variable/{fraunces,plus-jakarta-sans,noto-sans-sundanese}`.
3. **Verifikasi visual perlu dilakukan** — render beberapa kalimat Latin (mis. "Old but Gold, Classic but Fresh") dalam Fraunces dengan `WONK=1` dan tanpa, bandingkan dengan moodboard kemasan.
4. **Subsetting** — jika Vite bundle melewati 150 kB untuk semua font, pertimbangkan `glyphhanger` untuk memangkas Plus Jakarta Sans ke subset karakter PRD (Bahasa Indonesia: cari corpus kata).
5. **Aksara Sunda di konten** — keputusan UX apakah akan ada copy Sundanese, atau hanya motif visual SVG (Mega Mendung, Kujang). Jika tidak ada karakter Sundanese di copy, font Sundanese cukup di-bundle lazy.
