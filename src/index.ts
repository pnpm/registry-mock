import fs from 'fs'
import path from 'path'
import execa from 'execa'
import { sync as readYamlFile } from 'read-yaml-file'
import writeYamlFile from 'write-yaml-file'
import cpr from 'cpr'
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

export function start (opts: execa.Options) {
  const verdaccioBin = require.resolve('verdaccio/bin/verdaccio')
  return execa('node',
    [
      verdaccioBin,
      '--config',
      locations.configPath(),
      '--listen',
      REGISTRY_MOCK_PORT
    ],
    opts
  )
}

export const addDistTag = _addDistTag(REGISTRY_MOCK_PORT)
export const addUser = _addUser(REGISTRY_MOCK_PORT)

export const getIntegrity = (pkgName: string, pkgVersion: string): string => {
  return JSON.parse(fs.readFileSync(
    path.join(locations.storage(), pkgName, 'package.json'),
    'utf8'
  )).versions[pkgVersion].dist.integrity
}

export { REGISTRY_MOCK_PORT }

export function prepare () {
  const tempy = require('tempy')
  const storage = tempy.directory()

  const storageCache = locations.storageCache()
  cpr(
    storageCache,
    storage,
    {},
    (err: Error | null) => err && console.error(err)
  )
  const config = readYamlFile<any>(path.join(__dirname, '../registry/config.yaml'))
  writeYamlFile.sync(locations.configPath(), {
    ...config,
    storage,
    uplinks: {
      npmjs: {
        url: process.env['PNPM_REGISTRY_MOCK_UPLINK'] || 'https://registry.npmjs.org/',
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
