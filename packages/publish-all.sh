#!/bin/bash

set -e;

cd packages;
export npm_config_registry=http://localhost:4873/;
npm config set "//localhost:4873/:_authToken=h6zsF82dzSCnFsws9nQXtxyKcBY";

exitstatus=0

for d in **/package.json; do
  cd $(dirname $d);
  npm publish || exitstatus=$?;
  cd ..;
  if [ $exitstatus -ne 0 ]; then
    break;
    exit $exitstatus;
  fi
done

# Verdaccio currently does not support deprecation
# so we manually modify the metadata
node deprecate @pnpm.e2e/deprecated;
node update-time.js

exit $exitstatus
