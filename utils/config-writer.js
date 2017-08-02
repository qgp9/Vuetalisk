const {debug, ERROR} = require('../debug')('config-writer')
//const nameMatcher = require('.name-matcher')
const {extname, join} = require('path')

async function configWriter (config, path, omits) {
  const fs = require('fs-extra')
  const _config = omits ? omitDeep(config, omits) : config
  const ext = extname(path)
  switch (ext) {
    case '.json':
      await fs.outputJson(path, _config).catch(ERROR)
      break
    case '.js':
      const js = 'module.exports=' + JSON.stringify(_config, null, 2)
      await fs.outputFile(path, js).catch(ERROR)
      break
    default:
      ERROR('Not supported ext ', path)
  }
  return _config
}


function omitDeep (config, omits, depth = 100) {
  const _ = require('lodash')
  const _config = _.cloneDeep(config)
  if (omits) {
    const omitMap = new Map(omits.map(v => [v, true]))
    _omitDeepIter(_config, omitMap, 0, depth)
  }
  return _config
}


function _omitDeepIter(node, omits, depth, maxdepth) {
  if (depth > maxdepth) return
  if (Array.isArray(node)) return
  if (typeof node !== 'object') return
  Object.keys(node, key => {
    for (const omit of omits) {
      if (key === omit) {
        delete node[key]
        break
      } else {
        _omitDeepIter(node[key], omits, depth + 1, maxdepth)
      }
    }
  })
}

configWriter.omitList = [
  'source_dir',
  'target_dir',
  'extensions',
  'excludes',
  'internal',
  'path',
  'secrets'
]

configWriter.writeHidden = function (root, config, omits) {
  if (!omits) omits = configWriter.omitList
  const hidden = join(root, '.vuetalisk')
  configWriter(config, join(hidden, 'config.js'))
  const _config = configWriter(config, join(hidden, 'site.json'), omits) 
}

module.exports = configWriter
