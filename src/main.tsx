import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource-variable/playfair-display'
import '@fontsource-variable/fraunces'
import '@fontsource-variable/plus-jakarta-sans'
import '@fontsource-variable/noto-sans-sundanese'

import './index.css'
import { App } from './App'
import { RouterProvider } from './lib/router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider>
      <App />
    </RouterProvider>
  </StrictMode>,
)
