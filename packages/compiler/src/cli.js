const fs = require('fs-extra');
const path = require('path');
const argv = require('yargs').argv;
const chokidar = require('chokidar');

const { compileAll, loadConfig } = require('./compiler');
const { findTags } = require('./tagFinder');

let cwd = process.cwd();
let conf = loadConfig(cwd);
let watch = argv.w || argv.watch || conf.watch;

console.log('removing .reasonql directory...');
const DEST_DIR = path.join(cwd, conf.src, `.reasonql`);
fs.ensureDirSync(DEST_DIR);
fs.removeSync(DEST_DIR);
fs.ensureDirSync(DEST_DIR);

compileAll(conf);

if(watch) {
  console.log('initializing watcher...');

  let include = Array.isArray(conf.include) ? conf.include : [conf.include];
  const patterns = include.map(inc => `${conf.src}/${inc}/*.re`);

  let gqlTags = {};

  chokidar.watch(patterns, {
    ignored: conf.exclude,
  })
  .on('add', path => {
    let code = fs.readFileSync(path).toString();
    let tags = findTags(code);
    gqlTags[path] = tags;
  })
  .on('change', path => {
    let code = fs.readFileSync(path).toString();
    let tags = findTags(code);
    let savedTags = gqlTags[path];

    let arrayEqual = (a1, a2) =>
      a1.length == a2.length &&
      a1.map((a, i) => a.template == a2[i].template)
      .reduce((result, current) => result && current, true);

    if (!arrayEqual(savedTags, tags)) {
      compileAll(conf);
      gqlTags[path] = tags;
    } else {
      console.log(`GraphQL code isn't changed.`);
    }
  })
  .on('unlink', path => {
    delete gqlTags[path];
  })
  .on('ready', () => {
    console.log('initial scan finished.');
  })
}