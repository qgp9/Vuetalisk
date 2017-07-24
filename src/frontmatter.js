const frontmatter = require('gray-matter')
class FrontMatter {
  constructor () {
    this.name = 'FrontMatter'
  }
  async register (qgp) {
    this.config = qgp.config.get()
  }
  async processItem ({item}) {
    if (item.type() != 'page') return
    try {
      const matter = frontmatter(item.content())
      item.setMatter(matter.data)
      item.setContent(matter.content)
    } catch (e) {
      console.error(e)
      // Do Nothing ?
    }
    return item
  }
}

module.exports = FrontMatter
