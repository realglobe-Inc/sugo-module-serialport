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
const debug = require('debug')('sugo:interface:serialport')

let _serialport = null
let _timeoutTimer = null

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
     * Open a serial port.
     * @params {SugoInterfaceContext} ctx
     * @returns {Promise}
     */
    open (ctx) {
      const s = this
      let { pipe } = ctx
      return new Promise((resolve, reject) => {
        let port
        try {
          port = new Serialport(config.path, config.options)
        } catch (e) {
          reject(e)
          return
        }
        _serialport = port

        port.on('data', (data) => pipe.emit('data', data))
        port.on('error', (err) => pipe.emit('error', err))
        port.on('close', () => () => {
          pipe('close', 'close')
          resolve()
        })
        port.on('disconnect', () => pipe.emit('disconnect', 'disconnect'))
        port.on('open', () => {
          debug('open')
          pipe.emit('open', 'open')
          s._resetTimer()
        })
      })
    },

    /**
     * Write data to the given serial port.
     * @params {SugoInterfaceContext} ctx
     * @returns {Promise}
     */
    write (ctx) {
      const s = this
      let { params } = ctx
      let [ data ] = params
      return new Promise((resolve, reject) => {
        if (!_serialport) {
          reject(new Error('Not connected'))
        }
        s._resetTimer()
        _serialport.write(data, (err) => {
          if (err) {
            reject(err)
          }
          resolve()
        })
      })
    },

    /**
     * Close the given serial port.
     * @params {SugoInterfaceContext} ctx
     * @returns {Promise}
     */
    close (ctx) {
      return new Promise((resolve, reject) => {
        if (!_serialport) {
          reject(new Error('Not connected'))
        }
        _serialport.close((err) => {
          if (err) {
            reject(err)
          }
          resolve()
        })
      })
    },

    /**
     * If nothing happens, the serialport will close after timeout time.
     */
    _resetTimer () {
      let {timeout} = config
      if (timeout === Infinity || !_serialport) {
        return
      }
      if (_timeoutTimer) {
        clearTimeout(_timeoutTimer)
      }
      _timeoutTimer = setTimeout(() => {
        _serialport.close((err) => {
          if (err) {
            console.log(err)
            return
          }
          console.log('closed')
        })
      }, timeout)
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

        open: {
          desc: 'Open a serial port.',
          params: []
        },

        write: {
          desc: 'Write data to the given serial port.',
          params: [
            {name: 'data', type: 'buffer', desc: 'data to write'}
          ]
        },

        close: {
          desc: 'Close the given serial port.',
          params: []
        }
      }
    }
  }
}

module.exports = sugoInterfaceSerialport

/**
 * @typedef {Object} SugoInterfaceContext
 * @property {Array} params - Invoke parameters.
 * @property {EventEmitter} pipe - Pipe to remote terminal.
 */
