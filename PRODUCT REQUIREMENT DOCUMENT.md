# **PRODUCT REQUIREMENT DOCUMENT (PRD)**

## **Platform Eksibisi Produk Interaktif Karasa (Hybrid Three.js & Image Sequence Canvas)**

| Parameter Dokumen | Detail Konten |
| :---- | :---- |
| **Nama Proyek** | Platform Web Interaktif Produk Nusantara (Karasa Web 3D) |
| **Versi Dokumen** | 2.0 (AI & Developer-Friendly Optimized) |
| **Status Proyek** | Siap untuk Pengembangan (Ready for Dev) |
| **Teknologi Utama** | React (v18/19), React Three Fiber, GSAP, Tailwind CSS, Cloudflare Pages |
| **Metode Rendering** | Hybrid Rendering (WebGL 3D \+ Canvas 2D Image Sequence) |
| **Target Hosting** | Cloudflare Pages (Serverless & Edge Distribution) |

## **1\. Deskripsi Proyek dan Filosofi Brand**

### **1.1 Visi dan Misi Brand**

Platform web interaktif ini dirancang untuk mendukung visi dan misi utama dari brand kuliner tradisional **Karasa**, yang didirikan pada tahun 2025 di Rancaekek, Bandung, Jawa Barat.1

* **Visi:** Menjadi pelopor produk makanan tradisional yang digemari generasi muda melalui inovasi kemasan modern tanpa menghilangkan cita rasa asli warisan budaya Indonesia.1  
* **Misi:** Mengangkat kembali jajanan khas Sunda (seperti opak, lakar, citruk, emping) menjadi produk yang bernilai tinggi, higienis, estetik, dan relevan secara visual di era digital.1

### **1.2 Filosofi dan Identitas Visual**

* **Nama "Karasa":** Diambil dari bahasa Sunda yang berarti "terasa" atau "memiliki rasa", melambangkan rasa yang kuat sekaligus pengalaman emosional mendalam dalam setiap gigitan.1  
* **Tagline:** *"Old but Gold, Classic but Fresh"*.1  
  * *"Old but Gold"* mencerminkan nilai warisan budaya kuno Sunda yang luhur.1  
  * *"Classic but Fresh"* mewakili cara pengemasan ulang (*repacking*) dan presentasi digital yang segar untuk menarik pasar anak muda (Gen Z).1  
* **Pendekatan Platform:** Bukan e-commerce transaksional statis biasa, melainkan katalog interaktif satu halaman (Single Page Application / SPA) yang menghadirkan pengalaman spasial imersif.2

## **2\. Klasifikasi Produk dan Metode Representasi Visual**

Untuk menjaga efisiensi kinerja pada perangkat seluler tanpa menurunkan kualitas detail visual, platform menggunakan pendekatan **Hybrid Rendering**.3 Produk dibagi ke dalam dua metode visualisasi utama 3:

### **2.1 Metode A: Real-time 3D WebGL (React Three Fiber)**

Digunakan untuk produk yang membutuhkan interaksi spasial yang kompleks atau visualisasi bagian dalam produk secara transparan.2

#### **Varian Produk: Lakar Kuah**

* **Karakteristik Fisik:** Disajikan bersama kuah hangat, bumbu kering, siomay mikro, baso kering, dan sendok plastik di dalam kemasan pouch.1  
* **Representasi Visual:** Model 3D beresolusi optimal (low-poly) dengan sistem bayangan real-time.4  
* **Fitur Utama:** **X-Ray Mode**. Penurunan nilai opasitas material kemasan secara halus untuk memunculkan isi komponen (baso, siomay, bumbu) yang melayang secara estetis di dalam ruang virtual kemasan.3

#### **Varian Produk: Lakar Basah**

* **Karakteristik Fisik:** Jajanan kenyal basah bersaus *chilli oil* merah dalam kemasan pouch higienis.1  
* **Representasi Visual:** Menggunakan material PBR (*Physically Based Rendering*) dengan map kekasaran (*roughness map*) yang rendah di area stiker tertentu untuk memunculkan pantulan mengilap basah khas saus minyak cabai.6

