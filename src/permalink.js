const {DEBUG, ERROR} = require('./error.js')

class Permalink {
  constructor () {
    this.name = 'Permalink'
  }
  async register (qgp) {
  }

  async processItem ({item, h}) {
    // Only for page type
    if (item.type !== 'page') return

    let permalink = item.permalink
    if (!permalink) {
      const collname = item.collection
      const template = h.config.get(collname, 'permalink')
      const date = new Date(item.date)
      let year = ''
      let month = ''
      let day = ''
      if (date) {
        year += date.getFullYear()
        month += ('0' + (date.getMonth() + 1)).slice(-2)
        day += ('0' + date.getDate()).slice(-2)
      }
      const paths = item.path.split('/')
      permalink = template
        .replace(':collection', collname)
        .replace(':slug', item.slug || '')
        .replace(':title', item.slug || '')
        .replace(':path', item.cleanPath) // filename-handler
        .replace(':year', year)
        .replace(':month', month)
        .replace(':day', day)
        .replace(':dir1', paths[0] || '')
        .replace(':dir2', paths[1] || '')
        .replace(':dir3', paths[2] || '')
      item.permalink = permalink
    }
    // @note url doesn't include base name
    let url = '/' + permalink 
    url = url.replace(/\/+/g, '/')
    item.url = url
  }
}

module.exports = Permalink
