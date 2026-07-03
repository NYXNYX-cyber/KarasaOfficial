import { type ReactNode } from 'react'

interface SectionDividerProps {
  variant?: 'thin' | 'medium' | 'thick'
  color?: string
  className?: string
}

/**
 * Section divider dengan motif Lereng Sunda.
 * Per PRD §3.1: "Diterapkan sebagai garis pemisah layout diagonal antara
 * area teks deskriptif 2D dan kanvas visual 3D."
 */
export function SectionDivider({
  variant = 'medium',
  color = '#FF0000', // Beureum default
  className = '',
}: SectionDividerProps) {
  const strokeWidth = { thin: 1, medium: 1.5, thick: 2.5 }[variant]

  return (
    <div
      className={`w-full h-10 ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40' fill='none'%3E%3Cg stroke='${encodeURIComponent(color)}' stroke-width='${strokeWidth}' fill='none'%3E%3Cpath d='M-5,15 L15,-5'/%3E%3Cpath d='M5,25 L25,5'/%3E%3Cpath d='M15,35 L35,15'/%3E%3Cpath d='M25,45 L45,25'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '40px 40px',
      }}
      aria-hidden="true"
    />
  )
}

/**
 * Scroll progress chevron dengan Pucuk Rebung motif.
 */
export function ScrollProgress({ progress, children }: { progress: number; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1" aria-label="Scroll progress">
      <svg
        viewBox="0 0 24 24"
        className="w-4 h-4 transition-transform"
        style={{ transform: `scaleY(${progress > 0.5 ? -1 : 1})` }}
        fill={progress > 0.1 ? '#008000' : '#808080'} // Hejo aktif / Hawuk non-aktif
      >
        <path d="M5,20 L12,4 L19,20 L17,20 L12,12 L7,20 Z" />
      </svg>
      {children}
    </div>
  )
}
