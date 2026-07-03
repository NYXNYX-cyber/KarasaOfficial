import type { ReactNode } from 'react'

type BadgeVariant = 'handmade' | 'tanpa-pengawet' | 'lokal'

const BADGE_PRESETS: Record<
  BadgeVariant,
  { label: string; bg: string; text: string; icon: ReactNode }
> = {
  handmade: {
    label: 'Handmade',
    bg: '#FFFF00', // Koneng
    text: '#FF0000', // Beureum
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
        <path d="M5 11h14l-1.5 9H6.5L5 11z" strokeLinejoin="round" />
      </svg>
    ),
  },
  'tanpa-pengawet': {
    label: 'Tanpa Pengawet',
    bg: '#008000', // Hejo
    text: '#FFFFFF', // Bodas
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3c.5.12 1 .18 1.5.18C19 19.88 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
      </svg>
    ),
  },
  lokal: {
    label: '100% Lokal',
    bg: '#0000FF', // Paul
    text: '#FFFFFF', // Bodas
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
      </svg>
    ),
  },
}

interface BrandBadgeProps {
  variant: BadgeVariant
  className?: string
}

/**
 * Badge klaim produk "Old but Gold" — Handmade, Tanpa Pengawet, 100% Lokal.
 * Diikat ke palet Sunda (PRD §3.3) via inline styles agar warna brand
 * tetap konsisten walau Tailwind purge.
 */
export function BrandBadge({ variant, className = '' }: BrandBadgeProps) {
  const preset = BADGE_PRESETS[variant]

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm text-xs font-semibold uppercase tracking-wide ${className}`}
      style={{ backgroundColor: preset.bg, color: preset.text }}
    >
      {preset.icon}
      <span>{preset.label}</span>
    </span>
  )
}
