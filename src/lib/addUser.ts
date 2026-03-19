// @ts-ignore
import RegClient from 'anonymous-npm-registry-client'
import { quietLog } from './quietLog'

export default function (port: number | string) {
  const client = new RegClient({ log: quietLog })
  return (auth: { username: string, email: string, password: string }): Promise<{ token: string }> => {
    return new Promise<{ token: string }>((resolve, reject) => {
      client.adduser(`http://localhost:${port}`, { auth }, (err: Error, data: { token: string }) => err ? reject(err) : resolve(data))
    })
  }
}
