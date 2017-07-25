const _ = require('lodash')

const itemFormat = {
  matter: {
    // All user front matter
  },
  // UNIQUE
  src: '',        // collection name + sub path. UNIQUE
  url: '',        // url except api/. UNIQUE
  // all date/time should be linux time in milliseconds.
  date: 0,
  title: '',
  collection: '',
  slug: '',
  order: 0,
  excert: '',
  fiigure: '',
  data: '', // content or list or object
  updatedAt: 0,       // time. actual mtime
  type: null,     // page, file, list, data
  // only for build
  deleted: false,
  updated: false, // update or not in build time
  lastChecked: 0, // time
  path: '',       // local path from collection path.
  cleanPath: '',  // 'index' is removed from path
  // for LIST
  name: '',        // collection name or any name of list
  pagenation: 0,   // number of item in page 
  archive: '',     // archive url
  archiveBy: '',   // Year or Month or day.
}

const itemApiFormat = {
  matter: {
    // All user front matter
  },
  meta: {
    // Any additional
  },
  // UNIQUE
  url: '',        // url except api/. UNIQUE
  // all date/time should be linux time in milliseconds.
  // from matter
  date: 0,
  title: '',
  slug: '',
  excert: '',
  fiigure: '',
  order: 0,
  //
  collection: '',
  data: '', // content or list or object
  updatedAt: 0,       // time. actual mtime
  type: null,     // page, file, list, data
  // for LIST
  name: '',
  size: 0,         // list size
  // pagenation
  size_all: 0,     // size of all list
  page:  0,        // current page
  page_all: 0,     // number of all page
  // archive
}

const outItemFields = Object.keys(itemApiFormat)

class Item {
  static manipulateMatter (item) {
    const matter = item.matter
    if (!matter) return
    for (const field of ['title', 'date', 'slug', 'excert', 'figure']) {
      if (matter[field]) item[field] = matter[field]
    }
    item.date  = new Date(item.date).getTime()
  }

  static genOutput(item) {
    return _.pick(item, outItemFields)
  }
}


module.exports = Item
