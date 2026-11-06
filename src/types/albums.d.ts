export interface ArgusAlbumIndexManifest {
  schema_version: 1
  generated_at?: string
  albums: ArgusAlbumSummaryManifest[]
}

export interface ArgusAlbumSummaryManifest {
  id: string
  slug: string
  title: string
  description?: string | null
  cover?: string | null
  preview_thumbnails?: Array<string | null>
  photo_count: number
  updated_at?: string | null
  published_at?: string | null
  sort_order?: number | null
  manifest_path: string
}

export interface ArgusAlbumManifest {
  schema_version: 1
  album_id: string
  slug: string
  title: string
  description?: string | null
  cover_photo_id?: string | null
  updated_at?: string | null
  photos: ArgusAlbumPhotoManifest[]
}

export interface ArgusAlbumPhotoManifest {
  id: string
  original_filename?: string | null
  width?: number | null
  height?: number | null
  captured_at?: string | null
  city?: string | null
  camera_make?: string | null
  camera_model?: string | null
  lens_model?: string | null
  focal_length?: string | number | null
  aperture?: string | number | null
  shutter_speed?: string | number | null
  iso?: string | number | null
  ai_tags?: string[] | null
  manual_tags?: string[] | null
  preview_path: string
  thumbnail_path?: string | null
  live_photo?: {
    video_path?: string | null
    duration_ms?: number | null
  } | null
  featured?: boolean
  featured_order?: number | null
  journal_excerpt?: string | null
}

export interface ArgusAlbumSummary {
  id: string
  slug: string
  title: string
  description: string
  cover: string
  previewThumbnails: string[]
  photoCount: number
  updatedAt: string
  publishedAt: string
  sortOrder: number
  manifestPath: string
}

export interface ArgusAlbumPhoto {
  id: string
  originalFilename: string
  width?: number
  height?: number
  capturedAt: string
  city: string
  camera: string
  lens: string
  focalLength: string
  aperture: string
  shutterSpeed: string
  iso: string
  tags: string[]
  previewPath: string
  thumbnailPath: string
  livePhoto: {
    videoPath: string
    durationMs?: number
  } | null
  featured: boolean
  featuredOrder: number | null
  journalExcerpt: string
}

export interface ArgusAlbumDetail {
  albumId: string
  slug: string
  title: string
  description: string
  coverPhotoId: string
  updatedAt: string
  photos: ArgusAlbumPhoto[]
}

export interface ArgusAlbumsConfig {
  enable: boolean
  indexPath: string
  title: string
  description: string
  featured: {
    enable: boolean
    limit: number
  }
}

export interface ArgusAlbumsState<T> {
  data: T | null
  pending: boolean
  error: string
}
