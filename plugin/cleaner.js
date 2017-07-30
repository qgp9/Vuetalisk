const path = require('path')
const fs = require('fs-extra')
const {debug, log, ERROR} = require('../debug')('cleaner')

/**
 * Managge deleted file in DB, Dist
 * Remove data field from pages. 
 * Set all 'updated' field to false
 */

class Cleaner {
  constructor () {
    this.name = 'Cleaner'
  }

  async register (vuetalisk) {
  }

  async processInstall ({checkpoint, h}) {
    debug('processInstall     ', new Date())
    for (const item of await h.updatedList()) {
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

    // Clean empty directory
    this.removeEmptyDirectory(h.pathTarget())
      .catch(ERROR)
    
    debug('processInstall:Done', new Date())
  }

  async removeEmptyDirectory(dir, depth) {
    const files = fs.readdirSync(dir)
    let nfiles = 0
    for (const file of files) {
      nfiles++
      const fullpath =  path.join(dir, file)
      const stat = fs.statSync(fullpath)
      if(!stat.isDirectory()) continue
      const empty = await this.removeEmptyDirectory(fullpath)
        .catch(ERROR)
      if (empty) {
        fs.rmdirSync(fullpath)
        nfiles--
      }
    }
    if (nfiles > 0) return false
    return true
  }
}

module.exports = Cleaner
Cleaner.install = () => new Cleaner
