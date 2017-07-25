const path = require('path')
const fs = require('fs-extra')

/**
 * Managge deleted file in DB, Dist
 * Remove data field from pages. TODO: also list?
 * Set all 'updated' field to false
 */

class Cleaner {
  constructor () {
    this.name = 'Cleaner'
  }

  async register (qgp) {
  }

  async processInstall ({checkpoint, h}) {
    for (const type of h.types) {
      for (const item of await h.getUpdatedList('', type)) {
        item.updated = false
        if (type === 'page') {
          item.data = undefined
        }
        await h.update(item)
      }
    }

    // DELETE only handle api files of page
    // handling of file collection is on their own
    for (const item of await h.getDeletedList('', 'page')) {
      await fs.remove(h.pathItemApi(item))
        .then(() => h.remove(item))
        .catch(ERROR)
    }
  }
}

module.exports = Cleaner
