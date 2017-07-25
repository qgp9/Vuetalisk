const npath = require('path')
const fs = require('fs-extra')
const Item = require('./item.js')
const {DEBUG, ERROR, ERRMSG, MyLog} = require('./error.js')

const LOG = MyLog('FileLoader')

class FileLoader {
  constructor () {
    this.name = 'FileLoader'
  }
  /**
   * A register wagon for night-train
   * @private
   */
  async register (qgp) {
    this.config = qgp.config
    this.table = {}
    this.root = qgp.root
  }

  /**
   * A wagon for night-train
   * @private
   */
  async processCollection ({store, checkpoint, h}) {
    this.checkpoint = checkpoint
    this.table.page = await h.getOrAddTable('page').catch(ERROR)
    this.table.file = await h.getOrAddTable('file').catch(ERROR)

    const plist = []
    for (const collname in h.collections) {
      const fullpath = h.pathSrc(collname)
      LOG(5, 'Start iteration of processCollection.', collname, fullpath)
      const promise = this._processCollectionIter(collname, fullpath, h)
        .catch(ERRMSG('Error in locadCollection'))
      plist.push(promise)
    }
    await Promise.all(plist).catch(ERROR)


    LOG(5, 'check deleted')
    for (const item of this.table.page.find({lastChecked: {$lt: checkpoint}})) {
      LOG(2, 'deleted', item)
      item.deleted = true
    }
    for (const item of this.table.file.find({lastChecked: {$lt: checkpoint}})) {
      LOG(2, 'deleted', item)
      item.deleted = true
    }

    DEBUG('check deleted done')
  }

  /* A wagon for night-train
   * @private
   */
  async processItem ({item, h}) {
    const data = fs.readFileSync(h.pathItemSrc(item), 'utf8')
    if (data) item.data = data 
  }

  /* Iterator to scan directory
   * @private
   */
  async _processCollectionIter (collname, path, h) {
    const files = fs.readdirSync(path)
    for (const filename of files) {
      // Skip special
      if (filename[0] === '_') continue
      // Skip excludes
      if ((h.config.get(collname, 'excludes') || {})[filename]) continue
      //
      const fullpath = npath.join(path, filename)
      const stat = fs.statSync(fullpath)
      if (stat.isDirectory()) {
        await this._processCollectionIter(collname, fullpath, h).catch(ERROR)
      } else {
        const ext = npath.extname(filename)
        const exts = h.config.get(collname, 'extensions')
        if (!exts['*'] && !exts[ext]) continue
        let basePath = npath.relative(h.pathSrc(collname), fullpath)
        let src_id = npath.join('/', collname, basePath)
        let type = h.config.get(collname, 'type')
        let item = this.table[type].by('src', src_id)
        LOG(9, 'proces item', src_id, (item ? 'existing' : 'non-existing') + ' in DB')
        if (item) {
          item.lastChecked = h.checkpoint
          let mtime = item.updatedAt
          if (mtime < stat.mtimeMs) {
            item.updatedAt = h.date(stat.mtimeMs)
            item.updated = true
            item.deleted = false
            LOG(2, 'updated item', fullpath)
          }
          this.table[type].update(item)
        } else {
          let item = {
            src: src_id,
            path: basePath,
            updatedA: h.date(stat.mtimeMs),
          }
          item.src = src_id
          if (type === 'page') {
            item.url = '_temp_' + src_id
          } else {
            // TODO: should be done in permalink
            item.url = npath.join('/', basePath)
          }
          item.updated = true
          item.deleted = false
          item.collection = collname
          item.type = type
          item.lastChecked = h.checkpoint
          LOG(2, 'add new item', item.path)
          this.table[type].insert(item)
        }
      }
    }
  }
}

module.exports = FileLoader
