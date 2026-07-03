import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { useBrandMaterials } from '@/lib/three/materials'

interface LakarBasahProps {
  position?: [number, number, number]
  xRayMode?: boolean
}

/**
 * Lakar Basah — Paper cup 360 mL dengan saus chilli oil + baso/siomay/bumbu.
 * Kemasan sama dengan Lakar Kuah (paper cup, bukan pouch) — berbeda hanya pada
 * label warna accent dan isi (saus merah chilli oil mengambang).
 *
 * X-Ray Mode menampilkan saus & komponen melayang.
 */
export function LakarBasah({ position = [0, 0, 0], xRayMode = false }: LakarBasahProps) {
  const m = useBrandMaterials()

  const groupRef = useRef<THREE.Group>(null)
  const innerRef = useRef<THREE.Group>(null)
  const opacityRef = useRef(0)

  useFrame((_, delta) => {
    if (!groupRef.current || !innerRef.current) return
    const target = xRayMode ? 1 : 0
    const next = THREE.MathUtils.damp(opacityRef.current, target, 4, delta)
    opacityRef.current = next

    // Mutasi langsung (PRD §8.1)
    const cupOpacity = 1 - next * 0.5
    ;(m.paperCup as THREE.MeshStandardMaterial).transparent = cupOpacity < 1
    ;(m.paperCup as THREE.MeshStandardMaterial).opacity = cupOpacity
    ;(m.labelDecal as THREE.MeshStandardMaterial).transparent = cupOpacity < 1
    ;(m.labelDecal as THREE.MeshStandardMaterial).opacity = cupOpacity
    ;(m.ornamentGold as THREE.MeshStandardMaterial).transparent = true
    ;(m.ornamentGold as THREE.MeshStandardMaterial).opacity = cupOpacity
    ;(m.textInk as THREE.MeshStandardMaterial).transparent = true
    ;(m.textInk as THREE.MeshStandardMaterial).opacity = cupOpacity

    // Komponen dalam fade in
    innerRef.current.scale.setScalar(0.7 + next * 0.3)
    innerRef.current.position.y = Math.sin(performance.now() * 0.0008) * 0.05 * next
  })

  const cupGeometry = useMemo(
    () => new THREE.CylinderGeometry(0.5, 0.4, 1.0, 32, 1, true),
    [],
  )
  const bottomGeometry = useMemo(() => new THREE.CircleGeometry(0.4, 32), [])
  const lidGeometry = useMemo(
    () => new THREE.CylinderGeometry(0.505, 0.505, 0.03, 32, 1, false),
    [],
  )
  const rimGeometry = useMemo(() => new THREE.TorusGeometry(0.5, 0.02, 8, 32), [])

  // Saus chilli oil — lapisan dasar yang lebih tebal
  const sausLayer = useMemo(
    () => new THREE.CylinderGeometry(0.38, 0.38, 0.15, 32),
    [],
  )

  // Baso — bulat padat, krem keemasan
  const basoGeometries = useMemo(() => {
    const geos: THREE.BufferGeometry[] = []
    for (let i = 0; i < 4; i++) {
      const geo = new THREE.SphereGeometry(0.06 + Math.random() * 0.02, 16, 12)
      geos.push(geo)
    }
    return geos
  }, [])

  // Siomay — lebih pipih, lipatan-lipatan
  const siomayGeometries = useMemo(() => {
    const geos: THREE.BufferGeometry[] = []
    for (let i = 0; i < 3; i++) {
      const geo = new THREE.SphereGeometry(0.07, 12, 8)
      geo.scale(1, 0.6, 1) // Pipihkan
      // Deformasi untuk efek lipatan
      const pos = geo.attributes.position
      for (let v = 0; v < pos.count; v++) {
        const x = pos.getX(v)
        const y = pos.getY(v)
        const z = pos.getZ(v)
        const fold = Math.sin(x * 20) * 0.005 + Math.cos(z * 25) * 0.005
        pos.setY(v, y + fold)
      }
      pos.needsUpdate = true
      geo.computeVertexNormals()
      geos.push(geo)
    }
    return geos
  }, [])

  // Bumbu sachet
  const bumbuSachet = useMemo(
    () => new THREE.BoxGeometry(0.15, 0.1, 0.02, 1, 1, 1),
    [],
  )

  return (
    <group ref={groupRef} position={position} dispose={null}>
      {/* CUP BODY */}
      <mesh geometry={cupGeometry} material={m.paperCup} position={[0, 0.5, 0]} castShadow receiveShadow />

      {/* CUP BOTTOM */}
      <mesh
        geometry={bottomGeometry}
        material={m.paperCup}
        position={[0, 0.005, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* LABEL — variant Lakar Basah (accent berbeda di Fase 2) */}
      <BasahLabel materials={m} y={0.45} />

      {/* TOP RIM */}
      <mesh
        geometry={rimGeometry}
        material={m.lidPlastic}
        position={[0, 1.0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      />

      {/* LID */}
      <mesh geometry={lidGeometry} material={m.lidPlastic} position={[0, 1.025, 0]} castShadow />

      {/* INNER COMPONENTS (X-Ray visible) */}
      <group ref={innerRef}>
        {/* Saus chilli oil — lapisan lebih tebal dari kuah */}
        <mesh geometry={sausLayer} material={m.sausChilli} position={[0, 0.12, 0]} />

        {/* Baso (4 buah) */}
        {basoGeometries.map((geo, i) => {
          const angle = (i / 4) * Math.PI * 2
          return (
            <mesh
              key={`baso-${i}`}
              geometry={geo}
              material={m.kerupuk}
              position={[Math.cos(angle) * 0.18, 0.32, Math.sin(angle) * 0.18]}
              castShadow
            />
          )
        })}

        {/* Siomay (3 buah) */}
        {siomayGeometries.map((geo, i) => {
          const angle = (i / 3) * Math.PI * 2 + 0.5
          return (
            <mesh
              key={`siomay-${i}`}
              geometry={geo}
              material={m.kerupuk}
              position={[Math.cos(angle) * 0.22, 0.45, Math.sin(angle) * 0.22]}
              rotation={[0, Math.random() * Math.PI, 0]}
              castShadow
            />
          )
        })}

        {/* Bumbu sachet */}
        <mesh
          geometry={bumbuSachet}
          material={m.sachetPlastic}
          position={[-0.2, 0.7, 0.15]}
          rotation={[0, 0.4, 0.15]}
          castShadow
        />
        {/* Tint bumbu coklat di dalam sachet */}
        <mesh
          geometry={bumbuSachet}
          material={new THREE.MeshStandardMaterial({
            color: '#8B4513',
            roughness: 0.8,
            transparent: true,
            opacity: 0.85,
          })}
          position={[-0.2, 0.7, 0.152]}
          rotation={[0, 0.4, 0.15]}
          scale={[0.92, 0.85, 0.7]}
        />
      </group>
    </group>
  )
}

function BasahLabel({
  materials,
  y,
}: {
  materials: ReturnType<typeof useBrandMaterials>
  y: number
}) {
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

      {/* Pseudo-teks "KARASA" */}
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

      {/* Pseudo-teks "LAKAR BASAH" */}
      <mesh
        geometry={new THREE.BoxGeometry(0.5, 0.045, 0.001)}
        material={materials.textInk}
        position={[0, -0.02, 0.402]}
      />
      <mesh
        geometry={new THREE.BoxGeometry(0.15, 0.025, 0.001)}
        material={materials.textInk}
        position={[0, -0.08, 0.402]}
      />
    </group>
  )
}
