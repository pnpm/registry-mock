#!/usr/bin/env node
import pnpmRegistryMock, { prepare } from '..'

if (process.argv[2] === 'prepare') {
  prepare()
} else {
  pnpmRegistryMock()
}
