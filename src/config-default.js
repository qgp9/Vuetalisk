const configDefault = {
  this_is_default: true,
  source_dir: 'site',
  target_dir: 'dist',
  api_point: 'api',
  basename: '/',
  permalink: '/:year/:month/:day/:slug',
  extensions: ['.md', '.markdown', '.json', '.html'],
  excludes: ['.git', '.gitignore'],
  taxonomy: {
    category: ['category', 'categories'],
    tag: ['tag', 'tags']
  },
  build: {
    protocal: 'http',
    host: '127.0.0.1',
    port: 3001
  },
  collections: {
    pages: {
      type: 'page',
      path: '.',
      permalink: '/:path',
      list: '/pages/list',
      sort: ['dir', 'order'],
    },
    data: {
      type: 'data',
      path: '_data',
      permalink: '/:path',
      list: '/data/list',
      extensions: ['.js', '.json', '.yml', '.yaml', '.tml', '.toml'],
    },
    static: {
      type: 'file',
      extensions: '*',
      path: '_static',
      permalink:  '/:path'
    }
  }
}

module.exports = configDefault
