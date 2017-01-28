#!/usr/bin/env node
'use strict'
const cpr = require('cpr')
const rimraf = require('rimraf')
const path = require('path')
const pnpmRegistryMock = require('..')

if (process.argv[2] === 'prepare') {
  const registry = path.join(__dirname, '..', 'registry')
  const storageCache = path.join(registry, 'storage-cache')
  const storage = path.join(registry, 'storage')
  rimraf.sync(storage)
  cpr(
    storageCache,
    storage,
    err => err && console.error(err)
  )
} else {
  pnpmRegistryMock()
}
