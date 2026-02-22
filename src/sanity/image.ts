import { projectId, dataset } from './env'
import type { SanityImage } from './types'

/**
 * Build a Sanity CDN image URL from a SanityImage object.
 * Parses the asset _ref (e.g. "image-abc123-800x600-png") to construct the URL.
 */
export function urlFor(image: SanityImage | undefined | null, width?: number): string | null {
  if (!image?.asset?._ref) return null

  // Asset refs follow the pattern: image-{id}-{width}x{height}-{format}
  const ref = image.asset._ref
  const [, id, dimensions, format] = ref.split('-')
  if (!id || !dimensions || !format) return null

  let url = `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dimensions}.${format}`

  if (width) {
    url += `?w=${width}&auto=format`
  } else {
    url += '?auto=format'
  }

  return url
}
