export type ProductId = 'lakar-kuah' | 'lakar-kering'

export type ProductType = '3d' | 'image-sequence' | 'placeholder'

export interface FrameConfig {
  basePath: string
  count: number
  ext: 'jpg' | 'webp' | 'png'
  width: number
  height: number
  /**
   * Index frame pertama. Default 0 (zero-based: 000, 001, ...).
   * Set ke 1 untuk naming ezgif/ffmpeg 1-based (001, 002, ...).
   */
  startIndex?: number
  /**
   * Lebar padding untuk nama file. Default 3 (→ "001", "002").
   */
  padWidth?: number
}

export interface ProductCtaLinks {
  whatsapp: string
  instagram: string
}

export interface Product {
  id: ProductId
  name: string
  type: ProductType
  tagline: string
  description: string
  longDescription?: string
  badge?: string
  ctaLinks: ProductCtaLinks
  frameConfig?: FrameConfig
  pedestalPosition: [number, number, number]
}

export interface ActiveProduct {
  product: Product
  index: number
}
