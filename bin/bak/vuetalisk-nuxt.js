#!/usr/bin/env node

const commander = require('commander')

commander
  .description('Scan collections, process items, write API, clean removed files')
  .option('-a', 'this is option')
  .parse(process.argv)

console.log('hihi')
