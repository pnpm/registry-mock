'use strict'
const path = require('path')

const registry = () => path.join(__dirname, '..', 'registry')
const storageCache = () => path.join(registry(), 'storage-cache')
const storage = () => path.resolve('.pnpm-registry-mock/storage')

module.exports = {
  storageCache,
  storage,
}
