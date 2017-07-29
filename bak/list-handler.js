const {log, debug, ERROR} = require('./debug')('ListHandler')
const _ = require('lodash')

class ListHandler {
  constructor () {
    this.name = 'ListHandler'
  }

  async register (vuetal) {
  }

  async processInstall ({checkpoint, h}) {
    log('generate lists for collections')
    for (const collection in h.collections) {
      const {list, pagenation, archive, archive_by} = 
        h.confs(collection, ['list', 'pagenation', 'achive', 'archive_by'])
      if (list) {
        const itemList = await h.properList({collection}) 
        // @note Save lists of collection with compact items
        // Actual writing will be handled by ApiWriter
        const compactList = []
        for (const item of itemList){
          compactList.push(h.item.genOutput(_.omit(item, [
            'data',
            'matter',
            'slug'
          ])))
        }
        let item = {
          name: collection,
          url: list,
          src: list,
          type: 'list',
          pagenation,
          archive,
          archiveBy: archive_by,
          data: compactList,
          updatedAt: h.date(checkpoint),
          lastChecked: h.date(checkpoint),
          updated: true,
          deleted: false,
          isApi: true,
          isPage: true,
          isStatic: false
        }
        await h.set(item).catch(ERROR)
      }
    }
    h.collectionListUpdated = true
    debug('done')
  }
}
module.exports = ListHandler
debug('ListHandler loaded')
