const Vuetalisk = require('vuetalisk')

const _config = require('vuetalisk/utils/config-loader').find()

/**
 * Configuration function
 */
const config = () =>
  (new Vuetalisk)
    .setRoot('.')
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
    .use('url-handler')
    .use('data-handler')
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
