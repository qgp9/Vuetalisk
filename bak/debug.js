const debugFunc = require('debug')

function setw (str, n = 20, fill = ' ') {
  return (str + fill.toString().repeat(n)).slice(0, n)

}

function debug (name) {
  const width =25
  const head = 'Vuetal'
  let prefix = setw(head + ':' + name + ':', width)
  const _debug = debugFunc(prefix)
  for (const type of ['error', 'warn', 'info', 'log',   'debug']) {  
    const dname = setw([head, type, name, ''].join(':'), width)
    _debug[type] = debugFunc(dname)
  }
  _debug.ERROR = (err, ...args) => {
    if (args && args.length > 0) _debug.error (...args)
    _debug.error (err)
    process.exit(1)
  }
  return _debug
}


module.exports = debug
