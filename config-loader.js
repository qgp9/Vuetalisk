const path = require('path')
const fs = require('fs')

class ConfigLoader {
  constructor (options) {
    this.setRoot(options.root)
    this.findOrder = [
      'vuetalisk.config.js',
      '_config.js',
      '_config.json',
      '_config.yml',
      '_config.yarm',
      '_config.toml',
      '_config.tml'
    ]

    if (options.ignoreVuetalConf) this.findOrder.shift()

  }

  setRoot (root) {
    this.root = root || '.'
  }

  findConfig () {
    const files = new Map(fs.readdirSync(this.root).map(v => [v, true]))
    for (const name of this.findOrder ){
      if (files.get(name)) {
        this.configFile = name
        break;
      }
    }
    if (!this.configFile) {
      throw Error(`Vuetalisk config files doesn't exists. It should be one of \n` + this.findOrder.join(' '))
    }
    return this.configFile
  }

  loadVuetalConfig () {
    const confPath = path.join(this.root, 'vuetalisk.config.js')
    if (fs.existsSync(confPath)){
      return require(confPath)
    }
    return require('./defaults/vuetalisk.config.js')
  }
}

function find(root) {
  const finder = new ConfigLoader({ignoreVuetalConf: true, root})
  return finder.findConfig()
}

function loadVuetalConfig(root) {
  const finder = new ConfigLoader({root})
  return finder.loadVuetalConfig()
}

module.exports  = {find, loadVuetalConfig, ConfigLoader}
