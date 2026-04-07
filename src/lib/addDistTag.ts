// @ts-ignore
import RegClient from 'anonymous-npm-registry-client'
import { quietLog } from './quietLog.js'
import { REGISTRY_MOCK_CREDENTIALS } from './credentials.js'

export default function (port: number | string) {
  const client = new RegClient({ log: quietLog })
  const auth = {
    ...REGISTRY_MOCK_CREDENTIALS,
    alwaysAuth: true,
  }
  return (opts: { package: string, version: string, distTag: string }) => {

    // just to make verdaccio cache the package
    return new Promise<void>((resolve, reject) => {
      client.distTags.fetch(`http://localhost:${port}`, {package: opts.package, auth}, (err: Error) => {
        if (err) {
          reject(err)
          return
        }

        // the tag has to be removed first because in verdaccio it is an array of versions
        client.distTags.rm(`http://localhost:${port}`, {package: opts.package, distTag: opts.distTag, auth}, (err: Error) => {
          if (err) {
            reject(err)
            return
          }

          client.distTags.add(`http://localhost:${port}`, {...opts, auth}, (err: Error) => err ? reject(err) : resolve())
        })
      })
    })
  }
}
