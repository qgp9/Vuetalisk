const {debug, warn, log, error, ERROR} = require('./debug')('')
debug('start')
const nodepath = require('path')
let Helper

function srcPath(...args) { return nodepath.resolve(__dirname, ...args) }

class Vuetalisk {
  constructor(config){
    const Config = require('./config')
    this.root = '.'
    this.config = new Config
    this.config.addObj(require('./config-default.js'))
    this.trains = new (require('night-train'))([
      'processCollection',
      'processItem',
      'processInstall',
      'processPostInstall'
    ])
    this.dbLoaded = false
    this.registered = false
    this.helper = undefined
    Helper = require('./helper.js')
  }

  /**
   * Add configuration file. 
   * * chinable
   * * dupllecated ivoking cause merging of config files
   * @param {string} path path of configuration file. Possible extensions are yml, yaml, tml, toml, js, json
   */
  configure (config) {
    if (typeof config === 'object') {
      this.config.addObj(config)
    } else {
      this.config.addFile(nodepath.join(this.root, path))
    }
    this.config._normalize()
    // @important this.helper is only for command. don't use this in plugin
    this.helper = new Helper(this)
    return this
  }

  /**
   * Set configuration of source directory
   * * Chainable
   * * Final value depend on an order of source and configure
   * @param {string} path path of source directory from current directory
   */
  source (path) {
    // FIXME
    this.config.set('source_dir', path)
    return this
  }

  /**
   * Set root directory where _config.yml located
   * * Chainable
   * @param {string} path
   */
  setRoot (path) {
    this.root = path
    return this
  }

  /**
   * Set backed db
   * * Chainable
   * @param {object} store 
   */
  useStore (store, ...args) {
    if (typeof store === 'string') {
      const Store = require(srcPath(store))
      this.store =  new Store(...args)
    } else {
      this.store = store
    }
    return this
  }


  /**
   * Register plugin
   * * Chainable
   * @param {object} plugin
   */
  use (plugin, ...args) {
    if (typeof plugin === 'string') {
      const Plugin = require(srcPath(plugin))
      this.trains.register(new Plugin(...args))
    } else {
      this.trains.register(plugin)
    }
    return this
  }

  /** 
   * Helper function to run each 'processItem' train
   * @private
   */ 
  async _processItems (h) {
    const type = 'page'
    const items = await h.updatedList({type}).catch(ERROR)
    const plist = []
    for (const item of items) {
      const promise = this.trains.run('processItem', {h, item})
        .catch(ERROR)
      plist.push(promise)
    }
    await Promise.all(plist)
    this.store.save()
  }

  /**
   * @private
   * init function which will be invoked in the begining of any run
   */
  async init() {
    debug('Init')
    await this.store.load().catch(ERROR)
    this.table = await this.store.itemTable().catch(ERROR)
    this.cache = await this.store.cacheTable().catch(ERROR)
    debug('Store loaded')

    // Finalize config
    this.config._normalize()
    debug('Config nomalized')

    // register plugin
    if (!this.registered) {
      await this.trains.runAsync('register', this)
        .then(() => { this.registered = true })
        .catch(ERROR)
    }
    debug('Registration done')
  }

  /**
   * Run processCollection, processItem, processInstall
   */
  async run () {
    log('Run')
    const vuetalisk = this
    const checkpoint = this.checkpoint = Date.now()
    const h = new Helper(this)
    debug('Init')
    await this.init().catch(ERROR)
    debug('processCollection')
    await this.trains.run('processCollection', {h, vuetalisk, checkpoint})
      .catch(ERROR)
    debug('processItem')
    await this._processItems(h)
      .catch(ERROR)
    debug('processInstall')
    await this.trains.run('processInstall', {h, vuetalisk, checkpoint})
      .catch(ERROR)
    debug('SaveDB')
    await this.store.save().catch(ERROR)

    log('Well Done')
  }

  /**
   * Run processPostInstall
   */
  async postRun () {
    log('PostRun')
    const vuetalisk = this
    const checkpoint = this.checkpoint = Date.now()
    const h = new Helper(this)

    await this.init().catch(ERROR)

    debug('processPostInstall')
    await this.trains.run('processPostInstall', {h, vuetalisk, checkpoint})
      .catch(ERROR)
    log('Well Done')
  }

  static require (module) {
    return require(srcPath(module))
  }
}

debug('Vuetalisk loaded')

module.exports = Vuetalisk
