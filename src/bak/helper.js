const {log, debug, ERROR} = require('./debug')('Helper')
const path = require('path')
const _ = require('lodash')
const Item = require('./item.js')

class Helper {
  constructor (vuetal) {
    this.vuetal = vuetal
    this.colllectionListUpdated = false
    // Shortcut
    this.config = vuetal.config
    this.store = vuetal.store
    this.root = vuetal.root
    this.collections = vuetal.config.getGlobal('collections') 
    this.checkpoint = vuetal.checkpoint
    this.item = Item
    this.types = ['page', 'file', 'list', 'data'] // TODO: data
    this.table = vuetal.table
    this.cache = vuetal.cache
  }


  /**
   * @namespace Helper
   */

  /* A shortcut of `vuetalisk.config.gets(collname, ...args) to get configured options
   * @param {string} collname name of collection
   * @param {array} fields wanted fields
   * @return {Object} object keyed by fields with value
   */
  confs (collname, fields) { 
    return this.config.gets(collname, fields)
  }

  conf (collname, field) {
    return this.config.get(collname, field)
  }

  /**
   * Generate Object keyed by each collection name
   * @param {Function=Object} generator function to generate vaules for each collection. Simply "Object" will generate empty object ("{}") 
   * @return {Object}
   */
  genCollectionMap (generator = Object)  {
    const map = {}
    for (const name in this.collections) {
      map[name] = generator()
    }
    return map
  }

  /**
   * return linux time in milliseconds. Standard foram in Vuetalisk
   * @param {number|string|Date} _date
   * @return {number}
   */
  date (_date) {
    switch (_date.constructor) {
      case Number:
        return _date
      case String:
        return new Date(_date).getTime()
      case Date:
        return _date.getTime()
      default:
        ERROR('Strange date format')
    }
  }

  /**
   * return ISO string of date for JSON output
   * @param {number|string|Date} _date
   * @return {string} ISO String of date
   */
  dateOut (_date) {
    switch (_date.constructor) {
      case Number:
      case String:
        return (new Date(_date)).toISOString()
      case Date:
        return _date.toISOString()
      default:
        ERROR('Strange date format')
    }
  }

  /**
   * @namespace PATH
   */

  /**
   * Absolute source path of collection
   * @param {string} collname name of collection
   * @param {...string} others others will be attached by path.join
   * @return {string} Absolute path
   * @memberof PATH
   */
  pathSrc (collname, ...others) {
    return path.join(
      this.root,
      this.config.get(collname, 'source_dir'),
      this.config.get(collname, 'path') || '',
      ...others.map(v => v.toString())
    )
  }

  /**
   * Absolute source path of item
   * @param {string} item
   * @return {string} Absolute path
   * @memberof PATH
   */
  pathItemSrc (item) {
    return this.pathSrc(item.collection, item.path)
  }

  /**
   * Absolute target path of collection
   * @param {string} collname name of collection
   * @param {...string} others others will be attached by path.join
   * @return {string} 
   * @memberof PATH
   */
  pathTarget (collname, ...others) {
    return path.join(
      this.root,
      this.config.get(collname, 'target_dir'),
      ...others.map(v => v.toString())
    )
  }
  
  /**
   * Absolute target path of item
   * @param {string} item
   * @return {string} 
   * @memberof PATH
   */
  pathItemTarget (item) {
    return this.pathTarget(item.collection, item.url)
  }

  
  /**
   * Absolute api path of collname
   * @param {string} collname name of collection
   * @param {...string} others These are attached to api path by path.join
   * @return {string} local api path
   * @memberof PATH
   */
  pathApi (collname, ...others) {
    return this.pathTarget(collname,
      this.config.get(collname, 'api_point'),
      ...others
    )
  }
  /**
   * Absolute api path of an item
   * If url is '/', return 'api/url/index.json'
   * @param {Object} item
   * @return {string} local api path
   * @memberof PATH
   */
  pathItemApi (item) {
    let url = item.url
    if (url === '/') url += 'index'
    return this.pathApi(
      item.collection,
      (item.isPage ? 'url' : ''),
      url + '.json'
    )
  }

  /**
   * @namespace Store
   * @note If a method gets both of collection and type as arguments, type has prority. 
   */


  /* Find items from table by collname, type
   * @param {string} collname name of collection
   * @param {string} type name of type
   * @param {Object} query not recommended
   */
  async find (query = {}) {
    return await this.store.findItem(query)
  }
  
  /**
   * Get proper list of item for any collection.
   * proper means not deleted and will be written as API
   * @return {Object} query
   * @return {Array} list of items
   */
  async properList (query = {}) {
    query.deleted = false
    return await this.store.findItem(query)
  }

  /**
   * Get list of upated item for any collection/type.
   * proper means not deleted and will be written as API
   * @return {Object} query
   * @return {Array} list of items
   */
  async updatedList (query = {}) {
    query.updated = true
    return await this.store.findItem(query)
  }

  /**
   * Get list of deleted item for any collection/type.
   * proper means not deleted and will be written as API
   * @return {Object} query
   * @return {Array} list of items
   */
  async deletedList (query = {}) {
    query.deleted = true
    return await this.store.findItem(query)
  }



  /**
   * @param {string} url 
   */
  async get (src) {
    return await this.store.getItem(src)
  }

  async set (item) {
    return await this.store.setItem(item)
  }
  /**
   * remove item from store
   * @param {object} item
   */
  async remove (item) {
    await this.store.removeItem(item)
  }


  /**
   * @namespace Cache
   */

  async cache (name) {
    return await this.store.getCache(name)
  }

  async setCache (item) {
    return await this.store.setCache(item)
  }

  async removeCache (item) {
    await this.store.removeCache(item)
  }

  /**
   * @namespace Etc
   */
}

module.exports = Helper

debug('Helper loaded')