### **2.2 Metode B: HTML5 Canvas 2D Image Sequence**

Digunakan untuk produk dengan variasi bentuk relatif geometris namun memerlukan detail tekstur permukaan bersolusi tinggi yang sangat tajam tanpa membebani GPU perangkat seluler.3

#### **Varian Produk: Opak Klasik / Mini**

* **Karakteristik Fisik:** Keripik opak bulat tipis, renyah, berongga, dan dibakar secara handmade.1  
* **Representasi Visual:** Animasi rotasi berbasis 60 frame gambar yang dirender sebelumnya (*pre-rendered*) di Blender.3 Fokus visual pada rongga pembakaran permukaan opak dan kejernihan area jendela mika transparan kemasan.3

#### **Varian Produk: Lakar Kering**

* **Karakteristik Fisik:** Jajanan stik renyah bergelombang tak beraturan dengan balutan bumbu bubuk gurih.1  
* **Representasi Visual:** Urutan 60 frame transparan kualitas WebP berkecepatan putar yang dikendalikan posisi scroll pengguna.3 Fokus pada detail butiran bubuk cabai merah kering yang melekat pada stik lakar.3

## **3\. Desain Identitas Visual Modern Nusantara**

Gaya visual menggabungkan warisan budaya Pasundan dengan estetika minimalis kontemporer.7

### **3.1 Integrasi Motif Budaya Sunda & Jawa Barat**

* **Motif Mega Mendung:** Lambang ketenangan dan kesabaran.8 Digunakan sebagai peta tekstur dinamis pada latar belakang kanvas serta animasi shader transisi.8  
* **Motif Kujang:** Lambang perlindungan pusaka Sunda.10 Digunakan sebagai tumpuan pedestal 3D objek produk dan siluet pembatas antarmuka visual.10  
* **Motif Pucuk Rebung:** Lambang pertumbuhan dan harapan baru.8 Digunakan sebagai indikator visual progres gulir (*scroll progress*) dan pembatas grid menu navigasi.8  
* **Motif Lereng:** Lambang keselarasan hidup.8 Diterapkan sebagai garis pemisah layout diagonal antara area teks deskriptif 2D dan kanvas visual 3D.8

### **3.2 Tekstur Material dan Pencahayaan**

* **Batu Sintered Matte (Dekton):** Material abu-abu gelap bertekstur kokoh untuk kartu informasi 2D.11  
* **Kayu Sonokeling (Indonesian Rosewood):** Tekstur kayu gelap alami yang hangat untuk piringan pedestal 3D.10  
* **Tanah Liat (Clay/Tanah Liek):** Sentuhan warna terakota hangat untuk tombol UI sekunder guna mendukung kesan alami.12  
* **Sistem Pencahayaan (Fajar Priangan):** Menggunakan perpaduan cahaya terarah (*directional light*) keemasan dari timur (meniru fajar dataran tinggi Bandung) dan cahaya ambien (*ambient light*) biru indigo dingin di sisi bayangan untuk kedalaman ruang yang sinematik.9

### **3.3 Sistem Kode Warna Digital Sunda**

Warna dalam antarmuka didasarkan pada klasifikasi makna semiotika Sunda 13:

| Nama Warna Sunda | Peran Budaya dan Semiotika | Kode Heksadesimal | Penerapan pada Komponen Antarmuka Web |
| :---- | :---- | :---- | :---- |
| **Bodas** | Kesucian, kebersihan, kejujuran. 13 | \#FFFFFF | Latar belakang halaman utama, warna teks kontras tinggi, dan cahaya sorot utama. |
| **Beureum** | Keberanian, vitalitas, kekuatan, ekspresi. 13 | \#FF0000 | Tombol aksi utama (CTA), indikator interaksi aktif, dan aksen garis motif Lereng. |
| **Koneng** | Keagungan, kejayaan, kehangatan fajar. 13 | \#FFFF00 | Warna dasar stiker kemasan premium, efek pendaran cahaya tepi (*rim light*) pada model 3D. |
| **Hejo** | Kemakmuran, kesuburan alam Priangan, kesegaran. 13 | \#008000 | Warna aksen sekunder, representasi elemen alami daun teh, dan indikator produk organik. |
| **Paul** | Kedalaman spiritual, langit mendung, ketenangan. 13 | \#0000FF | Gradien latar belakang kanvas WebGL, representasi dasar pola awan Mega Mendung. |
| **Hawuk** | Keseimbangan, netralitas tanah abu vulkanik. 13 | \#808080 | Batas kontainer UI, teks deskripsi sekunder, dan bayangan material batu alam. |

