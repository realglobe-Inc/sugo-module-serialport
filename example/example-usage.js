#!/usr/bin/env node

/**
 * Example usage of the terminal
 */
'use strict'

const sugoInterfaceSerialport = require('sugo-interface-serialport')
const sugoSpot = require('sugo-spot')
const co = require('co')

co(function * () {
  let spot = sugoSpot('http://my-sugo-cloud.example.com/spots', {
    key: 'my-spot-01',
    interfaces: {
      // Register the interface
      myInterface01: sugoInterfaceSerialport({})
    }
  })
  yield spot.connect()
}).catch((err) => console.error(err))
