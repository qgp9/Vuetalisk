const path = require('path')
const fs = require('fs-extra')

const {debug, log, ERROR} = require('../debug')('NuxtGenerator')

var resolve = path.resolve
process.env.DEBUG = 'nuxt:*,Vuetal:*'


class NuxtGenerator {
  constructor () {
    this.name = 'NuxtGenerator'
  }

  async register (qgp) {
  }


  async processPostInstall ({checkpoint, h, options}) {
    if (!options) options = {}

    // Check nuxt dist ./.nuxt/dist
    const distStats = fs.statSync(path.join(h.root, '.nuxt', 'dist'))
    const distMtime = distStats.mtimeMs
    const nuxtConfig = require(path.join(h.root,'nuxt.config.js'))
    const nuxtSrcDir = path.join(h.root, nuxtConfig.srcDir)

    let isChanged = true
    if (!options.forceBuild) {
      isChanged = await scanDir(nuxtSrcDir, distMtime)
    }

    let pages
    let nuxt
    if (isChanged) {
      if (options.forceBuild) {
        log('Force Build Mode. Build nuxt lib now.')
      } else {
        log('Nuxt source is changed. Build nuxt lib now. %s', isChanged)
      }
      debug('Load Nuxt')
      const {Builder, Nuxt, nuxtOpts} = loadNuxt(h.root)
      nuxt = new Nuxt(nuxtOpts)
      debug('Build Nuxt Lib')
      await new Builder(nuxt).build().catch(ERROR)

    }

    log('Copy nuxt dist to Vuetal dist')
    const target = h.pathTarget()
    const targetNuxt = path.join(target, '_nuxt')
    const sourceNuxt = path.join('.nuxt', 'dist')
    await fs.remove(targetNuxt).catch(ERROR)
    await fs.copy(sourceNuxt, targetNuxt).catch(ERROR)

    // find pages to render
    pages = await h.properList({isPage: true})

    if (!pages || pages.length == 0) {
      log('Nothing to update')
      return
    } else {
      log('%d pages to update', pages.length)
    }


    let server

    log(`Start Renering`)
    const start = Date.now()
    for (const item of pages) {
      const url = item.url
      const outpath = path.join(target, item.url, 'index.html')
      let doRender = true
      if(!isChanged) {
        const updatedAt = item.updatedAt
        doRender = false
        if (!doRender && !fs.existsSync(outpath)) doRender = true
        if (!doRender) {
          const stat = fs.statSync(outpath)
          const mtime = stat.mtimeMs
          if (mtime < distMtime || mtime < updatedAt) doRender = true
        }
      }

      // doRender = true
      if (doRender) {
        if (!server) {
          log('Load Exporess')
          const express = require ('express')
          const serveStatic = require('serve-static')
          var port = process.env.PORT || process.env.npm_package_config_nuxt_port || '3000'
          var host = process.env.HOST || process.env.npm_package_config_nuxt_host || '127.0.0.1'
          process.env.QGP_API_PROTOCOL = 'http'
          process.env.QGP_API_HOST = host
          process.env.QGP_API_PORT = port
          const app = express()
          app.use(serveStatic(path.join(h.root, 'dist')))
          server = require('http').createServer(app);
          server.listen(port, host)
        }
        if (!nuxt) {
          log('Load Nuxt')
          const {Nuxt, options} = loadNuxt(h.root)
          nuxt = new Nuxt(options)
        }

        const res = await nuxt.renderRoute(url)
          .catch(ERROR)
        if (res.error) {
          ERROR(error)
        }
        await fs.outputFile(outpath, res.html).catch(ERROR)
      }
    }
    debug('nuxt time: ', Date.now() - start)
    if (server) {
      const timer = setInterval(() => {
        server.close()
        if (!server.address()) clearInterval(timer)
      }, 50)
    }
    if (nuxt) nuxt.close()
  }
}

async function scanDir (fullpath, time) {
  const stats = fs.statSync(fullpath)
  const mtime = stats.mtimeMs
  if (mtime > time) return fullpath
  if (stats.isDirectory()) {
    const files = fs.readdirSync(fullpath)
    for (const file of files) {
      const res = await scanDir(path.join(fullpath, file), time)
      if (res) return res
    }
  }
  return false
}

function loadNuxt (root) {
  var nuxtOpts = {}
  var nuxtConfigFile = path.resolve(root, 'nuxt.config.js')
  if (fs.existsSync(nuxtConfigFile)) {
    nuxtOpts = require(nuxtConfigFile)
  }
  if (typeof nuxtOpts.rootDir !== 'string') {
    nuxtOpts.rootDir = root
  }
  nuxtOpts.dev = false // Force production mode (no webpack middleware called)
  const {Builder, Nuxt} = require('nuxt')
  return {Builder, Nuxt, nuxtOpts}
}

module.exports = NuxtGenerator
