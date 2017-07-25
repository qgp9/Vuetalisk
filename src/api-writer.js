const path = require('path')
const fs = require('fs-extra')
const {DEBUG, ERROR} = require('./error.js')
const Item = require('./item.js')
const _ = require('lodash')


class ApiWriter {
  constructor () {
    this.name = 'ApiWriter'
  }
  
  async register (qgp) {
  }

  // TODO write page, list, delete deleted
  async processInstall ({checkpoint, h}) {
    // PAGE
    const pages = await h.getUpdatedList('', 'page').catch(ERROR)
    let plist = []
    for (const item of pages) {
      const promise = fs.outputJson(
        h.pathItemApi(item),
        h.item.genOutput(item)
      ).catch(ERROR)
      plist.push(promise)
    }
    await Promise.all(plist).catch(ERROR)

    // List
    // TODO : sorting by date or url tree ?
    plist = []
    const lists = await h.getUpdatedList('', 'list').catch(ERROR)
    DEBUG(lists)
    for (const item of lists) {
      const promise = fs.outputJson(
        h.pathItemApi(item),
        h.item.genOutput(item)
      ).catch(ERROR)
      plist.push(promise)

      // TODO pagenation, archive. really need?
    }
    await Promise.all(plist).catch(ERROR)

    await this._write_siteinfo(h).catch(ERROR)
  }

  async _write_siteinfo (h) {
    const omitList = [
      'source_dir',
      'target_dir',
      'extensions',
      'excludes',
      'internal',
      'path',
      'secrets'
    ]

    const siteinfo = _.cloneDeep(_.omit(h.config.config, omitList))
    for (let collname in siteinfo.collections){
      siteinfo.collections[collname] = _.omit(siteinfo.collections[collname], omitList)
    }
    await fs.outputJson(path.join(h.pathApi(),'site.json'), siteinfo).catch(ERROR)

    const siteinfoJs = _.cloneDeep(h.config.config)
    siteinfoJs.root = h.root
    await fs.outputFile(path.join(h.root, '.config.js'), 'module.exports = ' + JSON.stringify(siteinfoJs, null, 2))
  }
}

module.exports = ApiWriter
