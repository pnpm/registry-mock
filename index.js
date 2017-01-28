'use strict'
const path = require('path')
const childProcess = require('child_process')

module.exports = () => {
  const configPath = path.join(__dirname, 'registry/config.yaml')
  const verdaccioBin = 'node_modules/verdaccio/bin/verdaccio'
  return childProcess.spawnSync('node', [verdaccioBin, '-c', configPath], {stdio: 'inherit'})
}
