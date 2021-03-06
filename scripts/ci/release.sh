#!/bin/sh

set -e

git checkout master

yarn compile:esm
npx lerna version --conventional-commits --no-push --yes
npx lerna publish from-git --npm-client npm --yes

git push --follow-tags
