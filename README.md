# @pnpm/registry-mock

> Mock the npm registry

## Installation

```sh
pnpm add @pnpm/registry-mock
```

## API

### `getIntegrity(pkgName, pkgVersion): string`

### CLI

Preparing a fresh storage: `registry-mock prepare`

Running the registry mock: `registry-mock`

By default, `https://registry.npmjs.org/` is used to download packages.
A custom uplink can be set via the `PNPM_REGISTRY_MOCK_UPLINK` env variable.

The registry mock will listen on port 4873, unless a different port is
specified via the `PNPM_REGISTRY_MOCK_PORT` env variable.

## License

MIT
