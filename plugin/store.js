'use strict'

const {debug, log, ERROR} = require('../debug')('Store')
const DB = require('lokijs')
const fs = require('fs')

class Store {
  constructor (dbfile) {
    this.dbfile = dbfile || 'store.json'
    this.db = new DB(this.dbfile)
    this.loaded = false
  }

  async itemTable () {
    let col = this.db.getCollection('table')
    if (col) return col
    else return this.db.addCollection('table', {
      unique: ['src', 'url'],
      indices: ['collection', 'type', 'updated', 'deleted']
    })
  }

  async cacheTable () {
    let col = this.db.getCollection('cache')
    if (col) return col
    else return this.db.addCollection('cache', {unique: ['name']})
  }

  async findItem (query) {
    return await this._itemTable.find(query)
  }

  async getItem (src) {
    if (src.constructor == String) {
      return await this._itemTable.by('src', src)
    } else {
      if (src.src) {
        return await this._itemTable.by('src', src.src)
      } else if (src.url) {
        return await this._itemTable.by('url', src.url)
      }
    }
    ERROR('src should be a string or object with src or url', src)
  }

  async setItem (item) {
    if (item.$loki) return this._itemTable.update(item)
    let oitem = this._itemTable.by('src', item.src)
    if (oitem) {
      item.$loki = oitem.$loki
      item.meta = oitem.meta
      this._itemTable.update(item)
      // this._itemTable.remove(oitem)
      return item
    } 
    return this._itemTable.insert(item)
  }


  async removeItem (item) {
    this._itemTable.remove(item)
  }

  async getCache (name) {
    return this._cacheTable.by('name', name)
  }

  async setCache (item) {
    let oitem = this._cacheTable.by('name', item.name)
    if (oitem) {
      if (oitem === item) {
        this._cacheTable.update(item)
        return item
      } else {
        this._cacheTable.remove(oitem)
        return this._cacheTable.insert(item)
      }
    } else {
      return this._cacheTable.insert(item)
    }
  }

  async removeCache (item) {
    return this._cacheTable.remove(item)
  }

  async load(options = {}) {
    if (this.loaded) return
    await new Promise((resolve, reject) => { 
      this.db.loadDatabase(options, err => {
        if (err) reject(err)
        else resolve()
      })
    }).catch(ERROR)
    this.loaded = true
    this._itemTable = await this.itemTable()
    this._cacheTable = await this.cacheTable()
  }

  async save () {
    await new Promise((resolve, reject) => {
      this.db.saveDatabase(err => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  async delete () {
    if (!fs.existsSync(this.dbfile)) return
    await new Promise((resolve, reject) => {
      this.db.deleteDatabase(err => {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}
debug('Store loaded')

module.exports = Store
