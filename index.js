'use strict'
const path = require('path')
const execa = require('execa')
const locations = require('./lib/locations')
const REGISTRY_MOCK_PORT = locations.REGISTRY_MOCK_PORT

module.exports = function (opts) {
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

module.exports.addDistTag = require('./lib/addDistTag')(REGISTRY_MOCK_PORT)

module.exports.getIntegrity = (pkgName, pkgVersion) => {
  return require(path.join(locations.storage(), pkgName, 'package.json')).versions[pkgVersion].dist.integrity
}

module.exports.REGISTRY_MOCK_PORT = REGISTRY_MOCK_PORT
