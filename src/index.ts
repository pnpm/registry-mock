import path from 'path'
import { createRequire } from 'module'
import execa from 'execa'
import fsx from 'fs-extra'
import writeYamlFile from 'write-yaml-file'
import * as locations from './lib/locations.js'
import _addDistTag from './lib/addDistTag.js'
import _addUser from './lib/addUser.js'

const require = createRequire(import.meta.url)
const readYamlFileSync = require('read-yaml-file').sync as <T>(path: string) => T

const REGISTRY_MOCK_PORT = locations.REGISTRY_MOCK_PORT

export default function () {
  const verdaccioBin = require.resolve('verdaccio/bin/verdaccio')
  return execa.sync('node',
    [
      verdaccioBin,
      '--config',
      locations.configPath(),
      '--listen',
      REGISTRY_MOCK_PORT
    ],
    { stdio: 'inherit' }
  )
}

export function start (opts: execa.Options & { useNodeVersion?: string, listen?: string }) {
  const verdaccioBin = require.resolve('verdaccio/bin/verdaccio')
  const args = [
    verdaccioBin,
    '--config',
    locations.configPath(),
    '--listen',
    opts.listen ?? REGISTRY_MOCK_PORT
  ]
  if (opts.useNodeVersion) {
    return execa('pnpm', [
      'dlx',
      `node@runtime:${opts.useNodeVersion}`,
      ...args,
    ], opts)
  }
  return execa('node', args, opts)
}

export const addDistTag = _addDistTag(REGISTRY_MOCK_PORT)
export const addUser = _addUser(REGISTRY_MOCK_PORT)

export const getIntegrity = (pkgName: string, pkgVersion: string): string => {
  const filePath = path.join(locations.storage(), pkgName, 'package.json')
  const maxRetries = 4
  let delay = 200 // milliseconds
  let content: any
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      content = fsx.readJSONSync(filePath)
      break
    } catch (err) {
      if (attempt === maxRetries ||
        !err ||
        typeof err !== 'object' ||
        (
          !(err instanceof SyntaxError && err.message.endsWith('Unexpected end of JSON input')) &&
          (err as NodeJS.ErrnoException).code !== 'ENOENT'
        )
      ) {
        throw err
      }
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, delay)
      delay *= 2
    }
  }
  if (!content) throw new Error(`Failed to read package.json for ${pkgName}@${pkgVersion} after ${maxRetries} attempts`)
  return content.versions[pkgVersion].dist.integrity
}

export { REGISTRY_MOCK_PORT }

export { REGISTRY_MOCK_CREDENTIALS } from './lib/credentials.js'

export interface PrepareOptions {
  uplinkedRegistry?: string
}

export function prepare (opts?: PrepareOptions) {
  const tempy = require('tempy')
  const storage = tempy.directory()

  const storageCache = locations.storageCache()
  fsx.copySync(storageCache, storage)
  const config = readYamlFileSync<any>(path.join(import.meta.dirname, '../registry/config.yaml'))
  writeYamlFile.sync(locations.configPath(), {
    ...config,
    storage,
    plugins: path.join(import.meta.dirname, '..', 'node_modules'),
    uplinks: {
      npmjs: {
        url: opts?.uplinkedRegistry || process.env['PNPM_REGISTRY_MOCK_UPLINK'] || 'https://registry.npmjs.org/',
        max_fails: 100,
        maxage: '30m',
        fail_timeout: '10m',
        timeout: '600s',
          agent_options: {
            keepAlive: true,
            maxSockets: 40,
            maxFreeSockets: 10
          },
       }
    }
  })
}
