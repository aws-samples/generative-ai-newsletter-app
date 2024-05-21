/*
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 *
 * This file is used to properly compile the AppSync Javascript Functions (Resolver and Pipeline)
 * from TypeScript to Javascript.
 *
 * The build process is done by using esbuild. It is executed by node rather than esbuild to generate paths
 * to files dynamically without using 'globs' since they are not safe for windows
 */

import esbuild from 'esbuild'
import fs from 'fs'
import path from 'path'

const outDir = path.join(__dirname, 'out')

const resolverFunctions = fs.readdirSync(path.join(__dirname, 'resolver')).map((functionName) => {
  return path.join(__dirname, 'resolver', functionName, 'index.ts')
})
const pipelineFunctions = fs.readdirSync(path.join(__dirname, 'pipeline')).map((functionName) => {
  return path.join(__dirname, 'pipeline', functionName, 'index.ts')
})

esbuild.build({
  bundle: true,
  entryPoints: [
    ...resolverFunctions,
    ...pipelineFunctions
  ],
  outdir: outDir,
  sourcemap: 'inline',
  sourcesContent: false,
  external: ['@aws-appsync/utils'],
  platform: 'node',
  target: 'esnext',
  format: 'esm',
  minify: false,
  logLevel: 'info'
}).catch(() => process.exit(1))
