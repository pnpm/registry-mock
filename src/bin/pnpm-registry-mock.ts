#!/usr/bin/env node
import cpr from 'cpr'
import pnpmRegistryMock from '..'
import * as locations from '../lib/locations'
import { sync as readYamlFile } from 'read-yaml-file'
import writeYamlFile from 'write-yaml-file'
import path from 'path'

if (process.argv[2] === 'prepare') {
  const tempy = require('tempy')
  const storage = tempy.directory()

  const storageCache = locations.storageCache()
  cpr(
    storageCache,
    storage,
    {},
    (err: Error | null) => err && console.error(err)
  )
  const config = readYamlFile<any>(path.join(__dirname, '../../registry/config.yaml'))
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
} else {
  pnpmRegistryMock()
}
