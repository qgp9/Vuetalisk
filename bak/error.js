let debugLevel = process.env.VUETALISK_DEBUGLEVEL || 1 
const loglevel = process.env.VUETALISK_LOGLEVEL || 1

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

let checkpoint = Date.now()
exports.DEBUG = function (...args) {
  if (debugLevel < 1) {
    return false
  }
  if (typeof args[0] === 'number' && args.length > 1) {
    const level = args.shift()
    let consume = Date.now() - checkpoint
    checkpoint = Date.now()
    consume = ('          ' + consume).slice(-10) 
    if (level <= debugLevel) {
      console.log('DEBUG ' + consume  + ' ' + '-'.repeat(level), ...args)
    }
  } else {
    console.log('DEBUG', ...args)
  }
}


const warnlevel = process.env.WARNLEVEL || 10
exports.WARN = function (level, ...args) {
  if (level <= warnlevel) console.warn('WARN: ', ...args)
}

exports.LOG = function (level, ...args) {
  if (level <= loglevel) console.log('LOG: ', ...args)
}

exports.MyLog = function (name) {
  return (level, ...args) => {
    if (level <= loglevel) console.log(`LOG::${name}: `, ...args)
  }
}
