import { Buffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

/** Reuse resources across scenes and themes. Failed requests are retryable. */
export function createMapResourceLoader() {
  const cache = new Map<string, Promise<Buffer>>()
  const waiting: Array<() => void> = []
  let running = 0
  return (url: string): Promise<Buffer> => {
    const hit = cache.get(url)
    if (hit)
      return hit
    const request = (async () => {
      if (running >= 6)
        await new Promise<void>(resolve => waiting.push(resolve))
      else
        running += 1
      try {
        if (url.startsWith('file:'))
          return readFile(fileURLToPath(url))
        const response = await fetch(url, { signal: AbortSignal.timeout(30000) })
        if (!response.ok)
          throw new Error(`Map resource failed: ${response.status} ${url}`)
        // fetch decompresses HTTP gzip/br before handing bytes to Native.
        return Buffer.from(await response.arrayBuffer())
      }
      finally {
        const next = waiting.shift()
        if (next)
          next()
        else
          running -= 1
      }
    })().catch((error) => {
      cache.delete(url)
      throw new Error(`Map resource failed: ${url}: ${error.message}`, { cause: error })
    })
    cache.set(url, request)
    return request
  }
}
