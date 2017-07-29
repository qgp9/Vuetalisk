class Taxonomy {
  constructor () {

  }

  async register (vuetalisk) {
    this.config = vuetalisk.config.get()
    this.pages = vuetalisk.store.getCollection('pages')
    this.taxoList = this.config.taxonomy
    this.taxoMap = {}
    for (const taxoname in taxoList) {
      const aliases = taxoList[taxoname]
      for (const alias of aliases) {
        taxoMap[alias] = taxoname
      }
      taxoMap[taxoname] = taxoname
    }
    this.taxos = vuetalisk.store.getCollection('taxonomy')
    if (this.taxos) {
      vuetalisk.store.addCollection('taxonomy', {

      })
    }
  }

  async processInstall () {
    const pages = this.pages.find()
      if (!obj.data) return false
      if (!obj.data.data) return false
      for (const taxoname in taxoMap) {
        
      }
      return obj.data && 
        obj.data.data &&


    })


  }

  async api () {
    const res = {
      apiBase: this.vuetaliskConfig.api.metaPoint + '/collection'
      api: []
    }
    const taxonomy = await this.model.find('taxonomy')
    for (const collection in taxonomy) {
      res.api.push({
        name: collection,
        data: taxonomy[collection]
      })
    }
    return res
  }

}


