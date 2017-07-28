#!/usr/bin/env node

const cmd = require('../cmd-helper')('clean')
const path = require('path')

const program = cmd.base()
program
  .description(`Build site. Default is '-ap' means 'build all`)
  .option('-f, --force', 'Force to build Nuxt/Vue libray')
  .option('-p, --page', 'Build pages. Nuxt/Vue can be compiled in advance')
  .option('-a, --api', 'Build API, statics')
  .parse(process.argv)

const {debug, log, ERROR} = cmd.run()
let vuetal = cmd.vuetal()

const options = {}

action().catch(ERROR)

async function action () {
  if (program.force) options.forceBuild = true

  if (!program.page && !program.api) {
    program.page = true
    program.api = true
  }

  if (program.api) await buildApi()
  if (program.page) await buildPage()
  
  cmd.timeEnd()
}

async function buildApi () {
  await vuetal.buildApi().run(options).catch(ERROR)
}

async function buildPage () {
  await vuetal.buildPage().run(options).catch(ERROR)
}
