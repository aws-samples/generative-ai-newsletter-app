#!/bin/sh
# Accept optional argument $1 which is a manual override
if [ -z "$1" ]; then
    VERSION=$(npx git-conventional-commits version)
else
    VERSION=$1
fi
npm version ${VERSION} -m "build(release): bump project version to %s"
npx git-conventional-commits changelog --release ${VERSION} --file 'CHANGELOG.md'
git commit -am"docs(release): update CHANGELOG.md with ${VERSION}"
git tag -am"build(release): ${VERSION}" "v${VERSION}"