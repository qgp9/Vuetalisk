const path = require('path')

const dateTitleFormat = /^(\d+-\d+-\d+)-(.+)\.([^.]+)$/
const orderTitleFormat = /^(\d+)\.(.+)\.([^]+)$/

class FilenameHandler {
  constructor () {
    this.name = 'FilenameHandler'
  }
  async register (vuetalisk) {
  }

  async processItem ({item, h}) {
    if (item.type === 'list') return

    const collection = item.collection
    let name = path.basename(item.path)
    let cleanPath = item.path
    // remove '/index'
    if (name.match(/^index(\.[^.]+)?$/)) {
      let dir = path.dirname(item.path)
      let ext = path.extname(name)
      name = path.basename(dir + ext)
      cleanPath = dir + ext
    }
    item.cleanPath = cleanPath

    let match, date, title, ext, order
    match = name.match(dateTitleFormat)
    if (match) {
      date = match[1]
      title = match[2]
      ext = match[3]
    } 
    if (!match) {
      match = name.match(orderTitleFormat)
      if (match) {
        order = match[1]
        title = match[2]
        ext = match[3]
      }
    } 
    // Most general way
    if (!match) {
      ext = path.extname(name)
      title = name.slice(0, -ext.length)
    }
    if (date && !item.date) {
      item.date = h.date(date)
    }
    if (title) {
      if (!item.slug) item.slug = title
      if (!item.title) item.title = title
      if (!item.slug) item.slug = title
    }
    if (ext && !item.ext) item.ext = ext
    if (order && !item.order) item.order = order
  }
}


module.exports = FilenameHandler
FilenameHandler.install = () => new FilenameHandler