## **4\. Arsitektur Teknis dan Pipeline Aset**

### **4.1 Pustaka Pengembangan Utama (*Tech Stack*)**

* **Vite:** Server pengembangan dan pembangun aset statis modular yang cepat.  
* **React (v18 atau v19):** Manajemen siklus hidup antarmuka dan sinkronisasi status aplikasi.14  
* **React Three Fiber (R3F) & Drei:** Komponen WebGL deklaratif dan helper penunjang (kamera, kontrol orbit).2  
* **GSAP (GreenSock) & ScrollTrigger:** Pengendali linear koordinat frame sequence Canvas berdasarkan posisi scroll.  
* **Tailwind CSS & Framer Motion:** Penataan tata letak HUD 2D mengambang dan animasi transisi teks.2

### **4.2 Pipeline Optimalisasi Aset Visual**

Untuk menjamin kecepatan render awal situs di bawah **2.5 Detik** pada jaringan 4G seluler 6:

PIPELINE ASET 3D (LAKAR BASAH & KUAH)  
 ➔ ➔ ➔

PIPELINE ASET IMAGE SEQUENCE (OPAK & LAKAR KERING)  
 ➔ ➔ ➔ \[Asynchronous Cache Preloading in browser Memory\]

## **5\. Fitur Interaktif dan Kode Implementasi**

### **5.1 Komponen Pembaca Image Sequence (Canvas 2D \+ GSAP)**

Gunakan komponen React di bawah ini untuk mengontrol rendering urutan gambar WebP berdasarkan pergerakan scroll pengguna di viewport:

TypeScript  
import { useEffect, useRef } from "react";  
import { gsap } from "gsap";  
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ImageSequenceProps {  
  totalFrames: number;  
  imagePathPattern: string; // Contoh: "/images/opak/frame\_{frame}.webp"  
}

export function ImageSequencePlayer({ totalFrames, imagePathPattern }: ImageSequenceProps) {  
  const canvasRef \= useRef\<HTMLCanvasElement\>(null);  
  const scrollContainerRef \= useRef\<HTMLDivElement\>(null);  
  const images \= useRef\<HTMLImageElement\>();  
  const sequenceObj \= useRef({ frame: 0 });

  useEffect(() \=\> {  
    const canvas \= canvasRef.current;  
    if (\!canvas) return;  
    const context \= canvas.getContext("2d");  
    if (\!context) return;

    // Preloading seluruh frame ke dalam memori browser secara mandiri  
    for (let i \= 0; i \< totalFrames; i++) {  
      const img \= new Image();  
      img.src \= imagePathPattern.replace("{frame}", String(i).padStart(3, "0"));  
      images.current.push(img);  
    }

    const drawFrame \= (frameIndex: number) \=\> {  
      const img \= images.current\[frameIndex\];  
      if (img && img.complete && context) {  
        context.clearRect(0, 0, canvas.width, canvas.height);  
        context.drawImage(img, 0, 0, canvas.width, canvas.height);  
      }  
    };

    // Tampilkan frame pertama ketika aset terload  
    images.current.onload \= () \=\> drawFrame(0);

    // Animasi perubahan indeks frame menggunakan GSAP ScrollTrigger  
    const trigger \= gsap.to(sequenceObj.current, {  
      frame: totalFrames \- 1,  
      snap: "frame",  
      ease: "none",  
      scrollTrigger: {  
        trigger: scrollContainerRef.current,  
        start: "top top",  
        end: "+=300svh", // Ruang usapan scroll fiktif  
        scrub: 0.5,      // Tingkat kelembapan transisi frame  
        pin: true,       // Jaga canvas tetap statis selama proses scroll memutar  
      },  
      onUpdate: () \=\> drawFrame(sequenceObj.current.frame),  
    });

    return () \=\> {  
      trigger.scrollTrigger?.kill();  
      trigger.kill();  
    };  
  }, \[totalFrames, imagePathPattern\]);

  return (  
    \<div ref\={scrollContainerRef} className\="relative w-full h-\[300svh\]"\>  
      \<div className\="sticky top-0 left-0 w-full h-screen flex items-center justify-center"\>  
        \<canvas   
          ref\={canvasRef}   
          width\={1024}   
          height\={1024}   
          className\="max-w-\[80vw\] max-h-\[80vh\] object-contain"   
        /\>  
      \</div\>  
    \</div\>  
  );  
}

