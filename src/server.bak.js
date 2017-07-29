const {debug, log, ERROR} = require('../debug')('server')

class Server {
  constructor (port, host) {
    this.host =  host ||
      process.env.VUETAL_API_HOST||
      process.env.HOST ||
      process.env.npm_package_config_nuxt_host ||
      '127.0.0.1'
    this.port = port ||
      process.env.VUETAL_API_PORT ||
      parseInt(
        process.env.PORT ||
        process.env.npm_package_config_nuxt_port ||
        3000
      ) + 1
    this.server = undefined

    process.env.VUETAL_API_PROTOCOL = 'http'
    process.env.VUETAL_API_HOST = this.host
    process.env.VUETAL_API_PORT = this.port

  }
  async listen(h) {
    debug('Load Exporess')
    const express = require ('express')
    const serveStatic = require('serve-static')
    const app = express()
    app.use(serveStatic(h.pathTarget()))
    this.server = require('http').createServer(app);
    this.server.listen(this.port, this.host)
    console.log('server start')
    return this.server
  }

  async close () {
    if (this.server) { 
      await new Promise(resolve, reject => {
        const timer = setInterval(() => {
          this.server.close();
          if (!this.server || !this.server.address()) {
            clearInterval(timer)
            resolve()
          }
        }, 50) 
      })
    }
  }
}

module.exports = function (port, host) {
  return new Server(port, host)
}
