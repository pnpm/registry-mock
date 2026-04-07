const fs = require('fs')
const path = require('path')
const storageCache = path.join(__dirname, '../registry/storage-cache')

// Set all package versions to an old date so that minimumReleaseAge checks pass.
// Then override specific packages with custom dates for tests that depend on them.
const OLD_DATE = '2022-01-01T00:00:00.000Z'

for (const entry of fs.readdirSync(storageCache, { recursive: true })) {
  if (!entry.endsWith('/package.json') && !entry.endsWith('\\package.json')) continue
  // Skip nested directories (only process scope/pkg/package.json or pkg/package.json)
  const parts = entry.split(path.sep)
  if (parts.length > 3) continue
  const metaFilePath = path.join(storageCache, entry)
  try {
    const meta = JSON.parse(fs.readFileSync(metaFilePath, 'utf8'))
    let changed = false
    if (meta.time) {
      for (const key of Object.keys(meta.time)) {
        if (key === 'created' || key === 'modified') continue
        meta.time[key] = OLD_DATE
      }
      changed = true
    }
    // Verdaccio 6's abbreviated metadata only includes "bundleDependencies" (without the "d"),
    // so copy "bundledDependencies" to "bundleDependencies" to ensure it's served correctly.
    for (const version of Object.values(meta.versions ?? {})) {
      if (version.bundledDependencies && !version.bundleDependencies) {
        version.bundleDependencies = version.bundledDependencies
        changed = true
      }
    }
    if (changed) {
      fs.writeFileSync(metaFilePath, JSON.stringify(meta, null, 2), 'utf8')
    }
  } catch {}
}

// Override specific packages with custom dates for time-sensitive tests
updateTime('@pnpm.e2e/bravo', { '1.0.0': '2022-04-01T20:17:46.770Z' });
updateTime('@pnpm.e2e/romeo', { '1.0.0': '2022-01-01T20:17:46.770Z' });
updateTime('@pnpm.e2e/bravo-dep', {
 '1.0.0': '2022-02-01T20:17:46.770Z',
 '1.0.1': '2022-02-22T20:17:46.770Z',
 '1.1.0': '2022-05-01T20:17:46.770Z',
});
updateTime('@pnpm.e2e/romeo-dep', {
 '1.0.0': '2022-03-01T20:17:46.770Z',
 '1.1.0': '2022-07-01T20:17:46.770Z',
});

function updateTime (pkgName, newTime) {
  const metaFilePath = path.join(storageCache, pkgName, 'package.json')
  const meta = JSON.parse(fs.readFileSync(metaFilePath, 'utf8'))
  meta.time = {
    ...meta.time,
    ...newTime,
  }
  fs.writeFileSync(metaFilePath, JSON.stringify(meta, null, 2), 'utf8')
}
