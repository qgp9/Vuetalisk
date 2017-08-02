const {join} = require('path')

async function removeEmptyDirectory(dir, exclues = []) {
  const excludesMap = new Map(excludes.map(v => [v, true]))
  await _removeEmtpyDirectoryIter(dir, excludesMap)
}

async function _removeEmtpyDirectoryIter(dir, exclude) {
  const files = fs.readdirSync(dir)
  let nfiles = 0
  for (const file of files) {
    nfiles++
    if (excludes.get(file)) continue
    const fullpath = path.join(dir, file)
    const stat = fs.statSync(fullpath)
    if(!stat.isDirectory()) continue
    const empty = await this.removeEmptyDirectory(fullpath)
      .catch(ERROR)
    if (empty) {
      fs.rmdirSync(fullpath)
      nfiles--
    }
  }
  if (nfiles > 0) return false
  return true
}

module.exports = removeEmptyDirectory
