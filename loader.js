const modules = {
  'debug':                    './debug',
  'vuetalisk':                './bin/vuetalisk',
  'vuetalisk-build':          './bin/vuetalisk-build.js',
  'vuetalisk-clean':          './bin/vuetalisk-clean.js',
  'vuetalisk-dev':            './bin/vuetalisk-dev.js',
  'api-writer':               './plugin/api-writer.js',
  'cleaner':                  './plugin/cleaner.js',
  'data-handler':             './plugin/data-handler.js',
  'file-loader':              './plugin/file-loader.js',
  'filename-handler':         './plugin/filename-handler.js',
  'frontmatter':              './plugin/frontmatter.js',
  'list-handler':             './plugin/list-handler.js',
  'nuxt-generator':           './plugin/nuxt-generator.js',
  'spa-gen-page':             './plugin/spa-gen-page.js',
  'static-handler':           './plugin/static-handler.js',
  'store':                    './plugin/store.js',
  'taxonomy':                 './plugin/taxonomy.js',
  'url-handler':              './plugin/url-handler.js',
  'Vuetalisk':                './src/Vuetalisk.js',
  'commander':                './src/commander.js',
  'config':                   './src/config.js',
  'helper':                   './src/helper.js',
  'item':                     './src/item.js',
  'plugin-list':              './src/plugin-list.js',
  'server':                   './src/server.js',
  'watcher':                  './src/watcher.js',
  'command-loader':           './utils/command-loader.js',
  'config-loader':            './utils/config-loader.js',
  'config-writer':            './utils/config-writer.js',
  'remove-empty-directory':   './utils/remove-empty-directory.js',
  'server':                   './utils/server.js',
  'stats':                    './utils/stats.js',
}

function loader (name) {
  return require(modules[name])
}

module.exports = loader
