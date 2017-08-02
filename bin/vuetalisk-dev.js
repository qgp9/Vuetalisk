#!/usr/bin/env node

const cmd = require('../cmd-helper')('dev')
const path = require('path')
const {buildApi, buildPage} = require('../bin/vuetalisk-build.js')

const program = cmd.base()
program
  .description(`Vuetalisk dev mode, Nuxt dev mode is optional`)
  .option('-n, --nuxt', 'Run Nuxt dev with Veutalisk dev')
  .option('-c, --clean', 'Clean data base, remove dist before build')
  .parse(process.argv)

const {debug, log, ERROR} = cmd.run()
let vuetalConf = cmd.vuetalConf()

const options = {
  dev: true,
  nuxt: program.nuxt,
  clean: program.clean
}

action(options).catch(ERROR)

async function action (opts) {
  process.argv = process.argv.slice(0,2)
  if (opts.clean) {
    debug('clean dist')
    await require('./vuetalisk-clean').action()
  }
  
  debug('build api')
  await buildApi(opts)
    .then(() => console.log('vuetal build is well done'))
    .catch(err => { console.error(err) })

  debug('web-server')
  const helper = vuetalConf.init().helper
  require('../utils/server')(helper.pathTarget()).listen()

  debug('watcher')
  require('../utils/watcher.js')({dev: opts.dev})

  if (opts.nuxt) {
    debug('nuxt dev')
    require('nuxt/bin/nuxt-dev')
  }
}
