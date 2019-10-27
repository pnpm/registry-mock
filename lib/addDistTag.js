'use strict'
const RegClient = require('anonymous-npm-registry-client')

module.exports = (port) => (opts) => {
  const client = new RegClient()

  // just to make verdaccio cache the package
  return new Promise((resolve, reject) => {
    client.distTags.fetch(`http://localhost:${port}`, {package: opts.package}, (err) => {
      if (err) {
        reject(err)
        return
      }

      // the tag has to be removed first because in verdaccio it is an array of versions
      client.distTags.rm(`http://localhost:${port}`, {package: opts.package, distTag: opts.distTag}, (err) => {
        if (err) {
          reject(err)
          return
        }

        client.distTags.add(`http://localhost:${port}`, opts, (err) => err ? reject(err) : resolve())
      })
    })
  })
}
