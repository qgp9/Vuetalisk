const nodepath = require('path')
// const fs = require('fs-extra')

const QGP9 = require('QGP9')
const Store = require('QGP9/src/store.js')
const FileLoader = require('QGP9/src/fileLoader.js')
const FrontMatter = require('QGP9/src/frontmatter.js')
const FilenameHandler = require('QGP9/src/filename-handler.js')
const Permalink = require('QGP9/src/permalink.js')
const ApiWriter = require('QGP9/src/api-writer.js')
const StaticHandler = require('QGP9/src/static-handler.js')
const SpaGenPage = require('QGP9/src/spa-gen-page.js')
const {ERROR, DEBUG} = require('QGP9/src/error.js')


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
