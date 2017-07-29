const {debug, log, ERROR} = require('../debug')('server')
const path = require('path')
const fs = require('fs')

class Server {
  constructor (root, port, host) {
    this.root = root
    debug('root is',root)
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
    this.startTime = Date.now()

    process.env.VUETAL_API_PROTOCOL = 'http'
    process.env.VUETAL_API_HOST = this.host
    process.env.VUETAL_API_PORT = this.port

  }
  async listen() {
    // process.env.DEBUG = '*'
    debug('Load Exporess')
    const express = require ('express')
    const serveStatic = require('serve-static')
    const app = express()
    app.use(serveStatic(this.root, {
      setHeaders: (res, path) => {
        res.setHeader('Access-Control-Allow-Origin', '*')
      }
    }))
    this.server = require('http').createServer(app);
    this.server.listen(this.port, this.host)
    console.log('server start')
    this.startTime = Date.now()
    return this.server
  }

  async listenSimple() {
    // process.env.DEBUG = '*'
    debug('Load server')
    const http = require('http')
    //const target = h.pathTarget()
    const target = this.root
    this.server = http.createServer(function (req, res) {
      const url = decodeURIComponent(req.url)
      const file = path.join(target, url)
      debug('get',file)
      fs.readFile(file, function (error, content) {
        if (error) {
          if(error.code == 'ENOENT'){
            res.writeHead(404);
            res.end('404', 'utf-8');
          }
          else {
            res.writeHead(500);
            res.end(error.code);
            res.end(); 
          }

        } else {
          debug('send')
          res.writeHead(200, { 
            'Content-Type': 'application/json', 
            'Access-Control-Allow-Origin': '*'
          });
          res.end(content, 'utf-8');
        }
      })
    })
    this.server.listen(this.port, this.host)
    debug('start simple static server')
    this.startTime = Date.now()
    return this.server
  }

  async close () {
    if (this.server) { 
      await new Promise((resolve, reject) => {
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

  /**
   * Wait certain time from server start. If server access is too fast, server could be not ready yet.
   *
   * @param {number=200} time wait time in ms. default is 200ms
   */
  async wait (time=200) {
    if (!this.startTime) return
    const remain = time - (Date.now() - this.startTime)
    if (remain > 0) {
      debug(`wait for ${remain} among ${time}`)
      await new Promise(resolve => setTimeout(() => resolve(), remain))
    }
  }
}

module.exports = function (port, host) {
  return new Server(port, host)
}
