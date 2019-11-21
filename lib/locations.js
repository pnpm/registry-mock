'use strict'
const path = require('path')
const REGISTRY_MOCK_PORT = process.env['PNPM_REGISTRY_MOCK_PORT'] || '4873'
const readYamlFile = require('read-yaml-file')

const registry = () => path.join(__dirname, '..', 'registry')
const storageCache = () => path.join(registry(), 'storage-cache')
const configPath = () => path.join(registry(), `runtime-config-${REGISTRY_MOCK_PORT}.yaml`)
let _storage
const storage = () => {
  if (!_storage) {
    _storage = readYamlFile.sync(configPath()).storage
  }
  return _storage
}

module.exports = {
  configPath,
  REGISTRY_MOCK_PORT,
  storage,
  storageCache,
}
