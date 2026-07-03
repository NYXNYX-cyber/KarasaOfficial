import { useMemo } from 'react'
import * as THREE from 'three'

/**
 * PBR material definitions untuk produk Karasa.
 * Sesuai riset Fase 1 §"Konsistensi Lintas Produk" dan Fase 2 §"Material PBR Lakar Basah".
 *
 * Bahan didesain untuk mewakili tekstur fisik:
 * - paper cup matte body (karton food grade)
 * - tutup plastik transparan
 * - label dekal dengan teks & ornamen
 * - kerupuk (kerak berongga, golden)
 * - saus (semi-transparan, kilap)
 * - sendok kayu
 */

export type BrandMaterials = ReturnType<typeof useBrandMaterials>

export function useBrandMaterials() {
  return useMemo(() => {
    return {
      // ===== Paper cup body =====
      // Kertas karton food grade matte, warna krem alami
      paperCup: new THREE.MeshStandardMaterial({
        color: '#F4E9D5',
        roughness: 0.85,
        metalness: 0.0,
        side: THREE.DoubleSide,
      }),

      // ===== Tutup plastik cup =====
      // PP transparan semi-glossy
      lidPlastic: new THREE.MeshPhysicalMaterial({
        color: '#FFFFFF',
        roughness: 0.15,
        metalness: 0.0,
        clearcoat: 0.4,
        clearcoatRoughness: 0.1,
        transmission: 0.0,
        opacity: 0.95,
        transparent: true,
        side: THREE.DoubleSide,
      }),

      // ===== Label dekal pada body cup =====
      // Kertas label matte dengan tekstur cetakan
      labelDecal: new THREE.MeshStandardMaterial({
        color: '#F0E4CC',
        roughness: 0.7,
        metalness: 0.0,
      }),

      // ===== Ornamen scrollwork emas pada label =====
      // Efek metalik tipis untuk aksen premium
      ornamentGold: new THREE.MeshStandardMaterial({
        color: '#C8A858',
        roughness: 0.35,
        metalness: 0.85,
      }),

      // ===== Tulisan "KARASÁ" =====
      // Tinta hitam pekat di atas label
      textInk: new THREE.MeshStandardMaterial({
        color: '#1A0F08',
        roughness: 0.6,
        metalness: 0.0,
      }),

      // ===== Kerupuk (krupuk) =====
      // Golden, sedikit glossy, dengan normal map noise
      kerupuk: new THREE.MeshStandardMaterial({
        color: '#F4C57A',
        roughness: 0.55,
        metalness: 0.0,
      }),

      // ===== Saus chilli oil (Lakar Basah) =====
      // Merah tua, semi-transparan, kilap berminyak
      sausChilli: new THREE.MeshPhysicalMaterial({
        color: '#C8102E',
        roughness: 0.2,
        metalness: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.08,
        ior: 1.45,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      }),

      // ===== Saus kuah (Lakar Kuah) =====
      // Kuning kuah hangat, semi-transparan, lebih kental dari chilli oil
      sausKuah: new THREE.MeshPhysicalMaterial({
        color: '#E8A845',
        roughness: 0.35,
        metalness: 0.0,
        clearcoat: 0.6,
        clearcoatRoughness: 0.2,
        ior: 1.4,
        transparent: true,
        opacity: 0.78,
        depthWrite: false,
      }),

      // ===== Sachet plastik (plik) =====
      // Plastik bening glossy dengan tint saus
      sachetPlastic: new THREE.MeshPhysicalMaterial({
        color: '#FFFFFF',
        roughness: 0.2,
        metalness: 0.0,
        clearcoat: 0.5,
        clearcoatRoughness: 0.15,
        transmission: 0.4,
        thickness: 0.5,
        ior: 1.45,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide,
      }),

      // ===== Sendok kayu =====
      // Kayu Sonokeling (rosewood gelap) sesuai PRD §3.2
      kayuSonokeling: new THREE.MeshStandardMaterial({
        color: '#5C3A21',
        roughness: 0.55,
        metalness: 0.0,
      }),

      // ===== Pedestal batu sintered (Dekton matte) =====
      // Abu-abu gelap bertekstur, untuk alas produk
      pedestalBatu: new THREE.MeshStandardMaterial({
        color: '#2A2A2A',
        roughness: 0.7,
        metalness: 0.1,
      }),

      // ===== Siluet Kujang (decorative) =====
      // Hitam metalik untuk silhouette pedestal
      kujangSilhouette: new THREE.MeshStandardMaterial({
        color: '#0F0F0F',
        roughness: 0.5,
        metalness: 0.6,
      }),
    } as const
  }, [])
}
