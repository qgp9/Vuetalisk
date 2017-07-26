const path = require('path')
const fs = require('fs-extra')
const {DEBUG, ERROR, LOG} = require('./error.js')

/**
 * Managge deleted file in DB, Dist
 * Remove data field from pages. 
 * Set all 'updated' field to false
 */

class Cleaner {
  constructor () {
    this.name = 'Cleaner'
  }

  async register (qgp) {
  }

  async processInstall ({checkpoint, h}) {
    DEBUG(3, 'Cleaner::processInstall     ', new Date())
    for (const item of await h.updatedList()) {
      item.updated = false
      if (true || item.type === 'page') {
        item.data = undefined
      }
      // await h.set(item)
    }

    // DELETE only handle api files of page
    // handling of file collection is on their own
    for (const item of await h.deletedList()) {
      await fs.remove(h.pathItemApi(item))
        .then(() => h.remove(item))
        .catch(ERROR)
    }
    DEBUG(3, 'Cleaner::processInstall:Done', new Date())
  }
}

module.exports = Cleaner
