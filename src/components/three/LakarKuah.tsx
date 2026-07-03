import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { useBrandMaterials } from '@/lib/three/materials'

interface LakarKuahProps {
  position?: [number, number, number]
  xRayMode?: boolean
}

/**
 * Lakar Kuah — Paper cup 360 mL dengan kerupuk + saus sachet.
 * Berdasarkan foto produk di Karasa-image/IMG_7028.png dll.
 * Sesuai PRD §2.1 (Lakar Kuah) dengan X-Ray Mode.
 *
 * Geometri prosedural: tidak butuh Blender / GLB.
 */
export function LakarKuah({ position = [0, 0, 0], xRayMode = false }: LakarKuahProps) {
  const m = useBrandMaterials()

  // Refs untuk animasi X-Ray (saus & komponen fade in/out)
  const groupRef = useRef<THREE.Group>(null)
  const innerRef = useRef<THREE.Group>(null)
  const opacityRef = useRef(0)

  useFrame((_, delta) => {
    if (!groupRef.current || !innerRef.current) return
    const target = xRayMode ? 1 : 0
    const next = THREE.MathUtils.damp(opacityRef.current, target, 4, delta)
    opacityRef.current = next

    // Mutasi langsung, BUKAN useState (PRD §8.1)
    const cupOpacity = 1 - next * 0.55
    ;(m.paperCup as THREE.MeshStandardMaterial).transparent = cupOpacity < 1
    ;(m.paperCup as THREE.MeshStandardMaterial).opacity = cupOpacity
    ;(m.labelDecal as THREE.MeshStandardMaterial).transparent = cupOpacity < 1
    ;(m.labelDecal as THREE.MeshStandardMaterial).opacity = cupOpacity
    ;(m.ornamentGold as THREE.MeshStandardMaterial).transparent = true
    ;(m.ornamentGold as THREE.MeshStandardMaterial).opacity = cupOpacity
    ;(m.textInk as THREE.MeshStandardMaterial).transparent = true
    ;(m.textInk as THREE.MeshStandardMaterial).opacity = cupOpacity

    // Komponen dalam fade in
    const innerScale = 0.7 + next * 0.3
    innerRef.current.scale.setScalar(innerScale)

    // Komponen melayang pelan saat X-Ray
    innerRef.current.position.y = Math.sin(performance.now() * 0.0008) * 0.04 * next
  })

  // Geometri statis (memoized)
  const cupGeometry = useMemo(() => {
    // Cylinder dengan taper: top radius 0.5, bottom radius 0.4, height 1.0
    return new THREE.CylinderGeometry(0.5, 0.4, 1.0, 32, 1, true)
  }, [])

  const bottomGeometry = useMemo(() => {
    // Disc untuk dasar cup
    return new THREE.CircleGeometry(0.4, 32)
  }, [])

  const lidGeometry = useMemo(() => {
    // Tutup cup, disc dengan sedikit rim
    return new THREE.CylinderGeometry(0.505, 0.505, 0.03, 32, 1, false)
  }, [])

  const rimGeometry = useMemo(() => {
    // Rim cup (tepi atas yang sedikit ditekuk)
    return new THREE.TorusGeometry(0.5, 0.02, 8, 32)
  }, [])

  // 6 kerupuk — bentuk tidak beraturan, golden
  const kerupukGeometries = useMemo(() => {
    const geos: THREE.BufferGeometry[] = []
    for (let i = 0; i < 6; i++) {
      const geo = new THREE.IcosahedronGeometry(0.08 + Math.random() * 0.04, 1)
      // Deformasi vertex untuk bentuk tidak beraturan (seperti krupuk asli)
      const positions = geo.attributes.position
      for (let v = 0; v < positions.count; v++) {
        const x = positions.getX(v)
        const y = positions.getY(v)
        const z = positions.getZ(v)
        const noise =
          Math.sin(x * 12) * 0.01 + Math.cos(y * 8) * 0.01 + Math.sin(z * 15) * 0.01
        positions.setX(v, x + noise)
        positions.setY(v, y + noise)
        positions.setZ(v, z + noise)
      }
      positions.needsUpdate = true
      geo.computeVertexNormals()
      geos.push(geo)
    }
    return geos
  }, [])

  const kerupukPositions = useMemo<[number, number, number][]>(
    () => [
      [-0.2, 0.7, 0.1],
      [0.15, 0.72, -0.05],
      [-0.05, 0.75, 0.2],
      [0.25, 0.7, 0.15],
      [-0.18, 0.68, -0.15],
      [0.05, 0.73, -0.18],
    ],
    [],
  )

  // Sachet sauce — small box dengan material plastik
  const sachetGeometry = useMemo(() => {
    return new THREE.BoxGeometry(0.18, 0.1, 0.025, 2, 2, 1)
  }, [])

  return (
    <group ref={groupRef} position={position} dispose={null}>
      {/* ===== CUP BODY ===== */}
      <mesh geometry={cupGeometry} material={m.paperCup} position={[0, 0.5, 0]} castShadow receiveShadow />

      {/* ===== CUP BOTTOM (interior base) ===== */}
      <mesh
        geometry={bottomGeometry}
        material={m.paperCup}
        position={[0, 0.005, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* ===== LABEL (mid-section strip) ===== */}
      <LabelStrip materials={m} y={0.45} />

      {/* ===== TOP RIM ===== */}
      <mesh geometry={rimGeometry} material={m.lidPlastic} position={[0, 1.0, 0]} rotation={[Math.PI / 2, 0, 0]} />

      {/* ===== LID (plastic cap) ===== */}
      <mesh
        geometry={lidGeometry}
        material={m.lidPlastic}
        position={[0, 1.025, 0]}
        castShadow
      />

      {/* ===== INNER COMPONENTS (X-Ray visible) ===== */}
      <group ref={innerRef} position={[0, 0, 0]}>
        {/* Kerupuk 6 buah */}
        {kerupukGeometries.map((geo, i) => (
          <mesh
            key={i}
            geometry={geo}
            material={m.kerupuk}
            position={kerupukPositions[i]}
            rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}
            castShadow
          />
        ))}

        {/* Sachet sauce (plastik bening dengan tint saus kuah) */}
        <mesh
          geometry={sachetGeometry}
          material={m.sachetPlastic}
          position={[0.15, 0.55, 0.18]}
          rotation={[0, 0.3, 0.2]}
          castShadow
        />
        {/* Tint saus di dalam sachet */}
        <mesh
          geometry={sachetGeometry}
          material={m.sausKuah}
          position={[0.15, 0.55, 0.184]}
          rotation={[0, 0.3, 0.2]}
          scale={[0.92, 0.85, 0.7]}
        />

        {/* Saus kuah sebagai lapisan di dasar cup (saat X-Ray) */}
        <mesh
          geometry={new THREE.CylinderGeometry(0.38, 0.38, 0.05, 32)}
          material={m.sausKuah}
          position={[0, 0.08, 0]}
        />
      </group>
    </group>
  )
}

