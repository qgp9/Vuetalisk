#!/usr/bin/env node

const cmd = require('../cmd-helper')('clean')
const path = require('path')

const program = cmd.base()
program
  .description('Scan collections, process items, write API, clean removed files')
  .parse(process.argv)

const {debug, log, ERROR} = cmd.run()
let vuetal = cmd.vuetal()

action().catch(ERROR)

async function action () {
  await vuetal.buildApi().run().catch(ERROR)
  cmd.timeEnd()
}
