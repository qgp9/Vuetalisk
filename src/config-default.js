const configDefault = {
  source_dir: 'src',
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
      pagenation: 20,
      archive: false
    },
    posts: {
      type: 'page',
      path: '_posts',
      list: '/posts/list',
      sort: ['date'],
      pagenation: 20,
      archive: '/archive'
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
