/**
 * SUGOS module to access serial ports
 * @module sugo-module-serialport
 * @version 2.0.1
 */

'use strict'

const create = require('./create')
const Serialport = require('./serialport')

let lib = create.bind(this)

Object.assign(lib, Serialport, {
  create,
  Serialport
})

module.exports = lib
