// @ts-ignore
import RegClient from 'anonymous-npm-registry-client'

export default function (port: number | string) {
  return (opts: { package: string, version: string, distTag: string }) => {
    const client = new RegClient()

    // just to make verdaccio cache the package
    return new Promise<void>((resolve, reject) => {
      client.distTags.fetch(`http://localhost:${port}`, {package: opts.package}, (err: Error) => {
        if (err) {
          reject(err)
          return
        }

        // the tag has to be removed first because in verdaccio it is an array of versions
        client.distTags.rm(`http://localhost:${port}`, {package: opts.package, distTag: opts.distTag}, (err: Error) => {
          if (err) {
            reject(err)
            return
          }

          client.distTags.add(`http://localhost:${port}`, opts, (err: Error) => err ? reject(err) : resolve())
        })
      })
    })
  }
}
