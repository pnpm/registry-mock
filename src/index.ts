import fs from 'fs'
import path from 'path'
import execa from 'execa'
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

export const addDistTag = _addDistTag(REGISTRY_MOCK_PORT)
export const addUser = _addUser(REGISTRY_MOCK_PORT)

export const getIntegrity = (pkgName: string, pkgVersion: string): string => {
  return JSON.parse(fs.readFileSync(
    path.join(locations.storage(), pkgName, 'package.json'),
    'utf8'
  )).versions[pkgVersion].dist.integrity
}

export { REGISTRY_MOCK_PORT }
