const _ = require('lodash')
const yaml = require('js-yaml')
const toml = require('toml')
const fs = require('fs-extra')
const path = require('path')

class Config {
  constructor () {
    this.config = {}

  }

  addFile (_path) {
    const ext = path.extname(_path)
    if (ext === '.js') {
      this._merge(require(_path))
      return
    }
    let data
    try {
      data = fs.readFileSync(_path)
    } catch(e) {
      throw Error(e)
    }
    this.addString(data, ext)
  }

  addObj (obj) {
    this._merge(obj)
  }

  addString (data, ext, _path) {
    if (!data) return
    let config
    try {
      if(ext === '.yaml' || ext === '.yml') {
        config = yaml.safeLoad(data)
      } else if (ext === '.toml' || ext === '.tml') {
        config = toml.parse(data)
      } else if (ext === '.json') {
        config = JSON.parse(data)
      }
    } catch (e) {
      console.error(`Errors while parsing config`)
      if (_path) console.error(`in  file ${_path}`)
      throw Error(e)
    }
    this._merge(config)
  }
  
  _merge (obj) {
    this.config = _.merge(this.config, obj)
  }

  get(collname, option) {
    let res
    if (collname && collname !== 'global') {
      res = _.get(this.config.collections[collname], option)
    }
    if (!res) res = _.get(this.config, option)
    return res
  }

  getGlobal (option) {
    return _.get(this.config, option)
  }

  _arrayToMap (list) {
    if (!list) return list
    if (_.isPlainObject(list)) return list
    if (!Array.isArray(list)) list = [list]
    let map = {}
    for (const item of list) {
      map[item] = true
    }
    return map
  }

  _normalize () {
    const collections = this.config.collections
    for (const field of ['excludes', 'extensions', 'includes']){
      if (this.config[field]) {
        this.config[field] = this._arrayToMap(this.config[field])
      }
      for (const collname in collections) {
        const coll = collections[collname]
        if (coll[field]) {
          coll[field] = this._arrayToMap(coll[field])
        }
      }
    }
  }
}

/* test
const config = new Config
config.addFile('./config-default.js')
config.addFile('./_config.yml')
*/

module.exports = Config
