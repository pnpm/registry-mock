#!/usr/bin/env node
'use strict'
const cpr = require('cpr')
const pnpmRegistryMock = require('..')
const locations = require('../lib/locations')
const readYamlFile = require('read-yaml-file')
const writeYamlFile = require('write-yaml-file')
const path = require('path')

if (process.argv[2] === 'prepare') {
  const tempy = require('tempy')
  const storage = tempy.directory()

  const storageCache = locations.storageCache()
  cpr(
    storageCache,
    storage,
    err => err && console.error(err)
  )
  const config = readYamlFile.sync(path.join(__dirname, '../registry/config.yaml'))
  writeYamlFile.sync(locations.configPath(), {
    ...config,
    storage,
    uplinks: { npmjs: { url: process.env['PNPM_REGISTRY_MOCK_UPLINK'] || 'https://registry.npmjs.org/' } }
  })
} else {
  pnpmRegistryMock()
}
