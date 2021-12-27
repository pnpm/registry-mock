import path from 'path'
import { sync as readYamlFile } from 'read-yaml-file'

const REGISTRY_MOCK_PORT = process.env['PNPM_REGISTRY_MOCK_PORT'] || '4873'

const registry = () => path.join(__dirname, '../../registry')
const storageCache = () => path.join(registry(), 'storage-cache')
const configPath = () => path.join(registry(), `runtime-config-${REGISTRY_MOCK_PORT}.yaml`)
let _storage: string
const storage = () => {
  if (!_storage) {
    _storage = readYamlFile<{ storage: string }>(configPath()).storage
  }
  return _storage
}

export {
  configPath,
  REGISTRY_MOCK_PORT,
  storage,
  storageCache,
}
