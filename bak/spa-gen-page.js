const path = require('path')
const fs = require('fs-extra')
const {DEBUG, ERROR} = require('./error.js')
const Item = require('./item.js')

class SpaGenPage {
  constructor () {
    this.name = 'SpaGenPage'
  }

  async register (vuetalisk) {
  }

  async processPostInstall ({checkpoint, h}) {
    const pages = h.properList({
      isPage: true
    })

    let indexhtml
    // const indexpath = path.join(h.root, h.conf('', 'target_dir'), 'index.html')
    const target = h.pathTarget()
    const indexpath = path.join(target, 'index.html')

    try {
      indexhtml = fs.readFileSync(indexpath)
    } catch (err) {
      ERROR(err)
    }

    if (!indexhtml) ERROR(`index.html doesn't exists. Build vue first`)
    const plist = []
    for (const item of pages) {
      const outpath = path.join(target, item.url, 'index.html')
      const promise = fs.outputFile(outpath, indexhtml).catch(ERROR)
      plist.push(promise)
    }

    await Promise.all(plist)
  }
}

module.exports = SpaGenPage
