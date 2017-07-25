const _ = require('lodash')
const {DEBUG, ERROR, LOG} = require('./error.js')

class ListHandler {
  constructor () {
    this.name = 'ListHandler'
  }

  async register (qgp) {
  }

  async processInstall ({checkpoint, h}) {
    // Table for list
    const listTable = await h.getOrAddTable('list', {
      unique: 'name'
    })

    // Collection Loop
    for (const collname in h.collections) {
      const {list, pagenation, archive, archive_by} = 
        h.confs(collname, 'list', 'pagenation', 'achive', 'archive_by')
      if (list) {
        const compactList = await h.getProperListCompact(collname) 
        // Actual writing will be handled by ApiWriter
        let item = listTable.by('name', collname)
        let newItem = {
          name: collname,
          url: list,
          type: 'list',
          pagenation,
          archive,
          archiveBy: archive_by,
          data: compactList,
          updatedAt: h.date(checkpoint),
          lastChecked: h.date(checkpoint),
          updated: true
        }
        if (!item) listTable.insert(newItem)
        else listTable.update(Object.assign(item, newItem))
      }
    }
    h.collectionListUpdated = true
  }
}

module.exports = ListHandler
