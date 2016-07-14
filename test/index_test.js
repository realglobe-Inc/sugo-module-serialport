/**
 * Test case for index.
 * Runs with mocha.
 */
'use strict'

const index = require('../lib/index.js')
const assert = require('assert')
const co = require('co')

describe('index', () => {
  before(() => co(function * () {

  }))

  after(() => co(function * () {

  }))

  it('Create instance from index', () => co(function * () {
    let interface_ = index({})
    assert.ok(interface_)
  }))
})

/* global describe, before, after, it */
