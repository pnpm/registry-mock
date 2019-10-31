const writeJsonFile = require('write-json-file')
const path = require('path')

const pkgToDeprecate = process.argv[2]

const manifestPath = path.join(__dirname, '../registry/storage-cache', pkgToDeprecate, 'package.json')
const pkg = require(manifestPath)

Object.values(pkg.versions).forEach(pkgVersionManifest => {
  pkgVersionManifest.deprecated = 'This package is deprecated. Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
})

writeJsonFile.sync(manifestPath, pkg)
