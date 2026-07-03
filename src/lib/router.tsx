import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

/**
 * Router minimal berbasis History API — tanpa dependency.
 * State path diangkat ke Context agar shared di semua komponen.
 *
 *  - `<RouterProvider>` harus membungkus App (lihat `main.tsx`).
 *  - `useRouter()` membaca `path` reaktif (semua konsumen re-render saat path berubah).
 *  - `navigate(to)` push state + update context.
 *  - Elemen `<a data-link href="/path">` di-intercept global click handler:
 *    default link behaviour di-suppress, router dipanggil, scroll ke top.
 *  - External link (href mulai dengan `http`, `mailto:`, `tel:`, atau hash) TIDAK di-intercept.
 *  - SPA routing di Cloudflare Pages: `public/_redirects` berisi
 *    `/* /index.html 200` (sudah dikonfigurasi).
 */

export interface Router {
  path: string
  navigate: (to: string) => void
  back: () => void
}

const RouterContext = createContext<Router | null>(null)

function readPath(): string {
  if (typeof window === 'undefined') return '/'
  return window.location.pathname || '/'
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState<string>(readPath)

  // Global click interceptor + popstate listener
  useEffect(() => {
    const onPopState = () => {
      setPath(readPath())
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }
    window.addEventListener('popstate', onPopState)

    const onClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return
      }
      const target = e.target as HTMLElement | null
      if (!target) return
      const anchor = target.closest('a') as HTMLAnchorElement | null
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return
      if (!anchor.hasAttribute('data-link')) return
      if (anchor.target && anchor.target !== '' && anchor.target !== '_self') return

      if (
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#')
      ) {
        return
      }

      e.preventDefault()
      if (window.location.pathname === href) return
      window.history.pushState({}, '', href)
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
    document.addEventListener('click', onClick)

    return () => {
      window.removeEventListener('popstate', onPopState)
      document.removeEventListener('click', onClick)
    }
  }, [])

  const navigate = useCallback((to: string) => {
    if (typeof window === 'undefined') return
    if (window.location.pathname === to) return
    window.history.pushState({}, '', to)
    setPath(to)
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [])

  const back = useCallback(() => {
    if (typeof window === 'undefined') return
    window.history.back()
  }, [])

  return (
    <RouterContext.Provider value={{ path, navigate, back }}>
      {children}
    </RouterContext.Provider>
  )
}

export function useRouter(): Router {
  const router = useContext(RouterContext)
  if (!router) {
    throw new Error('useRouter must be used within <RouterProvider>')
  }
  return router
}

/** @deprecated tetap di-export untuk backward compat, no-op. */
export function installLinkInterceptor(): () => void {
  return () => undefined
}
