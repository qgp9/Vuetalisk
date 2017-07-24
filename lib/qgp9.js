const nodepath = require('path')
// const fs = require('fs-extra')

const Store = require('./src/store.js')
const FileLoader = require('./src/fileLoader.js')
const FrontMatter = require('./src/frontmatter.js')
const FilenameHandler = require('./src/filename-handler.js')
const Permalink = require('./src/permalink.js')
const ApiWriter = require('./src/api-writer.js')
const StaticHandler = require('./src/static-handler.js')
const SpaGenPage = require('./src/spa-gen-page.js')
const {ERROR, DEBUG} = require('./src/error.js')
const QGP9 = require('./src/QGP9.js')


const root = nodepath.join(__dirname, '..')
let qgp = new QGP9
let storeFile = nodepath.join(root, '.store.json')
qgp
  .setRoot(root)
  .configure('_config.yml')
  .useStore(new Store(storeFile))
  .use(new FileLoader)
  .use(new FrontMatter)
  .use(new FilenameHandler)
  .use(new Permalink)
  .use(new ApiWriter)
  .use(new StaticHandler)
  .use(new SpaGenPage)
  //.run().then(() => console.log('Well done')).catch(err => { throw err })

module.exports = qgp
