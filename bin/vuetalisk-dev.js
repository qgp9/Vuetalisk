#!/usr/bin/env node

const cmd = require('../cmd-helper')('dev')
const path = require('path')

const program = cmd.base()
program
  .description(`Vuetalisk dev mode, Nuxt dev mode is optional`)
  .option('-n, --nuxt', 'Run Nuxt dev with Veutalisk dev')
  .parse(process.argv)

const {debug, log, ERROR} = cmd.run()
let vuetalConf = cmd.vuetalConf()

const options = {
  dev: true,
  nuxt: program.nuxt
}

action(options).catch(ERROR)

async function action (opts) {
  debug('web-server')
  const helper = vuetalConf.init().helper
  require('../src/server')(helper.pathTarget()).listen()

  debug('watcher')
  require('../src/watcher.js')({dev: opts.dev})

  if (opts.nuxt) {
    debug('nuxt dev')
    require('nuxt/bin/nuxt-dev')
  }
}
