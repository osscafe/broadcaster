const
  co = require('co'),
  copy = require('../op/copy'),
  mustache = require('../op/mustache'),
  postcss = require('../op/postcss'),
  rollup = require('../op/rollup')

module.exports = co.wrap(function* (config) {
  yield copy(config)
  yield mustache(config)
  yield postcss(config)
  yield rollup(config)
})
