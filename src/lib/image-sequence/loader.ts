import { getCapabilities } from './browser-detect'

/**
 * Polyfill requestIdleCallback untuk Safari < 16.4.
 * PRD §5.1 + riset Fase 2: wajib.
 */
export type IdleCallbackHandle = number
export type IdleCallback = (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void

interface IdleCallbackApi {
  requestIdleCallback(cb: IdleCallback, opts?: { timeout: number }): IdleCallbackHandle
  cancelIdleCallback(handle: IdleCallbackHandle): void
}

export function getIdleCallback(): IdleCallbackApi {
  if (typeof window === 'undefined') {
    return {
      requestIdleCallback: (cb) => {
        cb({ didTimeout: false, timeRemaining: () => 50 })
        return 0
      },
      cancelIdleCallback: () => undefined,
    }
  }

  const w = window as unknown as {
    requestIdleCallback?: (
      cb: IdleCallback,
      opts?: { timeout: number },
    ) => IdleCallbackHandle
    cancelIdleCallback?: (handle: IdleCallbackHandle) => void
  }

  if (typeof w.requestIdleCallback === 'function' && typeof w.cancelIdleCallback === 'function') {
    return {
      requestIdleCallback: (cb, opts) => w.requestIdleCallback!(cb, opts),
      cancelIdleCallback: (h) => w.cancelIdleCallback!(h),
    }
  }

  return {
    requestIdleCallback: (cb) => {
      const start = Date.now()
      return window.setTimeout(() => {
        cb({
          didTimeout: false,
          timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
        })
      }, 1) as unknown as IdleCallbackHandle
    },
    cancelIdleCallback: (handle) => {
      window.clearTimeout(handle as unknown as number)
    },
  }
}

export interface SequenceLoadProgress {
  loaded: number
  total: number
}

export interface SequenceLoaderOptions {
  basePath: string
  count: number
  ext: 'jpg' | 'webp' | 'png'
  preloadCount?: number
  onProgress?: (p: SequenceLoadProgress) => void
  onFirstFrameReady?: () => void
  onError?: (index: number, error: unknown) => void
}

export interface SequenceLoaderResult {
  images: HTMLImageElement[]
  loaded: number
  isComplete: boolean
  cancel: () => void
}

/**
 * Loader image sequence sesuai PRD §5.1 + bug-fix snippet riset Fase 2:
 * 1. useRef<HTMLImageElement[]>([]) — array, bukan single.
 * 2. onload per-image handler.
 * 3. First-frame race: gambar frame 0 segera setelah loaded pertama.
 * 4. requestIdleCallback untuk sisanya (concurrency 3).
 * 5. Lazy mount friendly — dipanggil saat scroll offset melewati threshold.
 */
export function loadImageSequence(opts: SequenceLoaderOptions): SequenceLoaderResult {
  const {
    basePath,
    count,
    ext,
    preloadCount = Math.min(5, count),
    onProgress,
    onFirstFrameReady,
    onError,
  } = opts

  const images: HTMLImageElement[] = new Array(count)
  let loaded = 0
  let firstFrameDrawn = false
  let cancelled = false
  const idle = getIdleCallback()
  let idleHandle: IdleCallbackHandle | null = null

  const fireProgress = () => {
    onProgress?.({ loaded, total: count })
  }

  const loadOne = (i: number) => {
    if (cancelled) return
    const padded = String(i).padStart(3, '0')
    const url = `${basePath}${padded}.${ext}`

    const img = new Image()
    img.decoding = 'async'
    img.src = url
    images[i] = img

    img.onload = () => {
      if (cancelled) return
      loaded += 1
      fireProgress()

      if (!firstFrameDrawn && i === 0) {
        firstFrameDrawn = true
        onFirstFrameReady?.()
      } else if (!firstFrameDrawn && i !== 0) {
        firstFrameDrawn = true
        onFirstFrameReady?.()
      }

      if (loaded === count) {
        // semua frame siap
      }
    }

    img.onerror = (e) => {
      if (cancelled) return
      onError?.(i, e)
    }
  }

  // Sync preload: 5 frame pertama (16.7% dari 30, R1)
  for (let i = 0; i < preloadCount; i++) {
    loadOne(i)
  }

  // Sisanya via requestIdleCallback, concurrency 3
  let cursor = preloadCount
  const loadBatch = (deadline: { timeRemaining: () => number }) => {
    if (cancelled) return
    let n = 0
    while (n < 3 && cursor < count) {
      loadOne(cursor)
      cursor += 1
      n += 1
    }
    if (cursor < count) {
      const remaining = deadline.timeRemaining()
      if (remaining > 0) {
        idleHandle = idle.requestIdleCallback(loadBatch)
      } else {
        idleHandle = idle.requestIdleCallback(loadBatch, { timeout: 100 })
      }
    }
  }

  if (preloadCount < count) {
    if (getCapabilities().requestIdleCallback) {
      idleHandle = idle.requestIdleCallback(loadBatch)
    } else {
      idleHandle = idle.requestIdleCallback(loadBatch)
    }
  }

  return {
    images,
    get loaded() {
      return loaded
    },
    get isComplete() {
      return loaded === count
    },
    cancel: () => {
      cancelled = true
      if (idleHandle !== null) idle.cancelIdleCallback(idleHandle)
      for (const img of images) {
        if (img) {
          img.onload = null
          img.onerror = null
        }
      }
    },
  }
}
