const
  co = require('co'),
  postcss = require('postcss'),
  postcssImport = require('postcss-import'),
  postcssUrl = require('postcss-url'),
  autoprefixer = require('autoprefixer'),
  cssnano = require('cssnano'),
  fsp = require('fs-promise')

module.exports = co.wrap(function* (config) {
  const
    from = `${ config.root }/src/global.css`,
    to = `${ config.output }/global.css`,
    css = yield fsp.readFile(from, 'utf8'),
    p = postcss()
      .use(postcssImport())
      .use(postcssUrl())
      .use(autoprefixer())
      .use(cssnano({ safe: true })),
    result = yield p.process(css, { from, to })

  yield fsp.writeFile(to, result.css)
})
