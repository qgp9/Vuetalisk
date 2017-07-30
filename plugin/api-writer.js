const path = require('path')
const fs = require('fs-extra')
const {debug, log, ERROR} = require('../debug.js')('api-writer')
const Item = require('../src/item.js')
const _ = require('lodash')


class ApiWriter {
  constructor () {
    this.name = 'ApiWriter'
  }
  
  async register (vuetalisk) {
  }

  // TODO write page, list, delete deleted
  async processInstall ({checkpoint, h, options}) {
    debug('processInstall     ', new Date)
    // items whatever has isApi = true
    const items = await h.updatedList({
      isApi: true,
      installed: false,
    }).catch(ERROR)

    // const list = await  h.find({type:'list'})

    let plist = []
    for (const item of items) {
      if (item.src.match(/menu/)) debug(item)
      if (!item.api) continue
      const promise = fs.outputJson(
        h.pathTarget(item.collection, item.api),
        h.item.genOutput(item)
      ).catch(ERROR)
      plist.push(promise)
    }
    await Promise.all(plist).catch(ERROR)

    await this._write_siteinfo(h, options).catch(ERROR)
    debug('processInstall:Done', new Date)
  }

  async _write_siteinfo (h, options) {
    if (!options) options = {}

    const omitList = [
      'source_dir',
      'target_dir',
      'extensions',
      'excludes',
      'internal',
      'path',
      'secrets'
    ]

    if (options.dev) {
      debug('Bulid siteinfo.json with dev mode')
    } else {
      debug('Build siteinfo.json')
      omitList.push('build')
    }

    const siteinfo = _.cloneDeep(_.omit(h.config.config, omitList))
    for (let collname in siteinfo.collections){
      siteinfo.collections[collname] = _.omit(siteinfo.collections[collname], omitList)
    }
    await fs.outputJson(path.join(h.pathApi(),'site.json'), siteinfo).catch(ERROR)
    await fs.outputJson(path.join(h.root,'.site.json'), siteinfo).catch(ERROR)

    const siteinfoJs = _.cloneDeep(h.config.config)
    siteinfoJs.root = h.root
    await fs.outputFile(path.join(h.root, '.config.js'), 'module.exports = ' + JSON.stringify(siteinfoJs, null, 2))
  }
}

module.exports = ApiWriter
ApiWriter.install = () => new ApiWriter
