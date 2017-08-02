const {join, resolve, extname} = require('path')
/**
 * Add series of command, custom command
 * the arg "-abc" is equivalent to "-a -b -c".
 * This also normalizes equal sign and splits "--abc=def" into "--abc def".
 *
 * @param {Object} commands
 * @param {Object} customCommands
 * @param {String} prefix
 * @param {Array} possibleDirs
 * @param {String} customRoot
 * @return {Command} the new command
 * @api public
 */

function commandLoader(commands, customCommands, prefix, possibleDirs, customRoot, pick) {
  if (!possibleDirs) possibleDirs = ['bin', 'dir']
  if (!customRoot) customRoot = process.cwd()
  let comms = commands
  let custs = customCommands
  if (pick) {
    comms = comms[pick] ? {[pick]: comms[pick]} : {}
    custs = custs[pick] ? {[pick]: custs[pick]} : {}
  }

  // manipulate options of commands
  for (const name in comms) {
    let opts = comms[name]
    if (typeof opts === 'string') {
      comms[name] = opts = {desc: opts}
    }
  }

  // Load custom commands
  for (const name in custs) {
    let opts = custs[name]
    // disable command
    if (!opts) {
      delete comms[name]
      continue
    }
    // if opts is string, it's description
    if (typeof opts === 'string') {
      custs[name] = opts = {desc: opts}
    }
    // check path of custom command
    const bin = opts.path
    if (!bin) {
      const subname = prefix + '-' + name + '.js'
      for (const dir of possibleDirs) {
        var absolute = resolve(customRoot, dir, subname)
        if (fs.existsSync(absolute)){
          bin = absolute
          break
        }
      }
      if (!bin) throw Error(`can't find custom command ${name}`)
    } else {
      bin = path.resolve(customRoot, ...bin.split('/'))
      if (!fs.existsSync(bin)) throw Error(`${path} doesn't exists`)
    }
    opts.path = bin
    if (comms[name]) opts.desc = '[overriden] ' + (opts.desc || comms[name].desc)
    else opts.desc = '[custom] ' + opts.desc
    comms[name] = custs[name]
  }

  return commands
}

commandLoader.find = function (command, h) {
  const name = command
    .replace(/^vuetalisk-/, '')
    .replace(/\.js$/, '')
  const commands = require('../bin/vuetalisk').commands
  const customs = h.conf('', 'build.commands')
  const res = commandLoader(commands, customs, null, h.root, name)
  return res[name]
}
