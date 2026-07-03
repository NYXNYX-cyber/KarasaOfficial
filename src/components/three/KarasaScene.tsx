import { Canvas } from '@react-three/fiber'
import { ACESFilmicToneMapping, Color } from 'three'
import { Suspense } from 'react'

import { LightingSetup } from './LightingSetup'
import { AdaptiveQuality } from './AdaptiveQuality'
import { LakarKuah } from './LakarKuah'
import { PedestalKujang } from './PedestalKujang'

/**
 * KarasaScene — viewer 3D STATIS untuk hero section.
 * HANYA menampilkan Lakar Kuah di atas pedestal Kujang. Tanpa OrbitControls
 * (bukan drag-to-rotate) — sesuai permintaan: hero adalah visual diam yang
 * TIDAK menangkap wheel event, sehingga page scroll berjalan natural
 * melewati area ini.
 *
 * Catatan:
 *  - autoRotate={false} (R4) — produk tetap diam.
 *  - Tanpa OrbitControls = tanpa wheel/pointer capture = page scroll mulus.
 *  - User tidak bisa memutar model di hero (interaksi dipindah ke profile page).
 */
export function KarasaScene() {
  return (
    <div className="relative w-full aspect-square max-h-[70svh] mx-auto">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse at center top, rgba(212, 178, 126, 0.18) 0%, rgba(245, 232, 208, 0) 50%)',
        }}
      />

      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        camera={{ position: [0, 1.8, 5], fov: 35 }}
        onCreated={({ gl }) => {
          gl.setClearColor(new Color('#F5E8D0'), 0)
        }}
      >
        <AdaptiveQuality>
          <LightingSetup />

          <Suspense fallback={null}>
            <group position={[0, 0, 0]}>
              <PedestalKujang position={[0, 0, 0]} radius={1.1} />
              <LakarKuah position={[0, 0.05, 0]} />
            </group>
          </Suspense>
        </AdaptiveQuality>
      </Canvas>
    </div>
  )
}
