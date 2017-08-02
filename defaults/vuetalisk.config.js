const Vuetalisk = require('vuetalisk')
const NuxtGenerator = require('nuxt-generator')

const _config = require('vuetalisk/utils/config-loader').find()

/**
 * Configuration function
 */
const config = vuetal => vuetal
  .setRoot('.')
  .configure(_config)

/**
 * Init function. `config()` should be invoked in the begining
 */
const init = vuetal => vuetal
  .useStore('store', '.store.json')

/**
 * Build API. scan collections, process items/lists, Write API, remove deleted files
 */
const buildApi = vuetal => vuetal
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
const buildPage = vuetal => vuetal
  .use(NuxtGenerator)

const dev = vuetal => vuetal
  .use(NuxtGenerator)

const clean = vuetal => vuetal
  .use(NuxtGenerator)

const deploy = vuetal => vuetal
  .use(NuxtGenerator)

module.exports = {config, init, buildApi, buildPage}
