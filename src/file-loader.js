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
  }

  /**
   * A wagon for night-train
   * @private
   */
  async processCollection ({store, checkpoint, h}) {
    DEBUG(3, 'FileLoader::processCollection     ', new Date)
    this.checkpoint = checkpoint

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
    for (const item of await h.find({lastChecked: {$lt: checkpoint}})) {
      LOG(2, 'deleted', item.src)
      item.deleted = true
    }

    DEBUG('check deleted done')
    DEBUG(3, 'FileLoader::processCollection:Done', new Date)
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
      if ((h.conf(collname, 'excludes') || {})[filename]) continue
      //
      const fullpath = npath.join(path, filename)
      const stat = fs.statSync(fullpath)
      if (stat.isDirectory()) {
        // scan  directory reculsively
        await this._processCollectionIter(collname, fullpath, h).catch(ERROR)
      } else {
        // Extension of  file
        const ext = npath.extname(filename)
        const exts = h.conf(collname, 'extensions')
        if (!exts['*'] && !exts[ext]) continue
        // path
        // basePath is path from collection path
        // example, with default config
        // "_post/2017-07-25-hello-world.md" will become
        // basePath =   "2017-07-25-hello-world.md"
        // src = "/posts/2017-07-25-hello-world.md"
        let basePath = npath.relative(h.pathSrc(collname), fullpath)
        let src = npath.join('/', collname, basePath)
        let type = h.conf(collname, 'type')
        // Check Database
        let item = await h.get(src).catch(ERROR)
        LOG(9, 'proces item', src, (item ? 'existing' : 'non-existing') + ' in DB')
        if (item) {
          item.lastChecked = h.checkpoint
          // Is updated ?
          if (item.updatedAt < stat.mtimeMs) {
            item.updatedAt = h.date(stat.mtimeMs)
            item.updated = true
            item.deleted = false
            LOG(2, 'updated item', fullpath)
          }
          // await h.set(item).catch(ERROR)
        } else {
          let item = {
            src: src,
            path: basePath,
            type: type,
            collection: collname,
            lastChecked: h.checkpoint,
            updatedAt: h.date(stat.mtimeMs),
            updated: true,
            deleted: false
          }
          switch (type) {
            case 'page':
              item.url = '_temp_' + src
              item.isApi = true
              item.isPage = true
              item.isStatic = false
              break;
            case 'data':
              item.url = npath.join('/', basePath)
              item.isApi = true
              item.isPage = false
              item.isStatic = false
              break;
            case 'file':
              item.url = npath.join('/', basePath)
              item.isApi = false
              item.isPage = false
              item.isStatic = true
              break;
            default:
              ERROR('Wrong type of item', item)
          }
          LOG(2, 'add new item', item.path)
          h.set(item)
        }
      }
    }
  }
}

module.exports = FileLoader
