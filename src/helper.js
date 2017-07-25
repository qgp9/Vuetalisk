const path = require('path')
const fs = require('fs-extra')
const _ = require('lodash')
const {DEBUG, ERROR} = require('./error.js')
const Item = require('./item.js')

class Helper {
  constructor (qgp) {
    this.qgp = qgp
    this.colllectionListUpdated = false
    // Shortcut
    this.config = qgp.config
    this.store = qgp.store
    this.root = qgp.root
    this.collections = qgp.config.getGlobal('collections')
    this.checkpoint = qgp.checkpoint
    this.item = Item
    this.types = ['page', 'file', 'list'] // TODO: data

  }


  /**
   * @namespace Helper
   */

  /* A shortcut of `qgp.config.gets(collname, ...args) to get configured options
   * @param {string} collname name of collection
   * @param {...string} fields wanted fields
   * @return {Object} object keyed by fields with value
   */
  confs (collname, ...fields) { 
    return this.config.gets(collname, ...fields)
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
   * return linux time in milliseconds. Standard foram in QGP9
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
      this.qgp.root,
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
      item.type !== 'list' ? item.collection : '',
      'url',
      url + '.json'
    )
  }

  /**
   * @namespace Store
   * @note If a method gets both of collection and type as arguments, type has prority. 
   */

  /* Get table by collection or type
   * "type" has priority
   * @param {string} collname name of collection
   * @param {string} type name of type
   */
  async table (collname, type) {
    return await this.qgp.store.getTable(
      type ? type : this.config.get(collname, 'type')
    )
  }
  
  /* Get table of item
   * @param {Object} item
   */
  async tableOfItem (item) {
    const type = item.type || this.config.get(item.collection, 'type')
    return await this.table('', type).catch(ERROR)
  }

  /* Find items from table by collname, type
   * @param {string} collname name of collection
   * @param {string} type name of type
   * @param {Object} query not recommended
   */
  async find (collname, type, query = {}) {
    if (!type) type = this.config.get(collname, 'type')
    const table = await this.store.table(type).catch(ERROR)
    if (collname) query.collection = collname
    return table.find(query)
  }
  
  /* Get or Add table from/to Store
   * @param {string} name table name
   * @param {Object} options not recomended
   */
    async getOrAddTable (...args) {
      return await this.store.getOrAddTable(...args)
    }

  /**
   * Get proper list of item for any collection.
   * proper means not deleted and will be written as API
   * @param {String} collname name of collection
   * @param {string} type name of type
   * @return {Array} list of items
   */
  async getProperList (collname, type) {
    return await this.find(collname, type, {deleted: false})
  }

  /**
   * Get list of upated item for any collection/type.
   * proper means not deleted and will be written as API
   * @param {String} collname name of collection
   * @param {string} type name of type
   * @return {Array} list of items
   */
  async getUpdatedList (collname, type) {
    return await this.find(collname, type, {updated: true})
  }

  /**
   * Get list of deleted item for any collection/type.
   * proper means not deleted and will be written as API
   * @param {String} collname name of collection
   * @param {string} type name of type
   * @return {Array} list of items
   */
  async getDeletedList (collname, type) {
    return await this.find(collname, type, {deleted: true})
  }

  /**
   * Return a proper list of item without data for any collection
   * "proper" means not deleted and will be written as API
   * Once list handler insert lists to database, it will be used instead of new generation
   * @param {String} collname name of collection
   * @return {Array} list of items
   */
  async getProperListCompact (collname) {
    if (this.collectionListUpdated) {
      const table = await this.table('list')
      return table.by('name', collname)
    }
    const list = []
    for (const item of await this.getProperList(collname)) {
      list.push(_.omit(item, ['data']))
    }
    return list
  }

  /**
   * remove item from proper table
   * @param {object} item
   */
  async remove (item) {
    await this.tableOfItem(item).then(table => table.remove(item))
      .catch(ERROR)
  }

  /**
   * Update item in proper table
   * @param {object} item
   */
  async update (item) {
    await this.tableOfItem(item).then(table => table.update(item))
      .catch(ERROR)
  }


  /**
   * @namespace Etc
   */

  /**
   * Helper to write pagenation of list easily
   * @param {Array} list list of all items
   * @param {number} pagenation A number of items per page
   * @param {string} outpath full path to write
   * @param {Object} meta any information to write on top
   */
  async writePagenation (list, pagenation, outpath, meta = {}) {
    outpath = outpath.replace(/\.json$/, '')
    const fullsize = list.length
    const copy = [].concat(list)
    let page = 0
    while (copy.length >  0) {
      page++
      const list = copy.splice(0, pagenation)
      const paged = Object.assign(
        meta, 
        {
          type: 'list',
          size: list.length,
          page: page,
          size_all: fullsize,
          page_all: Math.ceil(fullsize/pagenation),
          updatedAt: this.checkpoint,
          data: list
        })
      await fs.outputJson(path.join(
        outpath, page + '.json'
      ), paged)
        .catch(ERROR)
    }
  }
}

module.exports = Helper
