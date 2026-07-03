import { Environment } from '@react-three/drei'

/**
 * Sistem pencahayaan "Fajar Priangan".
 * Per PRD §3.2: directional light keemasan dari timur (fajar dataran tinggi Bandung)
 * + ambient indigo di sisi bayangan + rim light Koneng.
 *
 * Untuk Lakar Basah/Kuah yang wet (kilap saus), tambahkan HDRI Environment
 * untuk refleksi PBR yang realistis. Default preset: 'dawn' (paling mendekati).
 *
 * Tone mapping: ACES Filmic, exposure 1.0 (match Blender image sequence).
 */
export function LightingSetup() {
  return (
    <>
      {/* Matahari pagi Bandung — warm gold ~2300K dari timur (+X) */}
      <directionalLight
        position={[8, 6, 4]}
        color="#FFB37A"
        intensity={2.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0005}
      />

      {/* Cahaya isi — langit pagi Bandung, sisi bayangan tetap dingin */}
      <ambientLight color="#5A5A8A" intensity={0.35} />

      {/* Rim light — Koneng #FFFF00 sesuai PRD §3.3 untuk aksen tepi produk */}
      <directionalLight position={[-3, 2, -5]} color="#FFFF00" intensity={0.4} />

      {/* HDRI untuk PBR reflection (penting untuk clearcoat saus) */}
      {/* Catatan: default Drei 'dawn' preset download dari CDN.
          Untuk produksi self-host, ganti ke files="/hdri/kiara_1_dawn_256.hdr" */}
      <Environment preset="dawn" environmentIntensity={0.5} />
    </>
  )
}
