const
  co = require('co'),
  cpy = require('cpy')

module.exports = co.wrap(function* (config) {
  const files = [
    `${ config.root }/node_modules/riot-fa/dist/fa.woff`,
    `${ config.root }/node_modules/riot/riot.min.js`
  ]
  yield cpy(files, config.output)
})
