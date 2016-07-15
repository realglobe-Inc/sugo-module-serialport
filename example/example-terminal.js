#!/usr/bin/env node

/**
 * Example control from remote caller
 */
'use strict'

const co = require('co')
const assert = require('assert')
const sugoCaller = require('sugo-caller')

co(function * () {
  let caller = sugoCaller('http://my-sugo-cloud.example.com/callers', {})
  let actor = caller.connect('my-actor-01')

  // Access to the module
  let myModule01 = actor.myModule01()

  // Send ping
  let pong = yield myModule01.ping()
  assert.ok(pong)
}).catch((err) => console.error(err))
