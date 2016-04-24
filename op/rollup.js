const
  co = require('co'),
  rollup = require('rollup').rollup,
  babel = require('rollup-plugin-babel'),
  json = require('rollup-plugin-json'),
  resolve = require('rollup-plugin-node-resolve'),
  commonjs = require('rollup-plugin-commonjs'),
  inject = require('rollup-plugin-inject'),
  riot = require('rollup-plugin-riot')

module.exports = co.wrap(function* (config) {
  try {
    const
      entry = `${ config.root }/src/index.js`,
      dest = `${ config.output }/index.js`,
      bundle = yield rollup({
        entry,
        external: ['riot'],
        plugins: [
          riot(),
          json(),
          inject({ 'config': config.filePath }),
          resolve({ jsnext: true,  main: true, browser: true }),
          commonjs(),
          babel()
        ]
      })

    yield bundle.write({
      format: 'iife',
      moduleName: 'app',
      globals: { riot: 'riot' },
      dest
    })
  } catch (err) {
    console.log(err)
  }
})
