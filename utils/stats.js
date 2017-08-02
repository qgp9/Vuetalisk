function stat (filepath) {
  try {
    return {stat: fs.statSync(filepath)}
  } catch (e) {
    return {error: true, stat: {mtime: Date.now()}}
  }
}

stat.all = function (h) {
  return {
    nuxtDist: checkStat(h.pathNuxtDist),
    page:    checkStat(h.pathTarget('index.html')),
    api:      checkStat(join(h.root, '.site.json'))
  }
}

module.exports = stat
