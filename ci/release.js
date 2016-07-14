#!/usr/bin/env node

/**
 * Release this package.
 */

'use strict'

process.chdir(`${__dirname}/..`)

const { release } = require('sugo-ci-interface')

release({
  beforeRelease: [
    './ci/build.js',
    './ci/test.js'
  ]
})
