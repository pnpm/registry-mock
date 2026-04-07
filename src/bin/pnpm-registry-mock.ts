#!/usr/bin/env node
import pnpmRegistryMock, { prepare } from '../index.js'

if (process.argv[2] === 'prepare') {
  prepare()
} else {
  pnpmRegistryMock()
}
