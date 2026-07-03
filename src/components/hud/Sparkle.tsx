interface SparkleProps {
  size?: number
  className?: string
  color?: string
  style?: React.CSSProperties
}

/**
 * Sparkle 4-pointed star — dipakai untuk "bercak" aksen emas
 * yang tersebar di sekitar hero. Pure SVG, no extra request.
 */
export function Sparkle({ size = 12, className = '', color = 'currentColor', style }: SparkleProps) {
  const s = size
  return (
    <svg
      viewBox="-10 -10 20 20"
      width={s}
      height={s}
      className={className}
      style={{ color, ...style }}
      aria-hidden="true"
    >
      <path
        d="M0,-10 L2.5,-2.5 L10,0 L2.5,2.5 L0,10 L-2.5,2.5 L-10,0 L-2.5,-2.5 Z"
        fill="currentColor"
      />
    </svg>
  )
}

/**
 * Kumpulan sparkle yang tersebar untuk ditaburkan via positioning absolut.
 * Define positions langsung di komponen ini (atau terima via prop).
 */
interface ScatterSparklesProps {
  count?: number
  className?: string
}

export function ScatterSparkles({ count = 8, className = '' }: ScatterSparklesProps) {
  // Pre-defined positions (relative percentage), bukan random agar konsisten SSR/CSR
  const positions: { top: string; left: string; size: number; delay: number; opacity: number }[] = [
    { top: '8%', left: '15%', size: 14, delay: 0, opacity: 0.7 },
    { top: '22%', left: '82%', size: 10, delay: 0.4, opacity: 0.6 },
    { top: '35%', left: '5%', size: 8, delay: 0.8, opacity: 0.5 },
    { top: '48%', left: '92%', size: 12, delay: 1.2, opacity: 0.7 },
    { top: '58%', left: '20%', size: 10, delay: 0.2, opacity: 0.5 },
    { top: '68%', left: '78%', size: 14, delay: 0.6, opacity: 0.6 },
    { top: '78%', left: '10%', size: 8, delay: 1.0, opacity: 0.5 },
    { top: '88%', left: '88%', size: 10, delay: 1.4, opacity: 0.6 },
    { top: '12%', left: '48%', size: 6, delay: 0.3, opacity: 0.4 },
    { top: '42%', left: '65%', size: 6, delay: 0.9, opacity: 0.4 },
  ]

  return (
    <div className={`pointer-events-none absolute inset-0 z-0 ${className}`} aria-hidden="true">
      {positions.slice(0, count).map((p, i) => (
        <Sparkle
          key={i}
          size={p.size}
          className="absolute animate-sparkle"
          style={{
            top: p.top,
            left: p.left,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
            color: '#B8935A',
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
