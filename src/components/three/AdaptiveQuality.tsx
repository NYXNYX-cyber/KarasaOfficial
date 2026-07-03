import { PerformanceMonitor } from '@react-three/drei'
import { useState } from 'react'

import { QUALITY_PRESETS, QualityContext, type Quality } from './quality-context'

/**
 * Adaptive quality wrapper di dalam <Canvas>.
 * Memantau FPS via Drei PerformanceMonitor dan adjust kualitas scene otomatis.
 *
 * BUKAN useState di useFrame (PRD §8.1) — setState terjadi di callback event handler.
 */
export function AdaptiveQuality({ children }: { children: React.ReactNode }) {
  const [quality, setQuality] = useState<Quality>('mid')

  return (
    <QualityContext.Provider value={{ quality, preset: QUALITY_PRESETS[quality] }}>
      <PerformanceMonitor
        ms={250}
        iterations={10}
        bounds={(refreshrate) => (refreshrate > 90 ? [55, 90] : [40, 55])}
        factor={0.5}
        step={0.15}
        flipflops={3}
        onIncline={() => {
          setQuality((q) => (q === 'low' ? 'mid' : q === 'mid' ? 'high' : q))
        }}
        onDecline={() => {
          setQuality((q) => (q === 'high' ? 'mid' : q === 'mid' ? 'low' : q))
        }}
        onFallback={() => setQuality('low')}
      >
        {children}
      </PerformanceMonitor>
    </QualityContext.Provider>
  )
}
