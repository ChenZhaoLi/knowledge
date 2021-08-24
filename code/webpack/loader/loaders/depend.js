const path = require('path')
const fs = require('fs')

module.exports = function(source) {
  var callback = this.async()
  var txtPath = path.resolve(__dirname, 'depend.txt')

  this.addDependency(txtPath)

  fs.readFile(txtPath, 'utf-8', function(err, header) {
    if (err) return callback(err)
    callback(null, `${header};${source}`)
  })
}
