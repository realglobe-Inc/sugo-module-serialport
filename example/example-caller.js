#!/usr/bin/env node

/**
 * Example to call from caller
 * @see https://github.com/realglobe-Inc/sugo-caller
 */
'use strict'

const co = require('co')
const asleep = require('asleep')
const sugoCaller = require('sugo-caller')

co(function * () {
  let caller = sugoCaller('http://my-sugo-cloud.example.com/callers', {})
  let actor = caller.connect('my-serial-port-01')

  // Access to the module
  let sp = actor.get('serialport')

  // get list
  let list = yield sp.list()
  // get port path on Mac
  let portPath = list.find((port) => port.comName.startsWith('/dev/cu.usbserial')).comName

  // open the port
  yield sp.connect(portPath, {
    baudRate: 57600
  })

  yield asleep(1000)
  yield sp.write(Buffer.from('#M6'))
  yield asleep(3000)
  yield sp.write(Buffer.from('#M0'))
  yield asleep(1000)
  yield sp.close()
}).catch((err) => console.error(err))
