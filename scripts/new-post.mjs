#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { pathToFileURL } from 'node:url'

const datePrefixRE = /^\d{4}-\d{2}-\d{2}-/
const optionsWithValue = new Set(['-p', '--path'])

function formatLocalDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function findTitleIndex(args) {
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]

    if (arg === '--') {
      return i + 1 < args.length ? i + 1 : -1
    }

    if (optionsWithValue.has(arg)) {
      i += 1
      continue
    }

    if (arg.startsWith('--path=')) {
      continue
    }

    if (arg.startsWith('-')) {
      continue
    }

    return i
  }

  return -1
}

export function buildValaxyArgs(args, { date = new Date() } = {}) {
  const titleIndex = findTitleIndex(args)

  if (titleIndex === -1) {
    throw new Error('Usage: pnpm new <title> [valaxy new options]')
  }

  const nextArgs = [...args]
  const title = nextArgs[titleIndex]
  const prefix = formatLocalDate(date)

  nextArgs[titleIndex] = datePrefixRE.test(title) ? title : `${prefix}-${title}`

  return ['new', ...nextArgs]
}

function run() {
  let valaxyArgs

  try {
    valaxyArgs = buildValaxyArgs(process.argv.slice(2))
  }
  catch (error) {
    console.error(error.message)
    process.exitCode = 1
    return
  }

  const child = spawn('valaxy', valaxyArgs, { stdio: 'inherit' })

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal)
      return
    }

    process.exitCode = code ?? 1
  })

  child.on('error', (error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run()
}
