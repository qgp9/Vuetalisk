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

    const collname = 'static'
    const files = await h.find(collname).catch(ERROR)
    const plist = []
    for (const item of files) {
      const src = h.pathItemSrc(item)
      const target = h.pathItemTarget(item)
      if (item.updated) {
        const promise = fs.copy(src, target)
          // .then(() => { item.updated = false; filesTable.update(item) })
          .catch(ERROR)
        plist.push(promise)
      }
      if (item.deleted) {
        console.log('what!')
        LOG(2, 'delete item ', item.path)
        const promise = fs.remove(target)
          .then(() => h.remove(item))
          .catch(ERROR)
        plist.push(promise)
      }
    }
    await Promise.all(plist).catch(ERROR)
  }
}

module.exports = StaticHandler
