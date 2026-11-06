export interface TileResponse {
  data: ArrayBuffer
  cacheControl?: string | null
  expires?: string | null
}

export interface TileSchedulerOptions {
  fetchTile: (url: string, signal: AbortSignal) => Promise<TileResponse>
  /** Network requests running at once. */
  concurrency?: number
  /** Of those, how many may be prefetches. */
  prefetchConcurrency?: number
  /**
   * Milliseconds a request waits before it hits the network. The map cancels
   * tiles that only flash by while the camera follows the scrollbar; waiting
   * lets those cancellations happen before any bytes are spent.
   */
  startDelay?: number
  /** Upper bound of the in-memory tile cache. */
  maxBytes?: number
}

interface Waiter {
  resolve: (response: TileResponse) => void
  reject: (error: unknown) => void
}

interface QueuedRequest {
  readyAt: number
  waiters: Set<Waiter>
}

function abortError() {
  return Object.assign(new Error('Tile request aborted'), { name: 'AbortError' })
}

/** MapLibre treats an error with `status: 404` as an empty tile rather than a failure. */
export async function fetchTile(url: string, signal: AbortSignal): Promise<TileResponse> {
  const response = await fetch(url, { signal })
  if (!response.ok)
    throw Object.assign(new Error(`Tile request failed: ${response.status} ${url}`), { status: response.status })
  return {
    data: await response.arrayBuffer(),
    cacheControl: response.headers.get('cache-control'),
    expires: response.headers.get('expires'),
  }
}

/**
 * ArrayBuffers handed to MapLibre are transferred to its worker and become
 * detached, so callers always get a copy of the cached bytes.
 */
function copy(response: TileResponse): TileResponse {
  return { ...response, data: response.data.slice(0) }
}

export function createTileScheduler(options: TileSchedulerOptions) {
  const {
    fetchTile,
    concurrency = 6,
    prefetchConcurrency = 2,
    startDelay = 150,
    maxBytes = 48 * 1024 * 1024,
  } = options

  const controller = new AbortController()
  const cache = new Map<string, TileResponse>()
  const inflight = new Map<string, Promise<TileResponse>>()
  const queued = new Map<string, QueuedRequest>()
  let prefetchQueue: string[] = []
  let cachedBytes = 0
  let running = 0
  let runningPrefetches = 0
  let timer: ReturnType<typeof setTimeout> | undefined

  function remember(url: string, response: TileResponse) {
    if (cache.has(url))
      return
    cache.set(url, response)
    cachedBytes += response.data.byteLength
    for (const [key, value] of cache) {
      if (cachedBytes <= maxBytes)
        break
      cache.delete(key)
      cachedBytes -= value.data.byteLength
    }
  }

  function cached(url: string) {
    const response = cache.get(url)
    if (response) {
      cache.delete(url)
      cache.set(url, response)
    }
    return response
  }

  function start(url: string, prefetch: boolean) {
    running += 1
    if (prefetch)
      runningPrefetches += 1

    const promise = fetchTile(url, controller.signal)
      .then((response) => {
        if (!controller.signal.aborted) remember(url, response)
        return response
      })
      .finally(() => {
        inflight.delete(url)
        running -= 1
        if (prefetch)
          runningPrefetches -= 1
        pump()
      })
    inflight.set(url, promise)
    return promise
  }

  function nextReady(now: number) {
    let next: [string, QueuedRequest] | undefined
    for (const entry of queued) {
      if (entry[1].readyAt <= now)
        next = entry
    }
    return next
  }

  function schedule(delay: number) {
    if (timer)
      clearTimeout(timer)
    timer = setTimeout(() => {
      timer = undefined
      pump()
    }, delay)
  }

  function pump() {
    if (controller.signal.aborted) return
    const now = Date.now()
    while (running < concurrency) {
      const next = nextReady(now)
      if (next) {
        const [url, request] = next
        queued.delete(url)
        start(url, false).then(
          response => request.waiters.forEach(waiter => waiter.resolve(copy(response))),
          error => request.waiters.forEach(waiter => waiter.reject(error)),
        )
        continue
      }

      if (runningPrefetches >= prefetchConcurrency || !prefetchQueue.length)
        break
      const url = prefetchQueue.shift()!
      if (!cache.has(url) && !inflight.has(url) && !queued.has(url))
        start(url, true).catch(() => {})
    }

    if (queued.size) {
      const earliest = Math.min(...Array.from(queued.values(), request => request.readyAt))
      schedule(Math.max(0, earliest - now))
    }
  }

  function request(url: string, signal?: AbortSignal): Promise<TileResponse> {
    if (signal?.aborted || controller.signal.aborted)
      return Promise.reject(abortError())

    const hit = cached(url)
    if (hit)
      return Promise.resolve(copy(hit))

    return new Promise<TileResponse>((resolve, reject) => {
      const pending = inflight.get(url)
      const entry = pending ? undefined : queued.get(url) ?? { readyAt: Date.now() + startDelay, waiters: new Set<Waiter>() }
      const onAbort = () => {
        entry?.waiters.delete(waiter)
        if (entry && !entry.waiters.size && queued.get(url) === entry)
          queued.delete(url)
        waiter.reject(abortError())
      }
      const cleanup = () => signal?.removeEventListener('abort', onAbort)
      const waiter: Waiter = {
        resolve(response) { cleanup(); resolve(response) },
        reject(error) { cleanup(); reject(error) },
      }
      signal?.addEventListener('abort', onAbort, { once: true })

      if (pending) {
        pending.then(response => waiter.resolve(copy(response)), waiter.reject)
      }
      else if (entry) {
        entry.waiters.add(waiter)
        // Re-inserting moves the URL to the back, so the newest viewport is served first.
        queued.delete(url)
        queued.set(url, entry)
        pump()
      }
    })
  }

  /**
   * Replaces the pending prefetch list. Prefetches only use idle capacity.
   */
  function prefetch(urls: string[]) {
    prefetchQueue = urls.filter(url => !cache.has(url) && !inflight.has(url) && !queued.has(url))
    pump()
  }

  return {
    request,
    prefetch,
    dispose() {
      controller.abort()
      clearTimeout(timer)
      for (const request of queued.values())
        request.waiters.forEach(waiter => waiter.reject(abortError()))
      queued.clear()
      cache.clear()
      prefetchQueue = []
    },
  }
}

export type TileScheduler = ReturnType<typeof createTileScheduler>
