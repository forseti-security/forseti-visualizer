#!/usr/bin/env node

// usage: ./yargs.js --hello morning --goodbye evening
// Reference: https://github.com/yargs/yargs/blob/HEAD/docs/api.md


// BASIC:
// const argv = require('yargs').argv

// if (argv.hello) {
//   console.log('command line arguments');
// }

// console.log(argv.hello);
// console.log(argv.goodbye);

// option/coerce
var argv = require('yargs')
  .option('user')
  .coerce('user', opt => {
    opt.name = opt.name.toLowerCase()
    opt.password = '[SECRET]'
    return opt
  })

  .option('name')
  .argv

console.log(argv)


// WEB SERVER EXAMPLE:
// node yargs.js serve --port 7070 -v
require('yargs') // eslint-disable-line
  .command('serve [port]', 'start the server', (yargs) => {
    yargs
      .positional('port', {
        describe: 'port to bind on',
        default: 5000
      })
  }, (argv) => {
    if (argv.verbose) console.info(`start server on :${argv.port}`)
    
    // serve(argv.port)
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging'
  })
  .argv