import { useEffect, useRef, useState } from 'react'

import type { FrameConfig } from '@/types/product'

interface ScrollDrivenImageSequenceProps {
  config: FrameConfig
  productName: string
  /**
   * Tinggi section dalam vh. Makin besar = makin pelan transisi frame per scroll.
   * Default: `Math.max(220, count * 1.5)` → ±1.5vh per frame, minimal 220vh.
   */
  scrollHeightVh?: number
}

/**
 * ScrollDrivenImageSequence — image sequence 360° yang di-drive oleh PAGE SCROLL.
 *
 * Konsep:
 *  - Section ini TINGGI (200-400vh) dan berfungsi sebagai scroll-driven canvas.
 *  - Di dalamnya ada container `position: sticky` full-viewport yang menahan
 *    gambar di tengah layar sementara user scroll ke bawah.
 *  - Progress scroll (0..1) di-mapping ke frame index (0..count-1).
 *  - Saat section sudah ter-scroll penuh, container "lepas" dan halaman
 *    scroll natural ke konten berikutnya (deskripsi produk, CTA, dll).
 *
 * Implementasi:
 *  - window scroll listener (passive) + requestAnimationFrame throttle
 *    untuk performa (PRD §8.1 — no useState in useFrame equivalent untuk DOM).
 *  - Preload: 5 frame pertama sinkron, sisanya via requestIdleCallback.
 *  - Tidak mencekal page scroll — semua wheel/touch event diteruskan ke body.
 */
