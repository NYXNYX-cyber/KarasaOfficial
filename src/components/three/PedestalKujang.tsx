import { useMemo } from 'react'
import * as THREE from 'three'

import { useBrandMaterials } from '@/lib/three/materials'

interface PedestalKujangProps {
  position?: [number, number, number]
  radius?: number
}

/**
 * Pedestal batu sintered dengan siluet Kujang (motif senjata Sunda).
 * Per PRD §3.1: "tumpuan pedestal 3D objek produk dan siluet pembatas antarmuka visual".
 *
 * Untuk produksi: siluet Kujang di-ekspor dari SVG budaya (Fase 1.3)
 * menjadi extruded geometry atau alphaMap di plane.
 */
export function PedestalKujang({ position = [0, 0, 0], radius = 1.0 }: PedestalKujangProps) {
  const m = useBrandMaterials()

  // Bentuk siluet Kujang disederhanakan (silhouette senjata Sunda)
  // 3 lob utama: tengah (papatuk) + 2 sayap (silih) + 5 mata hierarkis
  const kujangShape = useMemo(() => {
    const shape = new THREE.Shape()
    // Haluan (puncak)
    shape.moveTo(0, 0.4)
    // Lob tengah (papatuk)
    shape.lineTo(0.06, 0.32)
    shape.lineTo(0.12, 0.18)
    shape.lineTo(0.15, 0.05)
    // Sayap kanan (silih)
    shape.lineTo(0.18, -0.05)
    shape.lineTo(0.13, -0.15)
    shape.lineTo(0.08, -0.25)
    // Gagang bawah
    shape.lineTo(0.04, -0.35)
    shape.lineTo(0.02, -0.42)
    shape.lineTo(-0.02, -0.42)
    shape.lineTo(-0.04, -0.35)
    // Sayap kiri (silih) — mirror
    shape.lineTo(-0.08, -0.25)
    shape.lineTo(-0.13, -0.15)
    shape.lineTo(-0.18, -0.05)
    shape.lineTo(-0.15, 0.05)
    shape.lineTo(-0.12, 0.18)
    shape.lineTo(-0.06, 0.32)
    shape.lineTo(0, 0.4)

    // Lubang 5 mata (cut-out) — hierarkis, paling besar di tengah
    const mataPusat = new THREE.Path()
    mataPusat.absellipse(0, 0.05, 0.025, 0.025, 0, Math.PI * 2, false)
    shape.holes.push(mataPusat)

    const mataAtas1 = new THREE.Path()
    mataAtas1.absellipse(-0.04, 0.18, 0.012, 0.012, 0, Math.PI * 2, false)
    shape.holes.push(mataAtas1)

    const mataAtas2 = new THREE.Path()
    mataAtas2.absellipse(0.04, 0.18, 0.012, 0.012, 0, Math.PI * 2, false)
    shape.holes.push(mataAtas2)

    const mataBawah1 = new THREE.Path()
    mataBawah1.absellipse(-0.03, -0.08, 0.01, 0.01, 0, Math.PI * 2, false)
    shape.holes.push(mataBawah1)

    const mataBawah2 = new THREE.Path()
    mataBawah2.absellipse(0.03, -0.08, 0.01, 0.01, 0, Math.PI * 2, false)
    shape.holes.push(mataBawah2)

    return shape
  }, [])

  // Pedestal disc
  const pedestalGeometry = useMemo(
    () => new THREE.CylinderGeometry(radius, radius * 0.95, 0.08, 48),
    [radius],
  )

  // Edge ring (cincin dekoratif)
  const edgeGeometry = useMemo(
    () => new THREE.TorusGeometry(radius, 0.015, 8, 64),
    [radius],
  )

  return (
    <group position={position}>
      {/* Pedestal utama — batu sintered matte */}
      <mesh
        geometry={pedestalGeometry}
        material={m.pedestalBatu}
        position={[0, -0.04, 0]}
        receiveShadow
        castShadow
      />

      {/* Edge ring atas */}
      <mesh
        geometry={edgeGeometry}
        material={m.ornamentGold}
        position={[0, 0.0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      />

      {/* Siluet Kujang di tengah pedestal */}
      <SiluetKujang shape={kujangShape} materials={m} />
    </group>
  )
}

function SiluetKujang({
  shape,
  materials,
}: {
  shape: THREE.Shape
  materials: ReturnType<typeof useBrandMaterials>
}) {
  const extrudeSettings = useMemo(
    () => ({
      depth: 0.01,
      bevelEnabled: true,
      bevelThickness: 0.002,
      bevelSize: 0.002,
      bevelSegments: 2,
    }),
    [],
  )

  const geometry = useMemo(() => new THREE.ExtrudeGeometry(shape, extrudeSettings), [shape, extrudeSettings])

  return (
    <mesh
      geometry={geometry}
      material={materials.kujangSilhouette}
      position={[0, 0.005, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      castShadow
    />
  )
}
