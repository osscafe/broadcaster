const
  co = require('co'),
  Mustache = require('mustache'),
  fsp = require('fs-promise')

module.exports = co.wrap(function* (config) {
  const
    src = `${ config.root }/src/index.html`,
    dist = `${ config.output }/index.html`,
    input = yield fsp.readFile(src, 'utf8')

  yield fsp.writeFile(dist, Mustache.render(input, config))
})
