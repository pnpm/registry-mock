#!/bin/bash

set -e;

cd packages;
export pnpm_config_registry=http://localhost:4873/;
export npm_config_registry=http://localhost:4873/;
pnpm config set "//localhost:4873/:_authToken=h6zsF82dzSCnFsws9nQXtxyKcBY";

# .npmrc needed because pnpm overrides npm_config_ env vars in lifecycle scripts
echo "registry=http://localhost:4873/" > .npmrc
echo "//localhost:4873/:_authToken=h6zsF82dzSCnFsws9nQXtxyKcBY" >> .npmrc

exitstatus=0

for d in **/package.json; do
  cd $(dirname $d);
  # Use npm pack + pnpm publish for packages that pnpm can't publish directly:
  # - catalog: protocol specs (pnpm would try to resolve them)
  # - bundleDependencies (pnpm requires hoisted nodeLinker)
  if grep -q '"catalog:\|"bundleDependencies\|"bundledDependencies' package.json; then
    tarball=$(npm pack --pack-destination ..)
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
rm -f .npmrc
node deprecate.cjs @pnpm.e2e/deprecated;
node update-time.cjs

exit $exitstatus
