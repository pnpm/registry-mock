import path from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const readYamlFileSync = require('read-yaml-file').sync as <T>(path: string) => T

const REGISTRY_MOCK_PORT = process.env['PNPM_REGISTRY_MOCK_PORT'] || '4873'

const registry = () => path.join(import.meta.dirname, '../../registry')
const storageCache = () => path.join(registry(), 'storage-cache')
const configPath = () => path.join(registry(), `runtime-config-${REGISTRY_MOCK_PORT}.yaml`)
let _storage: string
const storage = () => {
  if (!_storage) {
    _storage = readYamlFileSync<{ storage: string }>(configPath()).storage
  }
  return _storage
}

export {
  configPath,
  REGISTRY_MOCK_PORT,
  storage,
  storageCache,
}
