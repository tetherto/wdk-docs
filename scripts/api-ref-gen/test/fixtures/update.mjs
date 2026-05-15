#!/usr/bin/env node

import { mkdirSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { createGitHubRemote, listAllowedTags } from '../../core.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const FIXTURE_ROOT = join(__dirname, 'spark')
const REPO = 'tetherto/wdk-wallet-spark'

async function main () {
  const remote = createGitHubRemote()
  const tags = listAllowedTags(REPO, remote).filter(entry => {
    return ['v1.0.0-beta.12', 'v1.0.0-beta.13', 'v1.0.0-beta.14', 'v1.0.0-beta.15', 'v1.0.0-beta.16'].includes(entry.tag)
  })

  const releases = {}
  for (const entry of tags) {
    releases[entry.tag] = await remote.getReleaseByTag(REPO, entry.tag)
  }

  const compare = {}
  for (let i = 1; i < tags.length; i++) {
    const fromTag = tags[i - 1].tag
    const toTag = tags[i].tag
    compare[`${fromTag}...${toTag}`] = await remote.getCompare(REPO, fromTag, toTag)
  }

  mkdirSync(FIXTURE_ROOT, { recursive: true })
  writeFileSync(join(FIXTURE_ROOT, 'tags.json'), JSON.stringify({ [REPO]: tags }, null, 2) + '\n')
  writeFileSync(join(FIXTURE_ROOT, 'releases.json'), JSON.stringify({ [REPO]: releases }, null, 2) + '\n')
  writeFileSync(join(FIXTURE_ROOT, 'compare.json'), JSON.stringify({ [REPO]: compare }, null, 2) + '\n')
}

main().catch(error => {
  console.error(error.message)
  process.exit(1)
})
