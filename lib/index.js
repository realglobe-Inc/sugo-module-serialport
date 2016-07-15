/**
 * SUGOS module to access serial ports
 * @module sugo-module-serialport
 */

'use strict'

const sugoModuleSerialport = require('./sugo_module_serialport')

let lib = sugoModuleSerialport.bind(this)

Object.assign(lib, sugoModuleSerialport, {
  sugoModuleSerialport
})

module.exports = lib
