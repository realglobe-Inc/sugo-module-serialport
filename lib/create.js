/**
 * Create a module instance
 * @function create
 * @returns {Serialport}
 */
'use strict'

const Serialport = require('./serialport')

/** @lends create */
function create (...args) {
  return new Serialport(...args)
}

module.exports = create
