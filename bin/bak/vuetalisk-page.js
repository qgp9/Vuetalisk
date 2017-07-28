#!/usr/bin/env node

const cmd = require('../cmd-helper')('page')

const program = cmd.base()
program
  .description('Build page')
  .option('-f, --force', 'Force to build Nuxt/Vue libray')
  .parse(process.argv)

const {debug, log, ERROR} = cmd.run()
let vuetal = cmd.vuetal()

action().then(() => console.log('action don')).catch(ERROR)

async function action () {
  const options = {}
  if (program.force) options.forceBuild = true
  await vuetal.buildPage().run(options).catch(ERROR)
  cmd.timeEnd()
}