/**
 * Label dekal di sekeliling body cup.
 * Menggunakan multiple planes kecil sebagai pseudo-text.
 * Untuk produksi: ganti dengan texture PNG (canvas-decal atau texture loader).
 */
function LabelStrip({ materials, y }: { materials: ReturnType<typeof useBrandMaterials>; y: number }) {
  return (
    <group position={[0, y, 0]}>
      {/* Ornamen scrollwork emas (di bawah "KARASÁ") */}
      <mesh
        geometry={new THREE.BoxGeometry(0.6, 0.04, 0.001)}
        material={materials.ornamentGold}
        position={[0, 0.06, 0.402]}
      />
      <mesh
        geometry={new THREE.BoxGeometry(0.4, 0.025, 0.001)}
        material={materials.ornamentGold}
        position={[0, 0.025, 0.402]}
      />

      {/* Pseudo-teks "KARASA" — bar hitam di tengah */}
      <mesh
        geometry={new THREE.BoxGeometry(0.4, 0.06, 0.001)}
        material={materials.textInk}
        position={[0, 0.16, 0.402]}
      />
      <mesh
        geometry={new THREE.BoxGeometry(0.3, 0.05, 0.001)}
        material={materials.textInk}
        position={[0, 0.1, 0.402]}
      />

      {/* Pseudo-teks "LAKAR KUAH" */}
      <mesh
        geometry={new THREE.BoxGeometry(0.5, 0.045, 0.001)}
        material={materials.textInk}
        position={[0, -0.02, 0.402]}
      />
      {/* "360 mL" */}
      <mesh
        geometry={new THREE.BoxGeometry(0.15, 0.025, 0.001)}
        material={materials.textInk}
        position={[0, -0.08, 0.402]}
      />
    </group>
  )
}
