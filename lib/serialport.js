/**
 * SUGOS module to access serial ports
 * @class Serialport
 * @augments Module
 * @param {Object} config - Configuration
 */
'use strict'

const Driver = require('serialport')
const { Module } = require('sugo-module-base')
const { name, version, description } = require('../package.json')
const co = require('co')
const { hasBin } = require('sg-check')
const assert = require('assert')
const debug = require('debug')('sugo:module:serialport')

/** @lends Serialport */
class Serialport extends Module {
  constructor (config = {}) {
    debug('Config: ', config)
    super(config)

    const s = this
    s._driver = null
  }

  /**
   * Ping a message.
   * @param {string} pong - Pong message
   * @returns {Promise.<string>} - Pong message
   */
  ping (pong = 'pong') {
    return co(function * () {
      return pong
    })
  }

  /**
   * Assert actor system requirements.
   * @throws {Error} - System requirements failed error
   * @returns {Promise.<boolean>} - Asserted state
   */
  assert () {
    const bins = [ 'node' ] // Required commands
    return co(function * assertAck () {
      yield hasBin.assertAll(bins)
      return true
    })
  }

  /**
   * Driver instance
   */
  get driver () {
    const s = this
    let { _driver } = s
    assert.ok(_driver, 'Serialport is not connected')
    return _driver
  }

  /**
   * Retrieves a list of available serial ports with metadata.
   * @returns {Promise.<object>}
   */
  list () {
    return new Promise((resolve, reject) => {
      Driver.list((err, ports) =>
        err ? reject(err) : resolve(ports)
      )
    })
  }

  /**
   * Connect to a path
   * @param {string} path
   * @param {object} options
   * @returns {Promise}
   */
  connect (path, options) {
    const s = this
    return co(function * () {
      let driver = new Driver(path, options)

      let pipeEvents = [
        'data', 'error', 'close', 'disconnect', 'open'
      ]
      debug('Create pipe for events: ', pipeEvents)
      for (let event of pipeEvents) {
        driver.on(event, (data) => s.emit(event, data))
      }
      yield new Promise((resolve, reject) => {
        driver.on('error', (err) => reject(err))
        driver.on('open', () => resolve())
      })
      s._driver = driver
    })
  }

  /**
   * Opens a connection to the given serial port.
   * @returns {Promise}
   */
  open () {
    const s = this
    return new Promise((resolve, reject) => {
      let { driver } = s
      driver.open(_handle(resolve, reject))
    })
  }

  /**
   * Returns true if the port is open.
   * @returns {Promise.<boolean>}
   */
  isOpen () {
    const s = this
    return co(function * () {
      let { _driver } = s
      return _driver && _driver.isOpen()
    })
  }

  /**
   * Write data to the given serial port.
   * @param {object} data - Buffer data.
   * @returns {Promise}
   */
  write (data) {
    const s = this
    return new Promise((resolve, reject) => {
      let { driver } = s
      driver.write(data, _handle(resolve, reject))
    })
  }

  /**
   * Pauses an open connection.
   * @returns {Promise}
   */
  pause () {
    const s = this
    return co(function * () {
      let { driver } = s
      driver.pause()
    })
  }

  /**
   * Resumes a paused connection.
   * @returns {Promise}
   */
  resume () {
    const s = this
    return co(function * () {
      let { driver } = s
      driver.resume()
    })
  }

  /**
   * Flushes data received but not read.
   * @returns {Promise}
   */
  flush () {
    const s = this
    return new Promise((resolve, reject) => {
      let { driver } = s
      driver.flush(_handle(resolve, reject))
    })
  }

  /**
   * Waits until all output data has been transmitted to the serial port.
   * @returns {Promise}
   */
  drain () {
    const s = this
    return new Promise((resolve, reject) => {
      let { driver } = s
      driver.drain(_handle(resolve, reject))
    })
  }

  /**
   * Close the given serial port.
   * @returns {Promise}
   */
  close () {
    const s = this
    return new Promise((resolve, reject) => {
      let { driver } = s
      driver.close(_handle(resolve, reject))
    })
  }

  /**
   * Sets flags on an open port.
   * @param {object} options
   * @returns {Promise}
   */
  set (options) {
    const s = this
    return new Promise((resolve, reject) => {
      let { driver } = s
      driver.set(options, _handle(resolve, reject))
    })
  }

  /**
   * Changes the baudrate for an open port.
   * @param {object} options
   * @returns {Promise}
   */
  update (options) {
    const s = this
    return new Promise((resolve, reject) => {
      let { driver } = s
      driver.update(options, _handle(resolve, reject))
    })
  }

  /**
   * Module specification
   * @see https://github.com/realglobe-Inc/sg-schemas/blob/master/lib/module_spec.json
   */
  get $spec () {
    return {
      name,
      version,
      desc: description,
      methods: {

        ping: {
          desc: 'Test the reachability of an module.',
          params: [
            { name: 'pong', type: 'string', desc: 'Pong message to return' }
          ],
          return: {
            type: 'string',
            desc: 'Pong message'
          }
        },

        assert: {
          desc: 'Test if the actor fulfills system requirements',
          params: [],
          throws: [ {
            type: 'Error',
            desc: 'System requirements failed'
          } ],
          return: {
            type: 'boolean',
            desc: 'System is OK'
          }
        },

        list: {
          desc: 'Retrieves a list of available serial ports with metadata.',
          params: [],
          throws: [ {
            type: 'Error',
            desc: 'Listing failed'
          } ],
          return: {
            type: 'array',
            desc: 'The list of serial ports'
          }
        },

        connect: {
          desc: 'Create a new connection',
          params: [
            { name: 'path', type: 'string', desc: 'path' },
            { name: 'options', type: 'object', desc: 'options' }
          ]
        },

        close: {
          desc: 'Close the given serial port.',
          params: []
        },

        drain: {
          desc: 'Waits until all output data has been transmitted to the serial port.',
          params: []
        },

        flush: {
          desc: 'Flushes data received but not read.',
          params: []
        },

        isOpen: {
          desc: 'Returns true if the port is open.',
          params: []
        },

        open: {
          desc: 'Open a serial port.',
          params: []
        },

        pause: {
          desc: 'Pauses an open connection.',
          params: []
        },

        resume: {
          desc: 'Resumes a paused connection.',
          params: []
        },

        set: {
          desc: 'Sets flags on an open port.',
          params: []
        },

        update: {
          desc: 'Changes the baudrate for an open port.',
          params: []
        },

        write: {
          desc: 'Write data to the given serial port.',
          params: [
            { name: 'data', type: 'object', desc: 'Buffer data to write' }
          ]
        }
      },
      events: {
        open: { desc: 'the port is opened and ready for writing.' },
        close: { desc: 'the port is closed.' },
        disconnect: { desc: 'happen before a close event if a disconnection is detected.' },
        data: { desc: 'there is an data.' },
        error: { desc: 'there is an error.' }
      }
    }
  }
}

function _handle (resolve, reject) {
  return (err) => err ? reject(err) : resolve()
}

module.exports = Serialport

/**
 * @property {Array} params - Invoke parameters.
 * @property {EventEmitter} pipe - Pipe to remote caller.
 */
