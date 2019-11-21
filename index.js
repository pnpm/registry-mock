'use strict'
const path = require('path')
const childProcess = require('child_process')
const locations = require('./lib/locations')
const REGISTRY_MOCK_PORT = locations.REGISTRY_MOCK_PORT

module.exports = function (opts) {
  const verdaccioBin = require.resolve('verdaccio/bin/verdaccio')
  return childProcess.spawnSync('node',
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

module.exports.addDistTag = require('./lib/addDistTag')(REGISTRY_MOCK_PORT)

module.exports.getIntegrity = (pkgName, pkgVersion) => {
  return require(path.join(locations.storage(), pkgName, 'package.json')).versions[pkgVersion].dist.integrity
}

module.exports.REGISTRY_MOCK_PORT = REGISTRY_MOCK_PORT
