/**
 * SUGOS module to access serial ports
 * @function sugoModuleSerialport
 * @param {Object} config - Configuration
 * @returns {Object} - Module settings
 */
'use strict'

const Serialport = require('serialport')
const { name, version, description } = require('../package.json')
const co = require('co')
const { hasBin } = require('sg-check')
const assert = require('assert')
const debug = require('debug')('sugo:module:serialport')

const NOT_CONNECT = 'Serialport is not connected'
let _serialport = null

/** @lends sugoModuleSerialport */
function sugoModuleSerialport (config = {}) {
  debug('Config: ', config)

  return {

    /**
     * Ping a message.
     * @param {string} pong - Pong message
     * @returns {Promise.<string>} - Pong message
     */
    ping (pong = 'pong') {
      return co(function * () {
        return pong
      })
    },

    /**
     * Assert actor system requirements.
     * @throws {Error} - System requirements failed error
     * @returns {Promise.<boolean>} - Asserted state
     */
    assert () {
      const bins = [ 'node' ] // Required commands
      return co(function * assertAck () {
        for (let bin of bins) {
          let ok = yield hasBin(bin)
          if (!ok) {
            throw new Error(`[${name}] Command not found: ${bin}`)
          }
        }
        return true
      })
    },

    /**
     * Retrieves a list of available serial ports with metadata.
     * @returns {Promise.<object>}
     */
    list () {
      return new Promise((resolve, reject) => {
        Serialport.list((err, ports) => {
          if (err) {
            throw err
          }
          resolve(ports)
        })
      })
    },

    /**
     * Create a new serial port object.
     * @param {string} path
     * @param {object} options
     * @returns {Promise}
     */
    SerialPort (path, options) {
      const s = this
      return new Promise((resolve, reject) => {
        let port
        try {
          port = new Serialport(path, options)
        } catch (e) {
          reject(e)
          return
        }
        _serialport = port

        let portsPipe = (events) => events.forEach(event => {
          debug(event)
          port.on(event, (data) => s.emit(event, data))
        })

        portsPipe([
          'data', 'error', 'close', 'disconnect', 'open'
        ])
      })
    },

    /**
     * Opens a connection to the given serial port.
     * @returns {Promise}
     */
    open () {
      return new Promise((resolve, reject) => {
        assert.ok(_serialport, NOT_CONNECT)
        _serialport.open(_handle(resolve, reject))
      })
    },

    /**
     * Returns true if the port is open.
     * @returns {Promise.<boolean>}
     */
    isOpen () {
      return co(function * () {
        assert.ok(_serialport, NOT_CONNECT)
        return _serialport.isOpen()
      })
    },

    /**
     * Write data to the given serial port.
     * @param {object} data - Buffer data.
     * @returns {Promise}
     */
    write (data) {
      return new Promise((resolve, reject) => {
        assert.ok(_serialport, NOT_CONNECT)
        _serialport.write(data, _handle(resolve, reject))
      })
    },

    /**
     * Pauses an open connection.
     * @returns {Promise}
     */
    pause () {
      return co(function * () {
        assert.ok(_serialport, NOT_CONNECT)
        _serialport.pause()
      })
    },

    /**
     * Resumes a paused connection.
     * @returns {Promise}
     */
    resume () {
      return co(function * () {
        assert.ok(_serialport, NOT_CONNECT)
        _serialport.resume()
      })
    },

    /**
     * Flushes data received but not read.
     * @returns {Promise}
     */
    flush () {
      return new Promise((resolve, reject) => {
        assert.ok(_serialport, NOT_CONNECT)
        _serialport.flush(_handle(resolve, reject))
      })
    },

    /**
     * Waits until all output data has been transmitted to the serial port.
     * @returns {Promise}
     */
    drain () {
      return new Promise((resolve, reject) => {
        assert.ok(_serialport, NOT_CONNECT)
        _serialport.drain(_handle(resolve, reject))
      })
    },

    /**
     * Close the given serial port.
     * @returns {Promise}
     */
    close () {
      return new Promise((resolve, reject) => {
        assert.ok(_serialport, NOT_CONNECT)
        _serialport.close(_handle(resolve, reject))
      })
    },

    /**
     * Sets flags on an open port.
     * @param {object} options
     * @returns {Promise}
     */
    set (options) {
      return new Promise((resolve, reject) => {
        assert.ok(_serialport, NOT_CONNECT)
        _serialport.set(options, _handle(resolve, reject))
      })
    },

    /**
     * Changes the baudrate for an open port.
     * @param {object} options
     * @returns {Promise}
     */
    update (options) {
      return new Promise((resolve, reject) => {
        assert.ok(_serialport, NOT_CONNECT)
        _serialport.update(options, _handle(resolve, reject))
      })
    },

    /**
     * Module specification
     * @see https://github.com/realglobe-Inc/sg-schemas/blob/master/lib/module_spec.json
     */
    $spec: {
      name,
      version,
      desc: description,
      methods: {

        // ( Describe your custom methods here )

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

        SerialPort: {
          desc: 'Create a new serial port object',
          params: [
            {name: 'path', type: 'string', desc: 'path'},
            {name: 'options', type: 'object', desc: 'options'}
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
            {name: 'data', type: 'object', desc: 'Buffer data to write'}
          ]
        }
      },
      events: {
        open: { desc: 'Callback is called with no arguments when the port is opened and ready for writing.' },
        close: { desc: 'Callback is called with no arguments when the port is closed.' },
        disconnect: { desc: 'Callback is called with an error object. This will always happen before a close event if a disconnection is detected.' },
        data: { desc: 'Callback is called with data depending on your chosen parser.' },
        error: { desc: 'Callback is called with an error object whenever there is an error.' }
      }
    }
  }
}

function _handle (resolve, reject) {
  return (err) => {
    if (err) {
      reject(err)
    }
    resolve()
  }
}

module.exports = sugoModuleSerialport

/**
 * @property {Array} params - Invoke parameters.
 * @property {EventEmitter} pipe - Pipe to remote caller.
 */
