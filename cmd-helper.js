const path = require('path')

class Cmd {
  constructor (name, program) {
    this.name = name
    this.program = program || require('commander')
    this.start = Date.now()
    this.debug = {log: v => {}} // do nothing yet
    this.vuetalConf
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
        process.env.DEBUG = 'vuetal:*,-vuetal:debug:*'
    }
    this.debug = require('./debug')('cmd:' + this.name)
    return this.debug
  }

  vuetalConf (root, confPath) {
    if (!root) root = process.cwd()
    if (!confPath) return require('./config-loader').loadVuetalConfig(root)
    return require(path.join(root, confPath))
  }

  timeEnd () {
    this.debug.log('Done in %fs', (Date.now() - this.start)/1000)

  }
}

module.exports = function (name, program) {
  return new Cmd(name, program)
}
