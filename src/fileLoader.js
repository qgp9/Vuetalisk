const nodepath = require('path')
const fs = require('fs-extra')
const Item = require('./item.js')
const {DEBUG, ERROR, ERRMSG} = require('./error.js')

class FileLoader {
  constructor () {
    this.name = 'FileLoader'
  }
  async register (qgp) {
    this.config = qgp.config
    this.store = qgp.store
    this.collections = this.config.getGlobal('collections')
    this.table = {}
    this.root = qgp.root
  }

  async processCollection ({store, checkpoint}) {
    this.checkpoint = checkpoint
    this.table.page = await this.store.getTableOrAdd('page')
    this.table.file = await this.store.getTableOrAdd('file')

    const plist = []
    for (const collname in this.collections) {
      const fullpath = nodepath.join(
        this.config.get(collname, 'source_dir'),
        this.config.get(collname, 'path')
      )
      const promise = this._processCollectionIter(collname, fullpath)
        .catch(ERRMSG('Error in locadCollection'))
      plist.push(promise)
    }
    await Promise.all(plist)
  }

  async processItem ({item}) {
    const fullpath = item.path()
    const data = fs.readFileSync(nodepath.join(this.root, fullpath), 'utf8')
    item.setContent(data) 
  }

  async _processCollectionIter (collname, path) {
    const files = fs.readdirSync(nodepath.join(this.root, path))
    for (const filename of files) {
      // Skip special
      if (filename[0] === '_') continue
      // Skip excludes
      if ((this.config.get(collname, 'excludes') || {})[filename]) continue
      //
      const fullpath = nodepath.join(path, filename)
      const stat = fs.statSync(nodepath.join(this.root, fullpath))
      if (stat.isDirectory()) {
        this._processCollectionIter(collname, fullpath)
      } else {
        const ext = nodepath.extname(filename)
        const exts = this.config.get(collname, 'extensions')
        if (!exts['*'] && !exts[ext]) continue
        let basePath = fullpath.replace(
          nodepath.join(
            this.config.get(collname, 'source_dir'),
            this.collections[collname].path
          ), ''
        )
        let src_id = '/' + collname + basePath 
        let type = this.config.get(collname, 'type')
        let item = this.table[type].by('src', src_id)
        if (item) {
          item = new Item(item)
          let mtime = item.mtime()
          item.setLastChecked(this.checkpoint)
          if (mtime < stat.mtimeMs) {
            item.setMtime(stat.mtimeMs)
            item.setUpdated(true)
            item.setPath(fullpath)
            DEBUG('updated item', item.path())
          }
          this.table[type].update(item.item)
        } else {
          let item = new Item
          item.setSrc(src_id)
          if (type === 'page') {
            item.setUrl('_temp_' + src_id)
          } else {
            item.setUrl(basePath)
          }
          item.setPath(fullpath)
          item.setMtime(stat.mtimeMs)
          item.setUpdated(true)
          item.setCollection(collname)
          item.setType(type)
          item.setLastChecked(this.checkpoint)
          DEBUG('add new item', item.path())
          this.table[type].insert(item.item)
        }
      }
    }
  }
}

module.exports = FileLoader
