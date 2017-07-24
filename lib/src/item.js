class Item {
  constructor(item) {
    this.item = item || {}
    if (!this.item.data) this.item.data = {}
    if (!this.item.data.data) this.item.data.data = {}
  }

  // Getter
  
  id () { return this.item.$loki } // TODO: be general }

  date () { return this.matter().date }

  ext () { return this.matter().ext }

  collection () { return this.item.collection }

  content () { return this.item.content }

  lastChecked () { return this.item.lastChecked }

  matter () { return this.item.data.data }

  mtime () { return this.item.mtime }

  path () { return this.item.path }

  permalink () { return this.matter().permalink }

  slug () { return this.matter().slug }

  src () { return this.item.src }

  title () { return this.matter().title }

  /**
   * @return {page|file}
   */
  type () { return this.item.type }

  updated () { return this.item.updated }

  url () { return this.item.url }


  // Setter
  setCollection (collname) { this.item.collection = collname }

  setContent (content) { this.item.content = content }

  setDate (date) { this.matter().date = date }

  setExt (ext) { this.matter().ext = ext }

  setLastChecked (datetime) { this.item.lastChecked = datetime }

  setMatter (matter) { this.item.data.data = matter }

  setMtime (mtime) { this.item.mtime = mtime }
  
  setPermalink (link) { this.matter().permalink = link }

  setSlug (slug) { this.matter().slug = slug }

  setSrc (src) { this.item.src = src }

  setTitle (title) { this.matter().title = title }

  /**
   * @param {page|file} type type of collection
   */
  setType (type) { this.item.type = type }

  setUrl (url) { this.item.url = url }

  /**
   * @param {boolean} updated
   */
  setUpdated (updated) { this.item.updated = updated }

  setPath (path) { this.item.path = path }

}

module.exports = Item
