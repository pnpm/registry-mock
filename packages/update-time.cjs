const fs = require('fs')
const path = require('path')
const storageCache = path.join(__dirname, '../registry/storage-cache')

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
