const {DEBUG, ERROR} = require('./error.js')

class Permalink {
  constructor () {
    this.name = 'Permalink'
  }
  async register (qgp) {
    this.config = qgp.config
  }

  async processItem ({item}) {
    if (item.type() !== 'page') return
    let permalink = item.permalink()
    if (!permalink) {
      const collname = item.collection()
      const template = this.config.get(collname, 'permalink')
      const matter = item.matter()
      permalink = template
        .replace(':slug', item.slug() || '')
        .replace(':title', item.slug() || '')
        // FIXME: ugly
        .replace(':dirname', item.src().replace(/(\/index)?\.[^.]+$/,'').split('/').slice(2).join('/'))
        .replace(':path', item.src().replace(/(\/index)?\.[^.]+$/,'').split('/').slice(2).join('/'))

      const date = new Date(item.date())
      let year = ''
      let month = ''
      let day = ''
      if (date) {
        year += date.getFullYear()
        month += ('0' + (date.getMonth() + 1)).slice(-2)
        day += ('0' + date.getDate()).slice(-2)
      }
      DEBUG(15, `${item.date()} -- ${new Date(item.date())} -- ${year} ${month} ${day}`)
      permalink = permalink
        .replace(':year', year)
        .replace(':month', month)
        .replace(':day', day)
    }
    item.setPermalink(permalink)
    let url = '/' + permalink // TODO include baseurl?
    url = url.replace(/\/+/g, '/')
    item.setUrl(url)
  }
}

module.exports = Permalink