### **5.2 Fitur Kontrol Kamera & Interaksi Scene 3D (R3F)**

* **\<ScrollControls\> (Drei):** Melacak progres scroll global untuk menggeser posisi kamera (camera.position) di sepanjang jalur spline dari produk Lakar Basah ke Lakar Kuah secara mulus.15  
* **\<OrbitControls\> Terbatas:** Membolehkan rotasi manual 360 derajat saat kamera berada di titik fokus salah satu produk.1 Parameter minPolarAngle dan maxPolarAngle wajib diatur agar sudut kamera tidak mendongak menembus bagian bawah pedestal Kujang.10  
* **Hotspot Informasi Komponen (\<Html\> Drei):** Menaruh titik target lingkaran melayang pada koordinat model 3D (misalnya di area penutup klip kemasan atau stiker) yang merespons pointer click untuk memunculkan detail edukasi produk.2

## **6\. Integrasi Strategi Distribusi dan Matriks SWOT pada UX**

Situs web ini dirancang sebagai jembatan utama yang menghubungkan kampanye kesadaran merek digital (*digital brand awareness*) Karasa dengan ekosistem penjualan fisik dan online mereka.1

### **6.1 Penerapan Analisis SWOT ke dalam Fitur UI/UX**

Keputusan fungsional tata letak dan interaksi diatur langsung untuk memaksimalkan kekuatan serta memitigasi kelemahan internal brand 1:

| Dimensi SWOT Karasa | Detail Temuan Analisis Internal | Konversi Solusi ke dalam Fitur Antarmuka 2D / WebGL |
| :---- | :---- | :---- |
| **Strength (Kekuatan)** | Cita rasa autentik Jawa Barat, produk tahan lama tanpa pengawet, kemasan ulang modern yang estetik dan membanggakan budaya lokal. 1 | Penempatan teks melayang (*floating 3D/2D badges*) yang menonjolkan klaim "Handmade", "Tanpa Pengawet", serta integrasi cerita sejarah kuliner Sunda pada setiap pergantian halaman. 2 |
| **Weakness (Kelemahan)** | Edukasi konsumen tentang konsep "tradisional yang modern" masih butuh penguatan, varian produk awal masih terbatas. 1 | Menyediakan simulasi interaksi visual yang menunjukkan proses transformasi dari camilan tradisional kasar menjadi produk siap saji higienis yang dikemas secara estetik dalam wadah kedap udara. 2 |
| **Opportunity (Peluang)** | Meningkatnya kebanggaan anak muda pada produk lokal, potensi besar pasar oleh-oleh, hampers, dan paket bundel musiman. 1 | Menambahkan fitur "Kustomisasi Paket Hampers" secara langsung dalam visualizer, di mana pengguna dapat memilih dan menggabungkan beberapa produk (misal: Opak dan Lakar Kering) ke dalam kotak anyaman bambu virtual. 8 |
| **Threat (Ancaman)** | Persaingan ketat dengan produsen langsung yang bisa menjual dengan harga lebih murah tanpa repackaging. 1 | Penonjolan aspek premium melalui detail visual kemasan (terutama pada Image Sequence yang super-detail), kebersihan bersegel mesin sealer, kepraktisan sendok terintegrasi, dan kemudahan akses instan langsung beli. 3 |

