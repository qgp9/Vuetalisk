const path = require('path')
const fs = require('fs-extra')
const Item = require('../src/item.js')
const {ERROR, debug, log} = require('../debug')('static-handler')

class StaticHandler {
  constructor () {
    this.name = 'StaticHandler'
  }

  async register (vuetalisk) {
  }

  async processInstall ({checkpoint, h}) {
    debug('processInstall     ', new Date)
    const files = await h.find({
      isStatic: true,
      installed: false
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
        const promise = fs.remove(target)
          .then(() => h.remove(item))
          .catch(ERROR)
        plist.push(promise)
      }
    }
    await Promise.all(plist).catch(ERROR)
    debug('processInstall:Done', new Date)
  }
}

module.exports = StaticHandler
StaticHandler.install = () => new StaticHandler
