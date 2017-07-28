const Vuetalisk = require('vuetalisk')
const {log, debug, ERROR} = Vuetalisk.require('debug')('config')
const root = __dirname

debug('Vuetalisk loaded')

/**
 * Configurations for site
 * External js/Json/Yaml/Toml file can be used also
 */
const _config = {
  source_dir: 'site',
  target_dir: 'dist',
  api_point: 'api',
  permalink: '/:year/:month/:day/:title',
  build: {
    root,
    commands: {
    }
  }
}

/**
 * Configuration function
 */
const config = () =>
  (new Vuetalisk)
    .setRoot(root)
    .configure(_config)

/**
 * Init function. `config()` should be invoked in the begining
 */
const init = () => 
  config()
    .useStore('store', '.store.json')

/**
 * Build API. scan collections, process items/lists, Write API, remove deleted files
 */
const buildApi = () =>
  init()
    .use('file-loader')
    .use('frontmatter')
    .use('filename-handler')
    .use('permalink')
    .use('list-handler')
    .use('api-writer')
    .use('static-handler')
    .use('cleaner')

/**
 * Build Vue/Nuxt, Pages.
 */
const buildPage = () =>
  init()
    .use('nuxt-generator')

module.exports = {config, init, buildApi, buildPage, _config}
