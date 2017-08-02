const load = require('../loader')
const {debug, log, ERROR} = load('debug')('api-writer')
const path = require('path')


class ApiWriter {
  constructor () {
    this.name = 'ApiWriter'
  }
  
  async register (vuetalisk) {
  }

  // TODO write page, list, delete deleted
  async processInstall ({checkpoint, h, options = {ApiWriter: {}}}) {
    debug('processInstall     ', new Date)
    const fs = require('fs-extra')

    const opts = options.ApiWriter

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

    await this.write_siteinfo(h, opts).catch(ERROR)
    debug('processInstall:Done', new Date)
  }

  async write_siteinfo (h, options) {

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

    const configWriter = require('../utils/config-writer')
    const siteinfo = await configWriter.hidden(h.root, h.config.config, omitList)
      .catch(ERROR)
    if (!options.skipWriteHidden) {
      configWriter(siteinfo, h.pathApi('','site.json'))
        .catch(ERROR)
    }
  }
}

module.exports = ApiWriter
ApiWriter.install = () => new ApiWriter
