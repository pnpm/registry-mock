#!/bin/bash

set -e;

cd packages;
export pnpm_config_registry=http://localhost:4873/;
export npm_config_registry=http://localhost:4873/;
pnpm config set "//localhost:4873/:_authToken=h6zsF82dzSCnFsws9nQXtxyKcBY";

exitstatus=0

for d in **/package.json; do
  cd $(dirname $d);
  # Use npm pack + pnpm publish for packages with raw catalog: protocol specs,
  # since pnpm publish from a directory would try to resolve them.
  if grep -q '"catalog:' package.json; then
    tarball=$(npm pack --ignore-scripts --pack-destination ..)
    pnpm publish --no-git-checks --@jsr:registry=http://localhost:4873/ "../$tarball" || exitstatus=$?;
    rm -f "../$tarball"
  else
    pnpm publish --no-git-checks --@jsr:registry=http://localhost:4873/ || exitstatus=$?;
  fi
  cd ..;
  if [ $exitstatus -ne 0 ]; then
    break;
    exit $exitstatus;
  fi
done

# Verdaccio currently does not support deprecation
# so we manually modify the metadata
node deprecate.cjs @pnpm.e2e/deprecated;
node update-time.cjs

exit $exitstatus
