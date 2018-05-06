'use strict'
const path = require('path')
const childProcess = require('child_process')
const locations = require('./lib/locations')

module.exports = () => {
  const configPath = path.join(__dirname, 'registry/config.yaml')
  const verdaccioBin = require.resolve('verdaccio/bin/verdaccio')
  return childProcess.spawnSync('node', [verdaccioBin, '-c', configPath], {stdio: 'inherit'})
}

module.exports.addDistTag = require('./lib/addDistTag')

module.exports.getIntegrity = (pkgName, pkgVersion) => {
  return require(path.join(locations.storage(), pkgName, 'package.json')).versions[pkgVersion].dist.integrity
}