export function ScrollDrivenImageSequence({
  config,
  productName,
  scrollHeightVh,
}: ScrollDrivenImageSequenceProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const frameIndexRef = useRef(0)
  const [ready, setReady] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [loadedCount, setLoadedCount] = useState(0)

  // Deteksi mobile/low-end — harus sebelum heightVh.
  const isMobileRef = useRef(false)
  if (isMobileRef.current === false && typeof window !== 'undefined') {
    isMobileRef.current =
      window.matchMedia('(max-width: 640px), (hover: none) and (pointer: coarse)').matches
  }

  const heightVh = scrollHeightVh ?? (
    isMobileRef.current
      ? Math.max(500, config.count * 16)
      : Math.max(220, config.count * 1.5)
  )
  const startIndex = config.startIndex ?? 0
  const padWidth = config.padWidth ?? 3

  const buildUrl = (i: number) => {
    const fileIndex = startIndex + i
    const padded = String(fileIndex).padStart(padWidth, '0')
    return `${config.basePath}${padded}.${config.ext}`
  }

  // === Preload frames ===
  useEffect(() => {
    let cancelled = false
    const images: HTMLImageElement[] = new Array(config.count)
    imagesRef.current = images

    // Mobile: preload 3 frame pertama; desktop: 5
    const preloadCount = Math.min(isMobileRef.current ? 3 : 5, config.count)
    let firstFrameDrawn = false

    const handleLoad = (i: number) => {
      if (cancelled) return
      setLoadedCount((c) => c + 1)
      if (!firstFrameDrawn) {
        firstFrameDrawn = true
        setReady(true)
        if (imgRef.current && images[0] && images[0].complete) {
          imgRef.current.src = images[0].src
        }
      }
    }

    const handleError = (i: number) => {
      console.warn(`[ScrollDrivenImageSequence] Gagal load frame ${i + 1}`)
    }

    for (let i = 0; i < preloadCount; i++) {
      const img = new Image()
      img.alt = `${productName} frame ${i + 1}`
      img.onload = () => handleLoad(i)
      img.onerror = () => handleError(i)
      img.src = buildUrl(i)
      images[i] = img
    }

    // Sisanya idle-load — concurrency 2 di mobile, 3 di desktop
    let cursor = preloadCount
    const concurrency = isMobileRef.current ? 2 : 3
    const idle = (cb: () => void) => {
      const w = window as unknown as {
        requestIdleCallback?: (cb: () => void) => number
      }
      if (typeof w.requestIdleCallback === 'function') {
        w.requestIdleCallback(cb)
      } else {
        setTimeout(cb, 1)
      }
    }
    const loadBatch = () => {
      if (cancelled) return
      let n = 0
      while (n < concurrency && cursor < config.count) {
        const i = cursor
        const img = new Image()
        img.alt = `${productName} frame ${i + 1}`
        img.onload = () => handleLoad(i)
        img.onerror = () => handleError(i)
        img.src = buildUrl(i)
        images[i] = img
        cursor += 1
        n += 1
      }
      if (cursor < config.count) idle(loadBatch)
    }
    if (cursor < config.count) idle(loadBatch)

    return () => {
      cancelled = true
    }
  }, [config.basePath, config.count, config.ext, startIndex, padWidth, productName])

  // === Scroll listener — mapping progress ke frame ===
  useEffect(() => {
    if (!ready) return
    const el = sectionRef.current
    if (!el) return

    let raf = 0
    const update = () => {
      raf = 0
      const sectionEl = sectionRef.current
      if (!sectionEl) return
      const rect = sectionEl.getBoundingClientRect()
      const viewportH = window.innerHeight
      const scrollable = sectionEl.offsetHeight - viewportH
      if (scrollable <= 0) {
        // section lebih pendek dari viewport: tampilkan frame pertama
        if (frameIndexRef.current !== 0) {
          frameIndexRef.current = 0
          setCurrentFrame(0)
          const img = imagesRef.current[0]
          if (img && imgRef.current) imgRef.current.src = img.src
        }
        return
      }
      // rect.top negatif = section sudah ke-scroll ke atas
      const scrolled = Math.max(0, -rect.top)
      const progress = Math.min(1, scrolled / scrollable)
      const target = Math.round(progress * (config.count - 1))
      if (target !== frameIndexRef.current) {
        frameIndexRef.current = target
        setCurrentFrame(target)
        const img = imagesRef.current[target]
        if (img && imgRef.current && img.complete && img.naturalWidth > 0) {
          imgRef.current.src = img.src
        }
      }
    }

    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    update() // initial sync

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [ready, config.count])

  return (
    <div
      ref={sectionRef}
      style={{ height: `${heightVh}vh` }}
      className="relative"
      aria-label={`Image sequence ${productName} — scroll untuk memutar`}
    >
      <div className="sticky top-0 h-screen w-full flex items-center justify-center">
        <div className="relative w-full max-w-md aspect-[9/16] mx-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            alt={`${productName} frame ${currentFrame + 1}`}
            draggable={false}
            className="w-full h-full object-contain drop-shadow-xl"
          />

          {!ready && (
            <div className="absolute inset-0 shimmer flex items-center justify-center rounded-xl">
              <span className="text-xs uppercase tracking-[0.3em] text-coklat-muda">
                Memuat sequence…
              </span>
            </div>
          )}

          {/* Frame counter */}
          <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-krem/90 border border-emas-muda/50 text-[11px] font-mono text-coklat tabular-nums shadow-sm">
            {currentFrame + 1}/{config.count}
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-4 left-4 right-24 h-1 rounded-full bg-krem-tua/60 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emas-muda to-emas-tua transition-[width] duration-75"
              style={{ width: ready ? `${(currentFrame / Math.max(1, config.count - 1)) * 100}%` : '0%' }}
            />
          </div>

          {/* Scroll hint — fade out setelah progress > 5% */}
          {ready && currentFrame < 5 && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-coklat-sangat-muda text-xs uppercase tracking-[0.3em] animate-pulse pointer-events-none">
              ↓ Scroll untuk memutar
            </div>
          )}

          {/* Frame loaded indicator */}
          <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-krem-muda/80 border border-emas-muda/40 text-[10px] text-coklat-sangat-muda">
            {loadedCount}/{config.count} frame
          </div>
        </div>
      </div>
    </div>
  )
}
