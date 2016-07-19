/**
 * Test case for sugoModuleSerialport.
 * Runs with mocha.
 */
'use strict'

const sugoModuleSerialport = require('../lib/sugo_module_serialport.js')
const assert = require('assert')
const sgSchemas = require('sg-schemas')
const sgValidator = require('sg-validator')
const co = require('co')

describe('sugo-module-serialport', () => {
  before(() => co(function * () {

  }))

  after(() => co(function * () {

  }))

  it('Get module spec', () => co(function * () {
    let module_ = sugoModuleSerialport({})
    assert.ok(module_)

    let { $spec } = module_
    let specError = sgValidator(sgSchemas.moduleSpec).validate($spec)
    assert.ok(!specError)
  }))

  it('Try ping-pong', () => co(function * () {
    let module_ = sugoModuleSerialport({})
    let pong = yield module_.ping('pong')
    assert.equal(pong, 'pong')
  }))

  it('Do assert', () => co(function * () {
    let module_ = sugoModuleSerialport({})
    let caught
    try {
      yield module_.assert({})
    } catch (err) {
      caught = err
    }
    assert.ok(!caught)
  }))

  it('Compare methods with spec', () => co(function * () {
    let module_ = sugoModuleSerialport({})
    let { $spec } = module_
    let implemented = Object.keys(module_).filter((name) => !/^[\$_]/.test(name))
    let described = Object.keys($spec.methods).filter((name) => !/^[\$_]/.test(name))
    for (let name of implemented) {
      assert.ok(!!~described.indexOf(name), `${name} method should be described in spec`)
    }
    for (let name of described) {
      assert.ok(!!~implemented.indexOf(name), `${name} method should be implemented`)
    }
  }))
})

/* global describe, before, after, it */
