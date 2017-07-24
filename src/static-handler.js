const path = require('path')
const fs = require('fs-extra')
const Item = require('./item.js')
const {ERROR, DEBUG} = require('./error.js')

class StaticHandler {
  constructor () {
    this.name = 'StaticHandler'
  }

  async register (qgp) {
    this.config = qgp.config
    this.store = qgp.store
    this.root = qgp.root
  }

  async processInstall ({checkpoint}) {
    const filesTable = await this.store.table('file')
    const files = filesTable.find({collection: 'static'})
    const plist = []
    for (const fileRaw of files) {
      const item = new Item(fileRaw)
      const src = path.join(this.root, item.path())
      const target = path.join(
        this.root,
        this.config.get(item.collection(), 'target_dir'),
        item.url()
      )
      if (item.updated()) {
        const promise = fs.copy(src, target)
          .then(() => { item.setUpdated(false); filesTable.update(item.item) })
          .catch(ERROR)
        plist.push(promise)
      }
      if (item.lastChecked() < checkpoint) {
        DEBUG('delete item ', item.path())
        const promise = fs.remove(target)
          .then(() => filesTable.remove(item.item))
          .catch(ERROR)
        plist.push(promise)
      }
    }
    await Promise.all(plist).catch(ERROR)
  }
}

module.exports = StaticHandler
