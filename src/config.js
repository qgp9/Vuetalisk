const {debug, log} = require('../debug')('Config')
const _ = require('lodash')
const assert = require('assert')
const fs = require('fs')
const path = require('path')

class Config {
  constructor () {
    this.config = {}
  }

  addFile (_path) {
    debug('config added', _path)
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
        const yaml = require('js-yaml')
        config = yaml.safeLoad(data)
      } else if (ext === '.toml' || ext === '.tml') {
        const toml = require('toml')
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
    assert(arguments.length === 2)
    let res
    if (collname && collname !== 'global') {
      res = _.get(this.config.collections[collname], option)
    }
    if (!res) res = _.get(this.config, option)
    return res
  }

  gets(collname, args) {
    assert(Array.isArray(args))
    let res = {}
    for (const arg of args) {
      res[arg] = this.get(collname, arg)
    } 
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
    for (const name in collections){
      const collection = collections[name]
      // delete collection if it's false
      if (!collection) delete collections[name]
      else {
        // type check
        const type = collection.type
        if (!type) {
          ERROR(`"type" is missed in collection ${name}`)
        }
        if (!collection.type.match(/^(page|file|data)$/)){
          ERROR(`Type "${type}" is not allowed in collection "${name}"`)
        }
        // check path
        const path = collection.path
        if (!path) {
          ERROR(`"path" is missed in collection "${name}"`)
        }
        // set name for array iteration
        if (!collection.name) collection.name = name
      }
    }

    // Convert several arrays to object map for easy access
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
    for (const name in collections){
      const collection = collections[name]
      if (!collection.name) collection.name = name
    }
  }
}

debug('config loaded')

module.exports = Config
