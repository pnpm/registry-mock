'use strict'
const childProcess = require('child_process')

module.exports = () => {
  return childProcess.spawnSync('node', ['node_modules/verdaccio/bin/verdaccio', '-c', './registry/config.yaml'], {stdio: 'inherit'})
}
