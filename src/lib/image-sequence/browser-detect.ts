/**
 * Deteksi kemampuan browser untuk image sequence.
 * Penting untuk fallback graceful di Safari lama / mobile low-end.
 */

export interface BrowserCapabilities {
  webp: boolean
  avif: boolean
  requestIdleCallback: boolean
  intersectionObserver: boolean
  offscreenCanvas: boolean
  webGL: boolean
  webGL2: boolean
}

/**
 * Test decode gambar kecil untuk fitur deteksi.
 * Cache hasil per session — feature detect hanya perlu sekali.
 */
function detectFormat(format: 'webp' | 'avif'): boolean {
  if (typeof document === 'undefined') return false

  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1

  const dataWebp =
    'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAUAmJaQAA3AA/v3AgAA='
  const dataAvif =
    'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK'

  const data = format === 'webp' ? dataWebp : dataAvif
  const ctx = canvas.getContext('2d')
  if (!ctx) return false

  const img = new Image()
  img.src = data
  return img.width === 1 && img.height === 1
}

export function detectCapabilities(): BrowserCapabilities {
  if (typeof window === 'undefined') {
    return {
      webp: false,
      avif: false,
      requestIdleCallback: false,
      intersectionObserver: false,
      offscreenCanvas: false,
      webGL: false,
      webGL2: false,
    }
  }

  const w = window as unknown as {
    requestIdleCallback?: unknown
    OffscreenCanvas?: unknown
    IntersectionObserver?: unknown
  }

  let webGL = false
  let webGL2 = false
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') as WebGLRenderingContext | null
    if (gl) {
      webGL = true
      const gl2 = canvas.getContext('webgl2') as WebGL2RenderingContext | null
      webGL2 = !!gl2
    }
  } catch {
    // ignore
  }

  return {
    webp: detectFormat('webp'),
    avif: detectFormat('avif'),
    requestIdleCallback: typeof w.requestIdleCallback === 'function',
    intersectionObserver: typeof w.IntersectionObserver === 'function',
    offscreenCanvas: typeof w.OffscreenCanvas === 'function',
    webGL,
    webGL2,
  }
}

let cachedCaps: BrowserCapabilities | null = null
export function getCapabilities(): BrowserCapabilities {
  if (!cachedCaps) cachedCaps = detectCapabilities()
  return cachedCaps
}
