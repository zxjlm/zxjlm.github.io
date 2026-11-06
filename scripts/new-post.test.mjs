import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { buildValaxyArgs } from './new-post.mjs'

describe('new post wrapper', () => {
  it('prefixes the title with the local date', () => {
    assert.deepEqual(
      buildValaxyArgs(['hello-world'], { date: new Date('2026-06-29T04:00:00+08:00') }),
      ['new', '2026-06-29-hello-world'],
    )
  })

  it('keeps Valaxy options while prefixing the title', () => {
    assert.deepEqual(
      buildValaxyArgs(['-f', '-p', 'pages', 'hello-world'], { date: new Date('2026-06-29T04:00:00+08:00') }),
      ['new', '-f', '-p', 'pages', '2026-06-29-hello-world'],
    )
  })

  it('does not add a second date prefix', () => {
    assert.deepEqual(
      buildValaxyArgs(['2026-06-29-hello-world'], { date: new Date('2026-06-29T04:00:00+08:00') }),
      ['new', '2026-06-29-hello-world'],
    )
  })
})
