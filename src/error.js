let debugLevel = 10 
let verboseLevel = 1

exports.ERROR = function (...args) {
  console.error(...args)
  process.exit(1)

}

exports.ERRMSG = function (...args) {
  return err => {
    console.error(...args)
    console.error(err)
    process.exit(1)
  }
}


exports.DEBUG = function (...args) {
  if (debugLevel < 1) {
    return false
  }
  if (typeof args[0] === 'number' && args.length > 1) {
    const level = args.shift()
    if (level <= debugLevel) {
      console.log('DEBUG ' + '-'.repeat(level), ...args)
    }
  } else {
    console.log('DEBUG', ...args)
  }
}

exports.WARN = function (...args) {
  console.warn(...args)
}


exports.VERBOSE = function (level, ...args) {
  if (level <= verboseLevel) console.log(...args)
}
