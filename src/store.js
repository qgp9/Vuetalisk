'use strict'

const DB = require('lokijs')
const {ERROR} = require('./error.js')

class Table {
  constructor (collection) {
    this.collection = collection
  }

  async find (options = {}) {
    return this.collection.find(options)
  }

  async get (id) {
    return this.collection.get(id)
  }

  async by (field, value) {
    return this.collection.by(field, value)
  }
  
  async insert (item) {
    return this.collection.insert(item)
  }

  async update (item) {
    return this.collection.update(item)
  }

  async remove (item) {
    return this.collection.remove(item)
  }
}

class Store {
  constructor (dbfile) {
    this.dbfile = dbfile || 'store.json'
    this.db = new DB(this.dbfile)
  }

  async table (name) {
    let table = this.db.getCollection(name)
    return table
  }

  async getTable (name) {
    let table = this.db.getCollection(name)
    return table
  }


  async addTable (name, options = {}) {
    let table = await this.table(name)
    if (table) {
      throw Error(`${name} does exists`)
    } else {
      table = this.db.addCollection(name, options)
    }
    return table
  }

  async getTableOrAdd (name, options = {} ) {
    let table = await this.table(name).catch(ERROR)
    if(!table) {
      table = await this.addTable(name, options)
      .catch(ERROR)
    }
    return table
  }

  async load(options = {}) {
    await new Promise((resolve, reject) => { 
      this.db.loadDatabase(options, err => {
        if (err) reject(err)
        else resolve()
      })
    })
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
    await new Promise((resolve, reject) => {
      this.db.deleteDatabase(err => {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}

module.exports = Store
