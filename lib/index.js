/**
 * SUGOS interface to access serial ports
 * @module sugo-interface-serialport
 */

'use strict'

const sugoInterfaceSerialport = require('./sugo_interface_serialport')

let lib = sugoInterfaceSerialport.bind(this)

Object.assign(lib, sugoInterfaceSerialport, {
  sugoInterfaceSerialport
})

module.exports = lib
