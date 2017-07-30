const {debug, warn, log, error, ERROR} = require('../debug')('Main')
const nodepath = require('path')
const pluginList = require('./plugin-list')
let Helper

function srcPath(...args) { return nodepath.resolve(__dirname, ...args) }
function pluginPath(...args) { return nodepath.resolve(__dirname, '..', 'plugin', ...args) }
function pkgPath(...args) { return nodepath.resolve(__dirname, '..', ...args) }

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
      this.config.addFile(nodepath.join(this.root, config))
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
    this.root = nodepath.resolve(path)
    return this
  }

  /**
   * Set backed db
   * * Chainable
   * @param {object} store 
   */
  useStore (store, ...args) {
    if (typeof store === 'string') {
      let Store
      if (pluginList[store]) Store = require(pluginPath(store))
      else Store = require('vuetalisk-plugin-' + store)
      this.store =  Store.install(...args)
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
      debug(plugin)
      let Plugin
      if (pluginList[plugin]) Plugin = require(pluginPath(plugin))
      else Plugin = require('vuetalisk-plugin-' + plugin)
      this.trains.register(Plugin.install(...args))
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
    // const type = 'page'
    const items = await h.updatedList().catch(ERROR)
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
  async init({options}) {
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
  async run (options) {
    if (!options) options = {}
    log('Run')
    const vuetalisk = this
    const checkpoint = this.checkpoint = Date.now()
    const h = new Helper(this)

    debug('Init')
    await this.init({options}).catch(ERROR)

    debug('processCollection')
    await this.trains.run('processCollection', {h, vuetalisk, checkpoint, options})
      .catch(ERROR)

    debug('processItem')
    await this._processItems(h)
      .catch(ERROR)

    debug('processInstall')
    await this.trains.run('processInstall', {h, vuetalisk, checkpoint, options})
      .catch(ERROR)
    
    debug('processPostInstall')
    await this.trains.run('processPostInstall', {h, vuetalisk, checkpoint, options})
      .catch(ERROR)

    debug('SaveDB')
    await this.store.save().catch(ERROR)

    log('Well Done')
  }

  static require (module) {
    if (module === 'debug') return require(pkgPath(module))
    return require(pluginPath(module))
  }
}

debug('Vuetalisk loaded')

module.exports = Vuetalisk
