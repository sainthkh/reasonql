const fs = require('fs');
const path = require('path');

// Don't know why but lerna only copies the path to the command file. 
// Because of that, execution fails. 
// So, we're forcefully copying executable command file to the example projects.
const isDirectory = source => fs.statSync(source).isDirectory()
const getDirectories = source =>
  fs.readdirSync(source)
  .map(name => path.join(source, name))
  .filter(isDirectory)

getDirectories('./examples').forEach(dir => {
  fs.copyFileSync('./scripts/apollo-reasonml-compiler', path.join(dir, 'client/node_modules/.bin', 'apollo-reasonml-compiler'));
  fs.copyFileSync('./scripts/apollo-reasonml-compiler.cmd', path.join(dir, 'client/node_modules/.bin', 'apollo-reasonml-compiler.cmd'));
})