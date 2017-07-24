const qgp9 = require('./qgp9.js')

qgp9.postRun().then(() => console.log('Well done')).catch(err => { throw err })