### **6.2 Sistem Rujukan Distribusi Instan (CTA Offline & Online)**

Platform web Karasa tidak menggunakan modul pembayaran langsung (*checkout payment gateway*) untuk menjaga kesederhanaan operasional serverless front-end.1 Sistem pembayaran menggunakan rujukan pihak ketiga 1:

* **Tautan Resmi e-Commerce:** Menyediakan tombol pembelian yang mengarahkan pengguna ke akun official Shopee dan Tokopedia Karasa melalui mekanisme deep-linking.1  
* **Pemesanan Mandiri WhatsApp Business:** Integrasi tombol pemesanan langsung ke nomor resmi WhatsApp Karasa (+62 815-6333-9275) dengan templat pesan otomatis dinamis yang mendeteksi nama produk aktif.1  
* **Widget Peta Skye Point & Skye Booth:** Peta lokasi sekolah/lingkungan tempat Skye Booth dan Skye Point didirikan untuk memudahkan siswa atau guru membeli secara langsung tanpa ongkos kirim.1  
* **Direktori Mitra Pusat Oleh-oleh:** Sistem pencarian titik pusat oleh-oleh di wilayah Bandung yang menyediakan produk Karasa secara konsinyasi.1

## **7\. Konfigurasi Hosting Cloudflare Pages dan Routing**

### **7.1 Konfigurasi SPA Routing via wrangler.toml**

Konfigurasi file Wrangler ini penting untuk memastikan bahwa semua URL navigasi browser dialihkan secara internal ke berkas index.html utama dengan kode respons status 200 OK 17:

Ini, TOML  
\# wrangler.toml  
name \= "karasa-web-3d"  
compatibility\_date \= "2026-07-02"

\[assets\]  
directory \= "./dist/" \# Direktori output build kompilasi Vite  
not\_found\_handling \= "single-page-application" \# Menangani route dinamis client-side

### **7.2 Penerapan Berkas \_redirects Tradisional**

Jika proses rilis menggunakan integrasi repositori git langsung di dashboard Cloudflare Pages, letakkan file \_redirects (tanpa ekstensi) di folder **public/\_redirects** (sehingga tersalin ke root folder dist/ setelah proses build Vite selesai) 18:

# **\_redirects**

# **Mengarahkan seluruh rute dinamis agar ditangani secara internal oleh SPA router React**

/\* /index.html 200

### **7.3 Konfigurasi Bulk Redirect Domain Kustom**

Guna menyatukan otoritas domain untuk kepentingan performa SEO, lakukan pengalihan domain bawaan \*.pages.dev menuju domain kustom (contoh: karasakhasnusantara.com) di panel dasbor Cloudflare melalui pengaturan **Bulk Redirects** dengan mengaktifkan opsi berikut 19:

* **Preserve query string** (Mempertahankan parameter query penjualan).  
* **Subpath matching** (Mencocokkan jalur sub-halaman produk).  
* **Preserve path suffix** (Mempertahankan akhiran alamat URL).

## **8\. Optimasi Performa Mobile-First (Target: 60 FPS)**

Target platform adalah perangkat seluler kelas menengah berumur dua tahun ke atas dengan FPS stabil di kisaran 60 FPS dan waktu muat cepat.6

### **8.1 Optimasi Komputasi WebGL**

* **Mutasi Langsung useFrame (Anti State Re-render):** **Dilarang keras** menggunakan useState di dalam loop putaran render useFrame.5 Lakukan mutasi rotasi atau transformasi langsung melalui referensi element model (meshRef.current) agar tidak memicu render ulang DOM virtual React secara terus menerus.5  
* **Lazy Loading Texture:** Tekstur detail beresolusi tinggi ($1024 \\text{ px}$ \- $2048 \\text{ px}$) baru dimuat secara asinkron setelah pengguna berhenti melakukan scroll dan mulai memutar produk secara manual.3 Render awal hanya menggunakan tekstur dasar berukuran rendah ($512 \\text{ px}$).3  
* **\<PerformanceMonitor\> Integration:** Memantau frame rate di sisi client.20 Jika performa turun di bawah $45 \\text{ FPS}$, platform secara otomatis mematikan bayangan real-time, menurunkan pixel ratio kanvas, dan mendonaktifkan efek post-processing (bloom/depth of field).3

