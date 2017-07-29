# Vuetalisk

Vuetalisk is a Static Site Generator based on `Static API` for  Vue.

A basic idea is that Vuetalisk just writes a static JSON API from jekyll/hexo like markdown pages,
then Vue can fetch and `vuetify` them.

![vuetalisk](http://i.imgur.com/3QUaAyo.png)

# Install

Since Vutalisk proive a set of commands, let's install it globally

```
npm install -g vuetalisk
```

You need to install it locally per each project
`vue init qgp9/vuetalisk-nuxt` and `vue init qgp9/vuetalisk-vue` will come soon.
```
npm install --save vuetalisk
// or
yarn add vuetalisk
```

# Set up
Vuetalisk needs a configuraion file `vuetalisk.config.js` on root directory of a project.

Basically the configuration needs four functions.
```js
const Vuetalisk = require('vuetalisk')

/**
 * Configurations for site
 * External js/Json/Yaml/Toml file can be used also
 */
const _config = {
  source_dir: 'site',  // source directoy contains posts, pages, static files
  target_dir: 'dist',  // target  directory to write API, HTML end points, also static files
  api_point: 'api',    // API directory name under `target_dir`
  title: 'Vuetalisk',  // Site title
  description: 'Static Site Generator for Vue', // Site Description
  permalink: '/:year/:month/:day/:title',       // Global format of permalink. This can be overrided by each collection
  // In Vuetalisk, every things are categorized as a collection
  collections: {
    posts: { // posts collection
      type: 'page',
      path: '_posts',
      list: '/posts/list'
    },
    pages: {  // collection named 'pages'
      tyle: 'page',
      path: '.',
      permalink: '/:path',
      list: '/pages/list'
    },
    static: {
      type: 'file',
      extensions: '*',
      path: '_static',
      permalink:  '/:path'
  },
  github: {
    repo: 'https://github.com/qgp9/Vuetalisk' 
  },
}

/**
 * Configuration function
 */
const config = () =>
  (new Vuetalisk)
    .setRoot(__dirname)
    .configure(_config) // for a external configuration file, simply put a filename. `.configure('_config.yml')`

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
```
