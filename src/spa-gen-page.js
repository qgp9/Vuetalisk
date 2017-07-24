const path = require('path')
const fs = require('fs-extra')
const {DEBUG, ERROR} = require('./error.js')
const Item = require('./item.js')

class SpaGenPage {
  constructor () {
    this.name = 'SpaGenPage'
  }

  async register (qgp) {
    this.config = qgp.config
    this.root = qgp.root
    this.store = qgp.store
  }

  async processPostInstall ({checkpoint}) {
    const pagesTable = await this.store.table('page').catch(ERROR)
    const pages = pagesTable.find()

    let indexhtml
    DEBUG('a')
    const indexpath = path.join(this.root, this.config.get('', 'target_dir'), 'index.html')
    DEBUG(indexpath)

    try {
      indexhtml = fs.readFileSync(indexpath)
    } catch (err) {
      ERROR(err)
    }
    
    DEBUG('b')
    if (!indexhtml) ERROR(`index.html doesn't exists. Build vue first`)
    const plist = []
    for (const itemRaw of pages) {
      const item = new Item(itemRaw)
      const outpath = path.join(this.root, this.config.get('', 'target_dir'), item.url(), 'index.html')
      const promise = fs.outputFile(outpath, indexhtml).catch(ERROR)
      plist.push(promise)
    }

    //
    // list
    const collections = this.config.get('', 'collections')
    for (const collname in collections) {
      const collection = collections[collname]
      const listPath = collection.list
      if (listPath) {
        const outdir = path.join(
          this.root, 
          this.config.get(collname, 'target_dir'),
          listPath
        )
        const outpath = path.join(
          outdir,
          'index.html'
        )
        const promise = fs.outputFile(outpath, indexhtml)
          .catch(ERROR)
        plist.push(promise)
        
        const pagenation = collection.pagenation
        if (pagenation) {
          const size = pagesTable.find({collection:collname}).length
          const npage = Math.ceil(size / pagenation)
          for (let i = 1; i <= npage; i++) {
            const outpath = path.join(
              outdir,
              i.toString(),
              'index.html'
            )
            const promise = fs.outputFile(outpath, indexhtml)
              .catch(ERROR)
          }
        }
      }
    }
    
    await Promise.all(plist).catch(ERROR)
  }
}

module.exports = SpaGenPage
