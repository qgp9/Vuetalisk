#!/usr/bin/env node

const cmd = require('../cmd-helper')('build')
const path = require('path')

const program = cmd.base()
program
  .description(`Build site. Default is '-ap' means 'build all`)
  .option('-f, --force', 'Force to build Nuxt/Vue libray')
  .option('-p, --page', 'Build pages. Nuxt/Vue can be compiled in advance')
  .option('-a, --api', 'Build API, statics')
  .option('-c, --clean', 'Clean data base, remove dist before build')
  .parse(process.argv)

const {debug, log, ERROR} = cmd.run()
let vuetalConf = cmd.vuetalConf()

const options = {}

if (!module.parent) {
  action().catch(ERROR)
}

async function action (opts = {}) {
  if (program.force) opts.forceBuild = true

  if (!program.page && !program.api) {
    program.page = true
    program.api = true
  }

  if (program.clean) {
    await require('./vuetalisk-clean').action()
  }

  if (program.api) await buildApi(opts)
  if (program.page) await buildPage(opts)

  cmd.timeEnd()
}

async function buildApi (opts) {
  await vuetalConf.buildApi().run(opts).catch(ERROR)
}

async function buildPage (opts) {
  await vuetalConf.buildPage().run(opts).catch(ERROR)
}

module.exports = {cmd, buildApi, buildPage}

