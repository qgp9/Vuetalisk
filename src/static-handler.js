const path = require('path')
const fs = require('fs-extra')
const Item = require('./item.js')
const {ERROR, DEBUG, LOG} = require('./error.js')

class StaticHandler {
  constructor () {
    this.name = 'StaticHandler'
  }

  async register (qgp) {
  }

  async processInstall ({checkpoint, h}) {
    DEBUG(3, 'StaticHandler::processInstall     ', new Date)
    const files = await h.find({
      isStatic: true
    }).catch(ERROR)
    const plist = []
    for (const item of files) {
      const src = h.pathItemSrc(item)
      const target = h.pathItemTarget(item)
      if (item.updated && !item.deleted) {
        const promise = fs.copy(src, target)
          // .then(() => { item.updated = false; filesTable.update(item) })
          .catch(ERROR)
        plist.push(promise)
      }
      if (item.deleted) {
        LOG(2, 'delete item ', item.path)
        DEBUG(target)
        const promise = fs.remove(target)
          .then(() => h.remove(item))
          .catch(ERROR)
        plist.push(promise)
      }
    }
    await Promise.all(plist).catch(ERROR)
    DEBUG(3, 'StaticHandler::processInstall:Done', new Date)
  }
}

module.exports = StaticHandler
