import path from 'path'
import execa from 'execa'
import { sync as readYamlFile } from 'read-yaml-file'
import writeYamlFile from 'write-yaml-file'
import fsx from 'fs-extra'
import * as locations from './lib/locations'
import _addDistTag from './lib/addDistTag'
import _addUser from './lib/addUser'

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
      // If verdaccio downloads a package from the uplink registry because it wasn't present, it
      // will respond to the HTTP request before it finishes writing the package.json file to the
      // storage directory. There is also a window where the package.json file may exist but be empty 
      // (see https://github.com/verdaccio/verdaccio/blob/ae0dbff9a549216bf54a0e1646db6bb743a0c960/packages/plugins/local-storage/src/local-fs.ts#L174-L187).
      // To handle this gracefully, retry reading the file with an exponential backoff strategy if
      // we encounter a syntax error or file not found error.
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, delay)
      delay *= 2
    }
  }
  // content should always be defined here, but check just in case
  if (!content) throw new Error(`Failed to read package.json for ${pkgName}@${pkgVersion} after ${maxRetries} attempts`)
  return content.versions[pkgVersion].dist.integrity
}

export { REGISTRY_MOCK_PORT }

export interface PrepareOptions {
  uplinkedRegistry?: string
}

export function prepare (opts?: PrepareOptions) {
  const tempy = require('tempy')
  const storage = tempy.directory()

  const storageCache = locations.storageCache()
  fsx.copySync(storageCache, storage)
  const config = readYamlFile<any>(path.join(__dirname, '../registry/config.yaml'))
  writeYamlFile.sync(locations.configPath(), {
    ...config,
    storage,
    uplinks: {
      npmjs: {
        url: opts?.uplinkedRegistry || process.env['PNPM_REGISTRY_MOCK_UPLINK'] || 'https://registry.npmjs.org/',
        // performance improvements
        // https://verdaccio.org/docs/en/uplinks

        // avoid go to uplink is offline
        max_fails: 100,
        // default is 10 min, avoid hit the registry for metadata
        maxage: '30m',
        // increase threshold to avoid uplink is offline
        fail_timeout: '10m',
        // increase threshold to avoid uplink is offline
        timeout: '600s',
          // pass down to request.js
          agent_options: {
            keepAlive: true,
            maxSockets: 40,
            maxFreeSockets: 10
          },
       }
    }
  })
}
