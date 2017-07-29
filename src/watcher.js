// Watch site source and run vuetal
const _ = require('lodash')
const chokidar = require('chokidar')
const path = require('path')
const {buildApi, buildPage, cmd} = require('../bin/vuetalisk-build.js')
const {debug, log, ERROR} = require('../debug')('watcher')

async function watcher(options) {
  const vuetalConf = cmd.vuetalConf().init()
  const root = options.root || vuetalConf.root
  const sitedir = path.join(root, vuetalConf.config.get('','source_dir'))

  await buildApi(options)
    .then(() => console.log('vuetal well done'))
    .catch(err => { console.error(err) })

  const watcher = chokidar.watch(sitedir, {ignoreInitial: true})
    .on('all', _.debounce((event, path) => {
      console.log(event, path)

      if (options.dev) debug('Build Api with dev mode')
      buildApi(options)
        .then(() => console.log('vuetal well done'))
        .catch(err => { console.error(err) })
    }), 2500)
}

module.exports = watcher 
