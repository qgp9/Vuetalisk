#!/usr/bin/env node

const cmd = require('../cmd-helper')('clean')
const fs = require('fs-extra')

const program = cmd.base()
program
  .description('Clean API, assets, pages, database, vue/nuxt build\n  Simply remove a dist directory and a db file')
  .parse(process.argv)

const {debug, log, ERROR} = cmd.run()
let vuetalConf = cmd.vuetalConf()

action()
  .catch(ERROR)

async function action () {
  const tal = vuetalConf.init()

  log('Remove dist', tal.helper.pathTarget())
  await fs.remove(tal.helper.pathTarget()).catch(ERROR)

  log('Remove database')
  await tal.store.delete().catch(ERROR)

  cmd.timeEnd()
}

// not used yet
async function cleanApi () {
  const tal = vuetalConf.init()
  log('Remove api point')
  await fs.remove(tal.helper.pathApi()).catch(ERROR)
  log('Remove database')
  await tal.store.delete().catch(ERROR)
}

async function cleanPage () {
  // TODO
}
