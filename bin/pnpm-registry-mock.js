#!/usr/bin/env node
'use strict'
const cpr = require('cpr')
const rimraf = require('rimraf')
const path = require('path')
const pnpmRegistryMock = require('..')
const locations = require('../lib/locations')

if (process.argv[2] === 'prepare') {
  const storageCache = locations.storageCache()
  const storage = locations.storage()
  rimraf.sync(storage)
  cpr(
    storageCache,
    storage,
    err => err && console.error(err)
  )
} else {
  pnpmRegistryMock()
}
