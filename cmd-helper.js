const path = require('path')

class Cmd {
  constructor (name, program) {
    this.name = name
    this.program = program || require('commander')
    this.start = Date.now()
    this.debug = {log: v => {}} // do nothing yet
    this.vuetal
  }

  base () {
    return this.program
      .option('-q, --quiet', 'Quiet, do not write anyting on startard ouput')

  }
  run () {
    const program = this.program
    if (program.quiet) {
    } else {
      if (!process.env.DEBUG)
        process.env.DEBUG = 'Vuetal:*,-Vuetal:debug:*'
    }
    this.debug = require('./debug')('cmd:' + this.name)
    return this.debug
  }

  vuetal (root, vuetal) {
    if (!root) root = process.cwd()
    if (!vuetal) vuetal = 'vuetalisk.config.js'
    return require(path.join(root, vuetal))
  }

  timeEnd () {
    this.debug.log('Done in %fs', (Date.now() - this.start)/1000)

  }
}

module.exports = function (name, program) {
  return new Cmd(name, program)
}
