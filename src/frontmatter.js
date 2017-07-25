const frontmatter = require('gray-matter')
class FrontMatter {
  constructor () {
    this.name = 'FrontMatter'
  }

  async register (qgp) {
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
      console.error(e)
      // FIXME: Do Nothing ?
      // TODO: TOML, JSON ?
    }
    return item
  }
}

module.exports = FrontMatter
