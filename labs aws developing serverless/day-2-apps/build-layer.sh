#!/bin/bash
set -eo pipefail
cd error-processor
mkdir -p lib/nodejs/node20
rm -rf lib/nodejs/node20/node_modules
npm install --loglevel=error > /dev/null 
npm install aws-xray-sdk --loglevel=error > /dev/null
mv node_modules lib/nodejs/node20