const {debug} = require('./debug')('FrontMatter')
let frontmatter

class FrontMatter {
  constructor () {
    this.name = 'FrontMatter'
  }

  async register (vuetal) {
    frontmatter = require('gray-matter')
  }

  async processItem ({item, h}) {
    if (item.type != 'page') return
    try {
      const matter = frontmatter(item.data)
      item.matter = matter.data
      item.data = matter.content
      item.excert = matter.excert
      h.item.manipulateMatter(item)
    } catch (e) {
      error(e)
      // FIXME: Do Nothing ?
      // TODO: TOML, JSON ?
    }
    return item
  }
}

debug('front-matter loaded')
module.exports = FrontMatter

