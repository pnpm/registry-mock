'use strict'
const path = require('path')
const childProcess = require('child_process')
const readYamlFile = require('read-yaml-file')
const writeYamlFile = require('write-yaml-file')
const locations = require('./lib/locations')

module.exports = function (opts) {
  const config = readYamlFile.sync(path.join(__dirname, 'registry/config.yaml'))
  const configPath = path.join(__dirname, 'registry/runtime-config.yaml')
  writeYamlFile.sync(configPath, {
    ...config,
    uplinks: { npmjs: { url: opts.uplink } }
  })
  const verdaccioBin = require.resolve('verdaccio/bin/verdaccio')
  return childProcess.spawnSync('node', [verdaccioBin, '-c', configPath], {stdio: 'inherit'})
}

module.exports.addDistTag = require('./lib/addDistTag')

module.exports.getIntegrity = (pkgName, pkgVersion) => {
  return require(path.join(locations.storage(), pkgName, 'package.json')).versions[pkgVersion].dist.integrity
}