### **8.2 Optimasi Render Canvas Image Sequence**

* **Progressive Preloading:** Memuat 10 frame pertama terlebih dahulu untuk kesiapan visual awal.3 Frame ke-11 s.d 60 dimuat di latar belakang menggunakan requestIdleCallback browser saat thread utama sedang dalam status menganggur.3  
* **OffscreenCanvas:** Jika proses komputasi thread utama terdeteksi berat karena interaksi UI 2D, rendering frame sequence pada canvas dialihkan menuju OffscreenCanvas di dalam thread Web Worker terpisah.3

## **9\. Rencana Implementasi dan Peta Jalan Sistem**

Pengembangan dibagi menjadi empat fase pengerjaan selama **8 Minggu** terstruktur:

Minggu 1-2: Fase Desain & Aset Visual Nusantara  
 ├── 1.1 Pemodelan 3D kemasan rendah poligon (Lakar Basah & Lakar Kuah) di Blender.  
 ├── 1.2 Pra-render 60 frame rotasi 360 derajat (Opak Klasik & Lakar Kering).  
 └── 1.3 Penyusunan aset 2D, pembuatan pola SVG Mega Mendung dan Kujang.

Minggu 3-4: Arsitektur Multi-Engine & Kompiliasi R3F  
 ├── 2.1 Konversi GLB terkompresi Draco menggunakan utilitas gltfjsx.  
 ├── 2.2 Penataan pencahayaan fajar dataran tinggi Bandung dan material PBR.  
 └── 2.3 Pembuatan komponen ImageSequencePlayer berbasis Canvas 2D di React.

Minggu 5-6: Fitur Interaksi Gulir & Hotspot Data  
 ├── 3.1 Integrasi ScrollControls untuk transisi kamera 3D antar-produk.  
 ├── 3.2 Sinkronisasi GSAP ScrollTrigger dengan ImageSequencePlayer Canvas 2D.  
 └── 3.3 Pembuatan titik informasi melayang (Html Overlay) detail produk.

Minggu 7-8: Integrasi Distribusi, Optimasi, & Peluncuran  
 ├── 4.1 Penghubungan tombol CTA ke Shopee, Tokopedia, dan WhatsApp.  
 ├── 4.2 Penerapan kompresi KTX2, optimasi WebP, dan uji performa target 60 FPS.  
 └── 4.3 Konfigurasi berkas \_redirects, integrasi domain kustom Cloudflare Pages.

#### **Karya yang dikutip**

