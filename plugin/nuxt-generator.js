const path = require('path')
const fs = require('fs-extra')

const {debug, log, ERROR} = require('../debug')('NuxtGenerator')

var resolve = path.resolve
//process.env.DEBUG = 'nuxt:*,Vuetal:*'


class NuxtGenerator {
  constructor () {
    this.name = 'NuxtGenerator'
  }

  async register (qgp) {
  }


  async processPostInstall ({checkpoint, h, options}) {
    if (!options) options = {}

    const server = require('../src/server')(h.pathTarget())
    server.listen()

    // Check nuxt dist ./.nuxt/dist
    let distStats = undefined 
    try {
      distStats = fs.statSync(path.join(h.root, '.nuxt', 'dist'))
    } catch (e) {
      log(`nuxt dist doesn't exists. let's build now`)
    }
    const distMtime = distStats ? distStats.mtimeMs : Date.now()
    const nuxtConfig = require(path.join(h.root,'nuxt.config.js'))
    const nuxtSrcDir = path.join(h.root, nuxtConfig.srcDir)

    let isChanged = true
    if (!options.forceBuild && distStats) {
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

    await server.wait(200) // 200ms *FROM* server start.

    log(`Start Renering`)
    const start = Date.now()
    const plist = []
    for (const item of pages) {
      const url = item.url
      const outpath = path.join(target, url, 'index.html')
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
        if (!nuxt) {
          log('Load Nuxt')
          const {Nuxt, nuxtOpts} = loadNuxt(h.root)
          nuxt = new Nuxt(nuxtOpts)
        } 

        const res = await nuxt.renderRoute(url)
          .catch(ERROR)
        if (res.error) {
          ERROR(res.error)
        }
        await fs.outputFile(outpath, res.html).catch(ERROR)
      }
    }
    debug('nuxt time: ', Date.now() - start)
    if (server) server.close()
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
