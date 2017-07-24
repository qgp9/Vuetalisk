//const slug = require('slug')

const nameFormat = /^(?:(\d+-\d+-\d+)-)?(.*)\.([^.]+)$/

class FilenameHandler {
  constructor () {
    this.name = 'FilenameHandler'
  }
  async register (qgp) {
    this.config = qgp.config
    this.collections = qgp.config.getGlobal('collection')
  }

  async processItem ({item}) {
    if (item.type() !== 'page') return
    const collection = item.collection()

    let name = item.src()
    name = name.replace(/\/index(\.\w+)$/, (m, p1) => p1)
    name = name.split('/').pop()
    const match = name.match(nameFormat)
    if (match[1] && !item.date()) {
      const date = new Date(match[1])
      if (date) item.setDate(date)
    }
    if (match[2]) {
      if (!item.slug()) item.setSlug(match[2])
      if (!item.title()) item.setTitle(match[2])
    }
    if (match[3] && !item.ext()) item.setExt(match[3])
  }
}


module.exports = FilenameHandler
