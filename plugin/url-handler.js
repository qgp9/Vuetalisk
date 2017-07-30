const {debug, ERROR} = require('../debug')('url-handler')
const {join} = require('path')

class UrlHandler {
  constructor () {
    this.name = 'UrlHandler'
  }
  async register (vuetalisk) {
  }

  async processItem ({item, h}) {
    // Only for page type
    if (item.type === 'list') return
    let permalink = item.permalink
    const collname = item.collection
    if (!permalink) {
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
      let cleanPath = item.cleanPath
      if (item.type === 'page' || item.type === 'data') 
        cleanPath = cleanPath.replace(/\..+?$/, '')
      permalink = template
        .replace(':collection', collname)
        .replace(':slug', item.slug || '')
        .replace(':title', item.slug || '')
        .replace(':path', cleanPath) // filename-handler
        .replace(':year', year || '')
        .replace(':month', month || '')
        .replace(':day', day || '')
        .replace(':dir1', paths[0] || '')
        .replace(':dir2', paths[1] || '')
        .replace(':dir3', paths[2] || '')
      item.permalink = permalink
    }
    // @note url doesn't include base name
    let url = '/' + permalink 
    url = url.replace(/\/+/g, '/')
    item.url = url

    const api_point = '/' + h.conf(collname, 'api_point')
    // Use api url for data
    switch (item.type) {
      case 'page':
        if (url === '/') url += 'index'
        item.api = join(api_point, 'page', url + '.json')
        break
      case 'data':
        item.api = join(api_point, collname, url + '.json')
        item.url = join('/', collname, url)
        break
      default:
        item.url = url
    }
  }
}

module.exports = UrlHandler
