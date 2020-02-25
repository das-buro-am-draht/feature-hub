#!/bin/sh

set -e

yarn lerna exec --scope @das-buro-am-draht/website 'rm -rf build'
yarn lerna exec --scope @das-buro-am-draht/website 'docusaurus-build'
yarn run generate:api-docs
yarn lerna run --scope @das-buro-am-draht/demos build:todomvc
