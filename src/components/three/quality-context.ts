import { createContext, useContext } from 'react'
import * as THREE from 'three'

/**
 * Quality context untuk adaptive rendering.
 * Per PRD §8.1: turunkan dpr, shadow, dan post-processing saat FPS < 45.
 *
 * 3 level kualitas: 'high' | 'mid' | 'low'
 * Di-share via React context dengan seluruh scene.
 */

export type Quality = 'high' | 'mid' | 'low'

export const QUALITY_PRESETS: Record<
  Quality,
  {
    dpr: [number, number]
    shadowMapSize: number
    enableShadows: boolean
    enablePostFx: boolean
  }
> = {
  high: {
    dpr: [1, 2],
    shadowMapSize: 1024,
    enableShadows: true,
    enablePostFx: true,
  },
  mid: {
    dpr: [1, 1.5],
    shadowMapSize: 512,
    enableShadows: true,
    enablePostFx: false,
  },
  low: {
    dpr: [1, 1],
    shadowMapSize: 256,
    enableShadows: false,
    enablePostFx: false,
  },
}

interface QualityContextValue {
  quality: Quality
  preset: (typeof QUALITY_PRESETS)[Quality]
}

export const QualityContext = createContext<QualityContextValue>({
  quality: 'mid',
  preset: QUALITY_PRESETS.mid,
})

export function useQuality(): QualityContextValue {
  return useContext(QualityContext)
}

// Re-export THREE namespace untuk components yang butuh THREE.WebGLShadowMap dll
export { THREE }
