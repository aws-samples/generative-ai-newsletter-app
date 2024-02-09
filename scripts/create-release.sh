#!/bin/sh
VERSION=$(npx git-conventional-commits version)
npm version ${VERSION} -m "build(release): bump project version to %s"
npx git-conventional-commits changelog --release ${VERSION} --file 'CHANGELOG.md'
git commit -am"docs(release): update CHANGELOG.md with ${VERSION}"
git tag -am"build(release): ${VERSION}" ${VERSION}