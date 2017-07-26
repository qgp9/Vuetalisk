const _ = require('lodash')
const {DEBUG, ERROR, LOG} = require('./error.js')

class ListHandler {
  constructor () {
    this.name = 'ListHandler'
  }

  async register (qgp) {
  }

  async processInstall ({checkpoint, h}) {
    LOG(3, 'ListHandler::processInstall     ', new Date)
    // Collection Loop
    for (const collection in h.collections) {
      const {list, pagenation, archive, archive_by} = 
        h.confs(collection, ['list', 'pagenation', 'achive', 'archive_by'])
      if (list) {
        const itemList = await h.properList({collection}) 
        // Actual writing will be handled by ApiWriter
        // Not use Cached data yet
        const compactList = []
        for (const item of itemList){
          compactList.push(h.item.genOutput(_.omit(item, [
            'data',
            'matter',
            'slug'
          ])))
        }
        // DEBUG('LISTMAN ', compactList[5])
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
    LOG(3, 'ListHandler::processInstall:Done', new Date)
  }
}

module.exports = ListHandler
