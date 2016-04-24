#!/usr/bin/env node

const
  co = require('co'),
  chokidar = require('chokidar'),
  cli = require('cli'),
  fsp = require('fs-promise'),
  path = require('path'),
  build = require('../op/build')

co(function* () {
  const
    root = path.resolve(__dirname, '..'),
    options = cli.parse({
      config: ['c', 'A path to config', 'file', `${ root }/test/config.json`],
      watch: ['w', 'Watch the update of itself']
    }),
    filePath = path.resolve(process.cwd(), options.config),
    raw = JSON.parse(yield fsp.readFile(filePath, 'utf8')),
    output = path.resolve(process.cwd(), raw.output),
    config = Object.assign(raw, { root, output, filePath })

  yield fsp.mkdirs(output)

  if (options.watch) {
    chokidar.watch('src/**', {
      cwd: root,
      ignoreInitial: true
    }).on('all', (e, p) => {
      console.log(`Update detected: ${ p }`)
      build(config)
    })
  } else {
    build(config)
  }
})
