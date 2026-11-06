export interface TravelFrameImage {
  naturalWidth: number
  naturalHeight: number
}

interface Entry<T> {
  priority: number
  image?: T
  running: boolean
  failedAt?: number
}

interface FrameCacheOptions<T extends TravelFrameImage> {
  load: (url: string, priority: 'high' | 'low') => Promise<T>
  ready: () => void
  error?: (url: string) => void
  maxPixels?: number
  concurrency?: number
}

/** A moving window of decoded rasters, rather than an article-sized image cache. */
export function createTravelFrameCache<T extends TravelFrameImage>(options: FrameCacheOptions<T>) {
  const { maxPixels = 16 * 1024 * 1024, concurrency = 2 } = options
  const entries = new Map<string, Entry<T>>()
  let running = 0
  let disposed = false
  let pinned = ''

  function trim() {
    let pixels = Array.from(entries.values()).reduce((sum, entry) => sum + (entry.image ? entry.image.naturalWidth * entry.image.naturalHeight : 0), 0)
    for (const [url, entry] of entries) {
      if (pixels <= maxPixels)
        break
      if (!entry.image || url === pinned)
        continue
      entries.delete(url)
      pixels -= entry.image.naturalWidth * entry.image.naturalHeight
    }
  }

  function pump() {
    if (disposed)
      return
    while (running < concurrency) {
      const next = Array.from(entries).filter(([, entry]) => !entry.running && !entry.image && entry.failedAt === undefined).sort((a, b) => b[1].priority - a[1].priority)[0]
      if (!next)
        break
      const [url, entry] = next
      entry.running = true
      running += 1
      options.load(url, entry.priority ? 'high' : 'low').then((image) => {
        if (disposed)
          return
        entry.image = image
        entries.delete(url)
        entries.set(url, entry)
        trim()
        options.ready()
      }, () => {
        entry.failedAt = Date.now()
        if (!disposed)
          options.error?.(url)
      }).finally(() => {
        running -= 1
        pump()
      })
    }
  }

  function request(url: string, priority = false) {
    let entry = entries.get(url)
    if (entry?.failedAt !== undefined && Date.now() - entry.failedAt >= 30000) {
      entries.delete(url)
      entry = undefined
    }
    if (!entry) {
      entry = { priority: Number(priority), running: false }
      entries.set(url, entry)
    }
    else if (priority) {
      entry.priority = 1
    }
    pump()
  }

  return {
    get(url: string) {
      const entry = entries.get(url)
      if (entry?.image) {
        entries.delete(url)
        entries.set(url, entry)
      }
      return entry?.image
    },
    request(url: string) {
      pinned = url
      for (const [key, entry] of entries) {
        if (key !== url && !entry.running && !entry.image && entry.failedAt === undefined)
          entries.delete(key)
      }
      request(url, true)
    },
    prefetch(urls: string[]) {
      const wanted = new Set(urls)
      for (const [url, entry] of entries) {
        if (!entry.running && !entry.image && entry.failedAt === undefined && url !== pinned && !wanted.has(url))
          entries.delete(url)
        if (url !== pinned)
          entry.priority = 0
      }
      urls.forEach(url => request(url))
    },
    dispose() {
      disposed = true
      entries.clear()
    },
  }
}
