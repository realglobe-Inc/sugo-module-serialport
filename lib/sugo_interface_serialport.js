/**
 * SUGOS interface to access serial ports
 * @function sugoInterfaceSerialport
 * @param {Object} config - Configuration
 * @returns {Object} - Interface settings
 */
'use strict'

const Serialport = require('serialport')
const { name, version, description } = require('../package.json')
const co = require('co')
const { hasBin } = require('sg-check')
const assert = require('assert')
const debug = require('debug')('sugo:interface:serialport')

const NOT_CONNECT = 'Serialport is not connected'
let _serialport = null

/** @lends sugoInterfaceSerialport */
function sugoInterfaceSerialport (config = {}) {
  debug('Config: ', config)

  return {

    /**
     * Ping a message.
     * @param {SugoInterfaceContext} ctx
     * @returns {Promise.<string>} - Pong message
     */
    ping (ctx) {
      let { params, pipe } = ctx
      return co(function * pingAck () {
        return params[ 0 ] || 'pong' // Return result to remote terminal.
      })
    },

    /**
     * Assert spot system requirements.
     * @param {SugoInterfaceContext} ctx
     * @throws {Error} - System requirements failed error
     * @returns {Promise.<boolean>} - Asserted state
     */
    assert (ctx) {
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
     * @params {SugoInterfaceContext} ctx
     * @returns {Promise.<object>}
     */
    list (ctx) {
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
     * @params {SugoInterfaceContext} ctx
     * @returns {Promise}
     */
    SerialPort (ctx) {
      let { pipe, params } = ctx
      let [path, options, openCallback] = params
      return new Promise((resolve, reject) => {
        let port
        try {
          port = new Serialport(path, options, openCallback)
        } catch (e) {
          reject(e)
          return
        }
        _serialport = port

        let portsPipe = (events) => events.forEach(event => {
          debug(event)
          port.on(event, (data) => pipe.emit(event, data))
        })

        portsPipe([
          'data', 'error', 'close', 'disconnect', 'open'
        ])
      })
    },

    /**
     * Opens a connection to the given serial port.
     * @params {SugoInterfaceContext} ctx
     * @returns {Promise}
     */
    open (ctx) {
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
     * @params {SugoInterfaceContext} ctx
     * @returns {Promise}
     */
    write (ctx) {
      let { params } = ctx
      let [ data ] = params
      return new Promise((resolve, reject) => {
        assert.ok(_serialport, NOT_CONNECT)
        _serialport.write(data, _handle(resolve, reject))
      })
    },

    /**
     * Pauses an open connection.
     * @params {SugoInterfaceContext} ctx
     * @returns {Promise}
     */
    pause (ctx) {
      return co(function * () {
        assert.ok(_serialport, NOT_CONNECT)
        _serialport.pause()
      })
    },

    /**
     * Resumes a paused connection.
     * @params {SugoInterfaceContext} ctx
     * @returns {Promise}
     */
    resume (ctx) {
      return co(function * () {
        assert.ok(_serialport, NOT_CONNECT)
        _serialport.resume()
      })
    },

    /**
     * Flushes data received but not read.
     * @params {SugoInterfaceContext} ctx
     * @returns {Promise}
     */
    flush (ctx) {
      return new Promise((resolve, reject) => {
        assert.ok(_serialport, NOT_CONNECT)
        _serialport.flush(_handle(resolve, reject))
      })
    },

    /**
     * Waits until all output data has been transmitted to the serial port.
     * @params {SugoInterfaceContext} ctx
     * @returns {Promise}
     */
    drain (ctx) {
      return new Promise((resolve, reject) => {
        assert.ok(_serialport, NOT_CONNECT)
        _serialport.drain(_handle(resolve, reject))
      })
    },

    /**
     * Close the given serial port.
     * @params {SugoInterfaceContext} ctx
     * @returns {Promise}
     */
    close (ctx) {
      return new Promise((resolve, reject) => {
        assert.ok(_serialport, NOT_CONNECT)
        _serialport.close(_handle(resolve, reject))
      })
    },

    /**
     * Sets flags on an open port.
     * @params {SugoInterfaceContext} ctx
     * @returns {Promise}
     */
    set (ctx) {
      let { params } = ctx
      let [ options ] = params
      return new Promise((resolve, reject) => {
        assert.ok(_serialport, NOT_CONNECT)
        _serialport.set(options, _handle(resolve, reject))
      })
    },

    /**
     * Changes the baudrate for an open port.
     * @params {SugoInterfaceContext} ctx
     * @returns {Promise}
     */
    update (ctx) {
      let { params } = ctx
      let [ options ] = params
      return new Promise((resolve, reject) => {
        assert.ok(_serialport, NOT_CONNECT)
        _serialport.update(options, _handle(resolve, reject))
      })
    },

    /**
     * Interface specification
     * @see https://github.com/realglobe-Inc/sg-schemas/blob/master/lib/interface_spec.json
     */
    $spec: {
      name,
      version,
      desc: description,
      methods: {

        // ( Describe your custom methods here )

        ping: {
          desc: 'Test the reachability of an interface.',
          params: [
            { name: 'pong', type: 'string', desc: 'Pong message to return' }
          ],
          return: {
            type: 'string',
            desc: 'Pong message'
          }
        },

        assert: {
          desc: 'Test if the spot fulfills system requirements',
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
            {name: 'options', type: 'object', desc: 'options'},
            {name: 'openCallback', type: 'function', desc: 'open callback'}
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

module.exports = sugoInterfaceSerialport

/**
 * @typedef {Object} SugoInterfaceContext
 * @property {Array} params - Invoke parameters.
 * @property {EventEmitter} pipe - Pipe to remote terminal.
 */
