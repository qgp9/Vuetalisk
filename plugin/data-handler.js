/** 
 * Write data api
 * ym, toml, js will be transfromed to json
 * require works in js
 */
const path = require('path')
const fs = require('fs-extra')
const {log, debug, ERROR} = require('../debug')('data-handler')

class DataHandler {
  constructor () {
    this.name = 'DataHandler'
  }

  async register () {
  }

  async processItem ({item, h}) {
    if (item.src.match(/menu/)) debug(item)
    if (item.type !== 'data') return
    const src = h.pathItemSrc(item) // TODO CHECK
    const ext = path.extname(item.src)
    let data
    switch (ext) {
      case '.json':
        item.data = JSON.parse(fs.readFileSync(src).toString())
        break
      case '.js':
        data = require(src)
        if (data.constructor === Function)
          data = data(h)
        item.data = data
        break
      case '.yml':
      case '.yaml':
        item.data = this.yamlLoader(fs.readFileSync(src))
        debug(item.data)
        break
      case '.tml':
      case '.toml':
        item.data = this.tomlLoader(fs.readFileSync(src))
        break
      default:
        ERROR('Unsupproted data format', h.pathItemSrc(item))
    }
    item.ext = '.json'
  }

  yamlLoader (raw) {
    if (!this._yamlParser) this._yamlParser = require('js-yaml')
    return this._yamlParser.safeLoad(raw)
  }

  tomlLoader (raw) {
    if (!this._tomlParser) this._tomlParser = require('toml')
    return this._tomlParser.parse(raw)
  }
}

module.exports = DataHandler