1. Proposal Bisnis\_Shillurahmi Wulandari Setioreni.pdf  
2. 3D UI Design with React Three Fiber \+ Tailwind: Bridging Web Design and 3D Experiences, diakses Juli 3, 2026, [https://www.jogdigitalinnovations.com/blogs/3d-ui-design-with-react-three-fiber-tailwind-bridging-web-design-and-3d-experiences](https://www.jogdigitalinnovations.com/blogs/3d-ui-design-with-react-three-fiber-tailwind-bridging-web-design-and-3d-experiences)  
3. What is a 3D product configurator? Definition, benefits & workflow \- Danthree Studio, diakses Juli 3, 2026, [https://www.danthree.studio/en/glossary/3d-product-configurator](https://www.danthree.studio/en/glossary/3d-product-configurator)  
4. WebGL 3D Facts and Information \- Three.js Resources, diakses Juli 3, 2026, [https://threejsresources.com/facts](https://threejsresources.com/facts)  
5. 100 Three.js Tips That Actually Improve Performance (2026) \- Utsubo, diakses Juli 3, 2026, [https://www.utsubo.com/blog/threejs-best-practices-100-tips](https://www.utsubo.com/blog/threejs-best-practices-100-tips)  
6. Product configurators \- cclemang, diakses Juli 3, 2026, [https://cclemang.com/en/services/configurators/](https://cclemang.com/en/services/configurators/)  
7. Commercial | ajsr \- Wix.com, diakses Juli 3, 2026, [https://ajsuriarahim.wixsite.com/ajsr/commercial](https://ajsuriarahim.wixsite.com/ajsr/commercial)  
8. Explore Sundanese Batik Motifs Of West Java \- Andlight News Hub News., diakses Juli 3, 2026, [https://purchase.andlight.dk/andlight-news/explore-sundanese-batik-motifs-of-west-java-1767647772](https://purchase.andlight.dk/andlight-news/explore-sundanese-batik-motifs-of-west-java-1767647772)  
9. West Java Pattern royalty-free images \- Shutterstock, diakses Juli 3, 2026, [https://www.shutterstock.com/search/west-java-pattern](https://www.shutterstock.com/search/west-java-pattern)  
10. \_Kujang\_ (weapon) — Grokipedia, diakses Juli 3, 2026, [https://grokipedia.com/page/Kujang\_(weapon)](https://grokipedia.com/page/Kujang_\(weapon\))  
11. Discover Crystal Jade's 2025 Mooncake Collection: Tradition Meets Whimsy \- Lemon8, diakses Juli 3, 2026, [https://www.lemon8-app.com/@nahmj16/7551073001669034514?region=sg](https://www.lemon8-app.com/@nahmj16/7551073001669034514?region=sg)  
12. Batik in Indonesia \- Wikipedia, diakses Juli 3, 2026, [https://en.wikipedia.org/wiki/Batik\_in\_Indonesia](https://en.wikipedia.org/wiki/Batik_in_Indonesia)  
13. (PDF) SUNDANESE COLORS \- ResearchGate, diakses Juli 3, 2026, [https://www.researchgate.net/publication/328190095\_SUNDANESE\_COLORS](https://www.researchgate.net/publication/328190095_SUNDANESE_COLORS)  
14. Introduction \- React Three Fiber \- docs, diakses Juli 3, 2026, [https://docs.pmnd.rs/react-three-fiber?ref=trap.jp](https://docs.pmnd.rs/react-three-fiber?ref=trap.jp)  
15. Portfolio: 3D World \- Wawa Sensei, diakses Juli 3, 2026, [https://wawasensei.dev/courses/react-three-fiber/lessons/portfolio](https://wawasensei.dev/courses/react-three-fiber/lessons/portfolio)  
16. Explore Unique Sundanese Batik Motifs From West Java \- Andlight News Hub News., diakses Juli 3, 2026, [https://purchase.andlight.dk/andlight-news/explore-unique-sundanese-batik-motifs-from-west-java-1767647772](https://purchase.andlight.dk/andlight-news/explore-unique-sundanese-batik-motifs-from-west-java-1767647772)  
17. Single Page Application (SPA) \- Workers \- Cloudflare Docs, diakses Juli 3, 2026, [https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)  
18. Redirects · Cloudflare Pages docs, diakses Juli 3, 2026, [https://developers.cloudflare.com/pages/configuration/redirects/](https://developers.cloudflare.com/pages/configuration/redirects/)  
19. Set Domain Redirects for Cloudflare Pages | by Vinh Pham \- Medium, diakses Juli 3, 2026, [https://medium.com/@vinhdw/set-domain-redirects-for-cloudflare-pages-f53170510ebf](https://medium.com/@vinhdw/set-domain-redirects-for-cloudflare-pages-f53170510ebf)  
20. Building a Fully-Featured 3D World in the Browser with Blender and Three.js | Codrops, diakses Juli 3, 2026, [https://tympanus.net/codrops/2025/04/08/3d-world-in-the-browser-with-blender-and-three-js/](https://tympanus.net/codrops/2025/04/08/3d-world-in-the-browser-with-blender-and-three-js/)  
21. Develop AR/VR with React \- Makers Den, diakses Juli 3, 2026, [https://makersden.io/blog/ar-vr-dev-reactjs](https://makersden.io/blog/ar-vr-dev-reactjs)