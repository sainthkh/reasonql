const argv = require('yargs').argv;
const chokidar = require('chokidar');

const { compileAll } = require('./compiler');

compileAll(process.cwd(), argv.w || argv.watch);