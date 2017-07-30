#!/usr/bin/env node

const cmd = require('../cmd-helper')('build')
const path = require('path')
let vuetalConf = cmd.vuetalConf()
const {debug, log, ERROR} = cmd.run()

if (!module.parent) {
  commander()
}

/**
 * Command function
 */
async function commander () {
  const program = cmd.base()
  program
    .description(`Build site. Default is build only api`)
    .option('-f, --force', 'Force to build Nuxt/Vue libray')
    .option('-p, --page', 'Build pages. Nuxt/Vue can be compiled in advance')
    .option('-a, --all', 'Build all')
    .option('-c, --clean', 'Clean data base, remove dist before build')
    .parse(process.argv)


  action(program).catch(ERROR)
}

/**
 * Action 
 */
async function action (program) {
  if (program.force) opts.forceBuild = true

  program.api = true
  if (program.all) {
    program.page = true
  } else if (program.page) {
    program.api = false
  }

  if (program.clean) {
    await require('./vuetalisk-clean').action()
  }

  const opts = {}

  if (program.api) await buildApi(opts)
  if (program.page) await buildPage(opts)

  cmd.timeEnd()
}

/**
 * Build API
 */
async function buildApi (opts) {
  await vuetalConf.buildApi().run(opts).catch(ERROR)
}

/**
 * Build Page
 */
async function buildPage (opts) {
  await vuetalConf.buildPage().run(opts).catch(ERROR)
}

module.exports = {cmd, buildApi, buildPage}

