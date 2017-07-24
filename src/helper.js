const path = require('path')
const fs = require('fs-extra')
const {DEBUG, ERROR} = require('./error.js')

class Helper {
  constructor (qgp) {
    this.qgp = qgp
    this.config = qgp.config
    this.collections = qgp.config.getGlobal('collections')
    this.checkpoint = qgp.checkpoint
  }

  genCollectionMap (generator = Object)  {
    const map = {}
    for (const name in this.collections) {
       map[name] = generator()
    }
    return map
  }

  getApiPath (collname, ...others) {
    return path.join(
      this.qgp.root,
      this.config.get(collname, 'target_dir'),
      this.config.get(collname, 'api_point'),
      ...others.map(v => v.toString())
    )
  }

  getItemApiPath (item) {
    return this.getApiPath(
      item.collection(),
      'url',
      item.url() + '.json'
    )
  }

  async writePagenation (list, pagenation, outpath, meta = {}) {
    outpath = outpath.replace(/\.json$/, '')
    const fullsize = list.length
    const copy = [].concat(list)
    let page = 0
    while (copy.length >  0) {
      page++
      const list = copy.splice(0, pagenation)
      const paged = Object.assign(
        meta, 
        {
          type: 'list',
          size: list.length,
          page: page,
          size_all: fullsize,
          page_all: Math.ceil(fullsize/pagenation),
          updatedAt: this.checkpoint,
          data: list
        })
      await fs.outputJson(path.join(
        outpath, page + '.json'
      ), paged)
        .catch(ERROR)
    }
  }
}

module.exports = Helper
